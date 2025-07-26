// 协作匹配相关的数据库查询服务

import { supabase } from '../config/supabase.config';
import { 
  GeoLocation, 
  ProjectWithLocation, 
  GeoSearchParams,
  CollaborationPreference 
} from '../types/geolocation.types';

export class CollaborationDatabaseService {
  
  /**
   * 创建地理位置相关的数据库索引和函数
   * 这些SQL函数需要在数据库中执行
   */
  static readonly SPATIAL_FUNCTIONS = {
    // 计算两点间距离的函数（使用Haversine公式）
    CREATE_DISTANCE_FUNCTION: `
      CREATE OR REPLACE FUNCTION calculate_distance(
        lat1 FLOAT,
        lon1 FLOAT,
        lat2 FLOAT,
        lon2 FLOAT
      ) RETURNS FLOAT AS $$
      DECLARE
        R FLOAT := 6371; -- 地球半径（公里）
        dLat FLOAT;
        dLon FLOAT;
        a FLOAT;
        c FLOAT;
      BEGIN
        dLat := radians(lat2 - lat1);
        dLon := radians(lon2 - lon1);
        a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
        c := 2 * atan2(sqrt(a), sqrt(1-a));
        RETURN R * c;
      END;
      $$ LANGUAGE plpgsql;
    `,

    // 获取附近项目的函数
    CREATE_NEARBY_PROJECTS_FUNCTION: `
      CREATE OR REPLACE FUNCTION get_nearby_projects(
        center_lat FLOAT,
        center_lng FLOAT,
        radius_km FLOAT DEFAULT 10,
        collaboration_mode TEXT DEFAULT NULL,
        location_type TEXT DEFAULT NULL
      )
      RETURNS TABLE (
        project_id UUID,
        distance_km FLOAT,
        collaboration_score INTEGER
      ) AS $$
      BEGIN
        RETURN QUERY
        SELECT 
          p.id,
          calculate_distance(center_lat, center_lng, p.latitude, p.longitude) AS distance_km,
          CASE 
            WHEN p.collaboration_mode = collaboration_mode THEN 100
            WHEN p.collaboration_mode = 'location_flexible' OR collaboration_mode = 'location_flexible' THEN 80
            WHEN p.collaboration_mode = 'remote_friendly' AND collaboration_mode = 'remote_friendly' THEN 90
            ELSE 50
          END AS collaboration_score
        FROM projects p
        WHERE p.latitude IS NOT NULL 
          AND p.longitude IS NOT NULL
          AND p.is_published = true
          AND p.status = 'active'
          AND calculate_distance(center_lat, center_lng, p.latitude, p.longitude) <= radius_km
          AND (collaboration_mode IS NULL OR p.collaboration_mode = collaboration_mode OR p.collaboration_mode = 'location_flexible')
          AND (location_type IS NULL OR p.location_type = location_type)
        ORDER BY distance_km, collaboration_score DESC;
      END;
      $$ LANGUAGE plpgsql;
    `,

    // 创建地理位置索引
    CREATE_LOCATION_INDEX: `
      CREATE INDEX IF NOT EXISTS idx_projects_location 
      ON projects (latitude, longitude) 
      WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
    `,

    // 创建协作模式索引
    CREATE_COLLABORATION_INDEX: `
      CREATE INDEX IF NOT EXISTS idx_projects_collaboration 
      ON projects (collaboration_mode, location_type, is_published, status);
    `,

    // 创建复合索引用于地理搜索
    CREATE_GEO_SEARCH_INDEX: `
      CREATE INDEX IF NOT EXISTS idx_projects_geo_search 
      ON projects (city, province, collaboration_mode, location_type) 
      WHERE is_published = true AND status = 'active';
    `
  };

  /**
   * 初始化数据库函数和索引
   */
  static async initializeSpatialFunctions(): Promise<{ success: boolean; error: any }> {
    try {
      // 创建距离计算函数
      const { error: distanceError } = await supabase.rpc('exec_sql', {
        sql: this.SPATIAL_FUNCTIONS.CREATE_DISTANCE_FUNCTION
      });

      if (distanceError) {
        console.error('创建距离函数失败:', distanceError);
      }

      // 创建附近项目查询函数
      const { error: nearbyError } = await supabase.rpc('exec_sql', {
        sql: this.SPATIAL_FUNCTIONS.CREATE_NEARBY_PROJECTS_FUNCTION
      });

      if (nearbyError) {
        console.error('创建附近项目函数失败:', nearbyError);
      }

      // 创建索引
      const indexes = [
        this.SPATIAL_FUNCTIONS.CREATE_LOCATION_INDEX,
        this.SPATIAL_FUNCTIONS.CREATE_COLLABORATION_INDEX,
        this.SPATIAL_FUNCTIONS.CREATE_GEO_SEARCH_INDEX
      ];

      for (const indexSql of indexes) {
        const { error: indexError } = await supabase.rpc('exec_sql', {
          sql: indexSql
        });

        if (indexError) {
          console.error('创建索引失败:', indexError);
        }
      }

      return { success: true, error: null };

    } catch (error) {
      console.error('初始化空间函数失败:', error);
      return { success: false, error };
    }
  }

  /**
   * 使用数据库函数查询附近的项目
   */
  static async queryNearbyProjects(
    center: GeoLocation,
    radius: number = 10,
    collaborationMode?: string,
    locationType?: string
  ): Promise<{
    projects: any[];
    error: any;
  }> {
    try {
      const { data, error } = await supabase.rpc('get_nearby_projects', {
        center_lat: center.latitude,
        center_lng: center.longitude,
        radius_km: radius,
        collaboration_mode: collaborationMode || null,
        location_type: locationType || null
      });

      if (error) {
        console.error('查询附近项目失败:', error);
        return { projects: [], error };
      }

      return { projects: data || [], error: null };

    } catch (error) {
      console.error('查询附近项目异常:', error);
      return { projects: [], error };
    }
  }

  /**
   * 基于协作偏好查询兼容的项目
   */
  static async queryCompatibleProjects(
    userPreferences: CollaborationPreference,
    userLocation?: GeoLocation,
    limit: number = 20
  ): Promise<{
    projects: ProjectWithLocation[];
    error: any;
  }> {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          founder:profiles!projects_founder_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('is_published', true)
        .eq('status', 'active');

      // 根据协作模式筛选
      if (userPreferences.mode === 'local_only') {
        query = query.in('collaboration_mode', ['local_only', 'location_flexible']);
      } else if (userPreferences.mode === 'remote_friendly') {
        query = query.in('collaboration_mode', ['remote_friendly', 'location_flexible']);
      }

      // 根据会议偏好筛选
      if (userPreferences.meetingPreference !== 'both') {
        query = query.or(`meeting_preference.eq.${userPreferences.meetingPreference},meeting_preference.eq.both`);
      }

      // 如果有位置信息，优先显示附近的项目
      if (userLocation) {
        // 这里可以添加地理位置排序逻辑
        query = query.not('latitude', 'is', null).not('longitude', 'is', null);
      }

      query = query.limit(limit).order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error('查询兼容项目失败:', error);
        return { projects: [], error };
      }

      // 转换为ProjectWithLocation格式
      const projects: ProjectWithLocation[] = (data || []).map((project: any) => ({
        ...project,
        geolocation: this.convertToProjectGeolocation(project),
        distance: userLocation && project.latitude && project.longitude
          ? this.calculateDistance(
              userLocation,
              { latitude: project.latitude, longitude: project.longitude }
            )
          : undefined
      }));

      return { projects, error: null };

    } catch (error) {
      console.error('查询兼容项目异常:', error);
      return { projects: [], error };
    }
  }

  /**
   * 基于地理搜索参数查询项目
   */
  static async queryProjectsByGeoSearch(
    searchParams: GeoSearchParams,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    projects: ProjectWithLocation[];
    total: number;
    error: any;
  }> {
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          founder:profiles!projects_founder_id_fkey(
            id,
            username,
            full_name,
            avatar_url
          )
        `, { count: 'exact' })
        .eq('is_published', true)
        .eq('status', 'active');

      // 文本搜索
      if (searchParams.query) {
        query = query.or(`title.ilike.%${searchParams.query}%,description.ilike.%${searchParams.query}%`);
      }

      // 城市筛选
      if (searchParams.city) {
        query = query.ilike('city', `%${searchParams.city}%`);
      }

      // 省份筛选
      if (searchParams.province) {
        query = query.ilike('province', `%${searchParams.province}%`);
      }

      // 协作模式筛选
      if (searchParams.collaborationMode && searchParams.collaborationMode !== 'all') {
        query = query.eq('collaboration_mode', searchParams.collaborationMode);
      }

      // 位置类型筛选
      if (searchParams.locationType) {
        query = query.eq('location_type', searchParams.locationType);
      }

      // 会议偏好筛选
      if (searchParams.meetingPreference) {
        query = query.or(`meeting_preference.eq.${searchParams.meetingPreference},meeting_preference.eq.both`);
      }

      // 服务区域类型筛选
      if (searchParams.serviceAreaType) {
        query = query.eq('service_area_type', searchParams.serviceAreaType);
      }

      // 分页
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      // 排序
      query = query.order('created_at', { ascending: false });

      const { data, error, count } = await query;

      if (error) {
        console.error('地理搜索失败:', error);
        return { projects: [], total: 0, error };
      }

      // 转换为ProjectWithLocation格式并计算距离
      const projects: ProjectWithLocation[] = (data || []).map((project: any) => {
        const projectWithLocation: ProjectWithLocation = {
          ...project,
          geolocation: this.convertToProjectGeolocation(project)
        };

        // 如果有搜索中心点，计算距离
        if (searchParams.center && project.latitude && project.longitude) {
          projectWithLocation.distance = this.calculateDistance(
            searchParams.center,
            { latitude: project.latitude, longitude: project.longitude }
          );
        }

        return projectWithLocation;
      });

      // 如果有距离信息，按距离排序
      if (searchParams.center && searchParams.radius) {
        const filteredProjects = projects.filter(p => 
          p.distance !== undefined && p.distance <= searchParams.radius!
        );
        filteredProjects.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        
        return {
          projects: filteredProjects,
          total: filteredProjects.length,
          error: null
        };
      }

      return {
        projects,
        total: count || 0,
        error: null
      };

    } catch (error) {
      console.error('地理搜索异常:', error);
      return { projects: [], total: 0, error };
    }
  }

  /**
   * 获取协作统计数据
   */
  static async getCollaborationStats(): Promise<{
    stats: {
      totalProjects: number;
      localProjects: number;
      remoteProjects: number;
      hybridProjects: number;
      citiesCount: number;
      avgCollaborationDistance: number;
    };
    error: any;
  }> {
    try {
      // 获取基础统计
      const { data: totalData, error: totalError } = await supabase
        .from('projects')
        .select('id', { count: 'exact' })
        .eq('is_published', true)
        .eq('status', 'active');

      if (totalError) {
        return { stats: this.getEmptyStats(), error: totalError };
      }

      // 按协作模式统计
      const { data: modeStats, error: modeError } = await supabase
        .from('projects')
        .select('collaboration_mode')
        .eq('is_published', true)
        .eq('status', 'active');

      if (modeError) {
        return { stats: this.getEmptyStats(), error: modeError };
      }

      // 统计城市数量
      const { data: cityData, error: cityError } = await supabase
        .from('projects')
        .select('city')
        .eq('is_published', true)
        .eq('status', 'active')
        .not('city', 'is', null);

      if (cityError) {
        return { stats: this.getEmptyStats(), error: cityError };
      }

      // 计算统计数据
      const totalProjects = totalData?.length || 0;
      const localProjects = modeStats?.filter((p: any) => p.collaboration_mode === 'local_only').length || 0;
      const remoteProjects = modeStats?.filter((p: any) => p.collaboration_mode === 'remote_friendly').length || 0;
      const hybridProjects = modeStats?.filter((p: any) => p.collaboration_mode === 'location_flexible').length || 0;
      const citiesCount = new Set(cityData?.map((p: any) => p.city).filter(Boolean)).size;

      // 计算平均协作距离（简化计算）
      const { data: distanceData } = await supabase
        .from('projects')
        .select('max_collaboration_distance')
        .eq('is_published', true)
        .eq('status', 'active')
        .not('max_collaboration_distance', 'is', null);

      const avgCollaborationDistance = distanceData?.length 
        ? distanceData.reduce((sum, p) => sum + (p.max_collaboration_distance || 0), 0) / distanceData.length
        : 0;

      return {
        stats: {
          totalProjects,
          localProjects,
          remoteProjects,
          hybridProjects,
          citiesCount,
          avgCollaborationDistance: Math.round(avgCollaborationDistance)
        },
        error: null
      };

    } catch (error) {
      console.error('获取协作统计失败:', error);
      return { stats: this.getEmptyStats(), error };
    }
  }

  // 私有辅助方法

  private static getEmptyStats() {
    return {
      totalProjects: 0,
      localProjects: 0,
      remoteProjects: 0,
      hybridProjects: 0,
      citiesCount: 0,
      avgCollaborationDistance: 0
    };
  }

  private static calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
    const R = 6371; // 地球半径（公里）
    const dLat = this.toRadians(point2.latitude - point1.latitude);
    const dLon = this.toRadians(point2.longitude - point1.longitude);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.latitude)) * Math.cos(this.toRadians(point2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private static convertToProjectGeolocation(project: any): any {
    if (!project.latitude || !project.longitude) {
      return undefined;
    }

    return {
      id: `geo_${project.id}`,
      projectId: project.id,
      location: {
        latitude: project.latitude,
        longitude: project.longitude
      },
      address: project.location || '',
      formattedAddress: project.location || '',
      components: {
        country: project.country || '中国',
        province: project.province || '',
        city: project.city || '',
        district: '',
        street: '',
        streetNumber: '',
        postalCode: ''
      },
      locationSettings: {
        type: project.location_type || 'hybrid',
        visibility: project.location_visibility || 'city_only',
        showExactAddress: project.show_exact_address ?? false,
        allowContactForMeetup: project.allow_contact_for_meetup ?? true
      },
      collaborationPreference: {
        mode: project.collaboration_mode || 'location_flexible',
        maxDistance: project.max_collaboration_distance || 50,
        meetingPreference: project.meeting_preference || 'both',
        timeZoneFlexibility: project.timezone_flexibility ?? true,
        description: project.collaboration_description || ''
      },
      serviceArea: {
        type: project.service_area_type || 'regional',
        targetRegions: project.target_regions || [],
        description: project.service_area_description || ''
      },
      accuracy: 'medium',
      source: 'user_input',
      lastVerified: project.updated_at || project.created_at || new Date().toISOString(),
      createdAt: project.created_at || new Date().toISOString(),
      updatedAt: project.updated_at || new Date().toISOString()
    };
  }
}