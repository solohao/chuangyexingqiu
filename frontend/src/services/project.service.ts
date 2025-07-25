import { supabase } from '../config/supabase.config';
import { Tables } from '../types/supabase.types';
import {
  CollaborationPreference,
  LocationSettings,
  ServiceArea,
  ProjectGeolocation,
  GeoLocation,
  GeoSearchParams,
  ProjectWithLocation,
  ProjectMatch,
  DEFAULT_COLLABORATION_PREFERENCE,
  DEFAULT_LOCATION_SETTINGS,
  DEFAULT_SERVICE_AREA
} from '../types/geolocation.types';
import { GeocodeService } from './geocode.service';
import { CollaborationMatchingService } from './collaboration-matching.service';

// 扩展的项目创建数据接口，支持协作偏好
export interface CreateProjectData {
  title: string;
  description: string;
  content?: string;
  type: string;
  category: string;
  stage: string;
  
  // 基础地理位置信息
  location?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  province?: string;
  country?: string;
  
  // 协作相关设置
  location_type?: 'physical' | 'remote' | 'hybrid';
  collaboration_mode?: 'local_only' | 'remote_friendly' | 'location_flexible';
  max_collaboration_distance?: number;
  meeting_preference?: 'online' | 'offline' | 'both';
  timezone_flexibility?: boolean;
  collaboration_description?: string;
  location_visibility?: 'public' | 'city_only' | 'hidden';
  show_exact_address?: boolean;
  allow_contact_for_meetup?: boolean;
  service_area_type?: 'local' | 'regional' | 'national' | 'global';
  target_regions?: string[];
  service_area_description?: string;
  
  // 其他项目信息
  max_team_size?: number;
  seeking_roles?: string[];
  skills?: string[];
  tags?: string[];
  funding_stage?: string;
  funding_target?: number;
  logo_url?: string;
  cover_image_url?: string;
  images?: string[];
  video_url?: string;
  demo_url?: string;
  website_url?: string;
  contact_email?: string;
  contact_phone?: string;
  social_links?: Record<string, any>;
}

// 项目更新数据接口
export interface UpdateProjectData extends Partial<CreateProjectData> {
  progress_percentage?: number;
  status?: string;
  is_published?: boolean;
  is_featured?: boolean;
}

// 扩展的项目筛选接口，支持协作偏好筛选
export interface ProjectFilters {
  search?: string;
  type?: string;
  category?: string;
  stage?: string;
  status?: string;
  location?: string;
  skills?: string[];
  tags?: string[];
  funding_stage?: string;
  min_funding?: number;
  max_funding?: number;
  min_team_size?: number;
  max_team_size?: number;
  is_published?: boolean;
  is_featured?: boolean;
  
  // 协作相关筛选
  collaboration_mode?: 'local_only' | 'remote_friendly' | 'location_flexible' | 'all';
  location_type?: 'physical' | 'remote' | 'hybrid';
  meeting_preference?: 'online' | 'offline' | 'both';
  service_area_type?: 'local' | 'regional' | 'national' | 'global';
  max_distance?: number;
  user_location?: GeoLocation;
}

// 项目排序选项接口
export interface ProjectSortOptions {
  field: 'created_at' | 'updated_at' | 'views' | 'likes' | 'progress_percentage' | 'funding_raised';
  ascending?: boolean;
}

export class ProjectService {
  static async createProject(projectData: CreateProjectData): Promise<{
    project: Tables<'projects'> | null;
    error: any;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          project: null,
          error: { message: '用户未登录' }
        };
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      // 处理地理位置和协作偏好信息
      const { locationData, error: locationError } = await this.processProjectGeolocation(projectData);
      
      if (locationError) {
        console.warn('地理位置处理警告:', locationError.message);
        // 不阻断项目创建，继续使用原始数据
      }

      // 合并原始数据和处理后的位置数据
      const finalProjectData = {
        ...projectData,
        ...locationData,
        founder_id: user.id,
        founder_name: profile?.username || '未知用户',
        is_published: true, // 默认发布项目
        status: 'active', // 默认状态为活跃
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('projects')
        .insert(finalProjectData)
        .select()
        .single();

      if (error) {
        console.error('创建项目失败:', error);
        return { project: null, error };
      }

      // 创建项目成员记录
      await supabase
        .from('project_members')
        .insert({
          project_id: data.id,
          user_id: user.id,
          role: 'founder',
          permissions: ['all']
        });

      return { project: data, error: null };
    } catch (error) {
      console.error('创建项目异常:', error);
      return { project: null, error };
    }
  }
  static async getProjects(
    filters?: ProjectFilters,
    sort?: ProjectSortOptions,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    projects: Tables<'projects'>[];
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
        `, { count: 'exact' });

      if (filters) {
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
        }

        if (filters.type && filters.type !== 'all') {
          query = query.eq('type', filters.type);
        }

        if (filters.category && filters.category !== 'all') {
          query = query.eq('category', filters.category);
        }

        if (filters.stage && filters.stage !== 'all') {
          query = query.eq('stage', filters.stage);
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('status', filters.status);
        }

        if (filters.location) {
          query = query.or(`location.ilike.%${filters.location}%,city.ilike.%${filters.location}%,province.ilike.%${filters.location}%`);
        }

        if (filters.funding_stage && filters.funding_stage !== 'all') {
          query = query.eq('funding_stage', filters.funding_stage);
        }

        if (filters.min_funding !== undefined) {
          query = query.gte('funding_target', filters.min_funding);
        }

        if (filters.max_funding !== undefined) {
          query = query.lte('funding_target', filters.max_funding);
        }

        if (filters.min_team_size !== undefined) {
          query = query.gte('team_size', filters.min_team_size);
        }

        if (filters.max_team_size !== undefined) {
          query = query.lte('max_team_size', filters.max_team_size);
        }

        if (filters.skills && filters.skills.length > 0) {
          query = query.overlaps('skills', filters.skills);
        }

        if (filters.tags && filters.tags.length > 0) {
          query = query.overlaps('tags', filters.tags);
        }

        if (filters.is_published !== undefined) {
          query = query.eq('is_published', filters.is_published);
        }

        if (filters.is_featured !== undefined) {
          query = query.eq('is_featured', filters.is_featured);
        }
      }

      // 默认只显示已发布的项目，除非明确指定要显示未发布的
      // 临时修改：显示所有项目，包括 is_published 为 false/null 的项目
      if (filters?.is_published === false) {
        query = query.eq('is_published', false);
      } else if (filters?.is_published === true) {
        query = query.eq('is_published', true);
      } else {
        // 显示所有项目：已发布、未发布、或 null 状态的项目
        query = query.or('is_published.eq.true,is_published.eq.false,is_published.is.null');
      }

      if (sort) {
        query = query.order(sort.field, { ascending: sort.ascending ?? false });
      } else {
        query = query.order('created_at', { ascending: false });
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('获取项目列表失败:', error);
        return { projects: [], total: 0, error };
      }

      return {
        projects: data || [],
        total: count || 0,
        error: null
      };
    } catch (error) {
      console.error('获取项目列表异常:', error);
      return { projects: [], total: 0, error };
    }
  }
  static async getProject(projectId: string): Promise<{
    project: Tables<'projects'> | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          founder:profiles!projects_founder_id_fkey(
            id,
            username,
            full_name,
            avatar_url,
            bio,
            location,
            skills,
            rating
          ),
          members:project_members(
            id,
            role,
            permissions,
            joined_at,
            user:profiles(
              id,
              username,
              full_name,
              avatar_url,
              skills
            )
          ),
          updates:project_updates(
            id,
            title,
            content,
            type,
            is_public,
            created_at,
            author:profiles(
              id,
              username,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', projectId)
        .single();

      if (error) {
        console.error('获取项目详情失败:', error);
        return { project: null, error };
      }

      await supabase
        .from('projects')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', projectId);

      return { project: data, error: null };
    } catch (error) {
      console.error('获取项目详情异常:', error);
      return { project: null, error };
    }
  }

  static async updateProject(
    projectId: string,
    updateData: UpdateProjectData
  ): Promise<{
    project: Tables<'projects'> | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('更新项目失败:', error);
        return { project: null, error };
      }

      return { project: data, error: null };
    } catch (error) {
      console.error('更新项目异常:', error);
      return { project: null, error };
    }
  }

  static async deleteProject(projectId: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) {
        console.error('删除项目失败:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('删除项目异常:', error);
      return { error };
    }
  }

  static async likeProject(projectId: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { error: { message: '用户未登录' } };
      }

      const { data: existingLike } = await supabase
        .from('project_likes')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (existingLike) {
        const { error: deleteError } = await supabase
          .from('project_likes')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);

        if (deleteError) {
          return { error: deleteError };
        }

        const { error: updateError } = await supabase.rpc('decrement_project_likes', {
          project_id: projectId
        });

        return { error: updateError };
      } else {
        const { error: insertError } = await supabase
          .from('project_likes')
          .insert({
            project_id: projectId,
            user_id: user.id
          });

        if (insertError) {
          return { error: insertError };
        }

        const { error: updateError } = await supabase.rpc('increment_project_likes', {
          project_id: projectId
        });

        return { error: updateError };
      }
    } catch (error) {
      console.error('点赞项目异常:', error);
      return { error };
    }
  }

  static async bookmarkProject(projectId: string): Promise<{ error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { error: { message: '用户未登录' } };
      }

      const { data: existingBookmark } = await supabase
        .from('project_bookmarks')
        .select('id')
        .eq('project_id', projectId)
        .eq('user_id', user.id)
        .single();

      if (existingBookmark) {
        const { error: deleteError } = await supabase
          .from('project_bookmarks')
          .delete()
          .eq('project_id', projectId)
          .eq('user_id', user.id);

        if (deleteError) {
          return { error: deleteError };
        }

        const { error: updateError } = await supabase.rpc('decrement_project_bookmarks', {
          project_id: projectId
        });

        return { error: updateError };
      } else {
        const { error: insertError } = await supabase
          .from('project_bookmarks')
          .insert({
            project_id: projectId,
            user_id: user.id
          });

        if (insertError) {
          return { error: insertError };
        }

        const { error: updateError } = await supabase.rpc('increment_project_bookmarks', {
          project_id: projectId
        });

        return { error: updateError };
      }
    } catch (error) {
      console.error('收藏项目异常:', error);
      return { error };
    }
  }

  static async applyToProject(
    projectId: string,
    role: string,
    message?: string
  ): Promise<{ error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { error: { message: '用户未登录' } };
      }

      const { data: existingApplication } = await supabase
        .from('project_applications')
        .select('id')
        .eq('project_id', projectId)
        .eq('applicant_id', user.id)
        .single();

      if (existingApplication) {
        return { error: { message: '您已经申请过该项目' } };
      }

      const { error } = await supabase
        .from('project_applications')
        .insert({
          project_id: projectId,
          applicant_id: user.id,
          role,
          message,
          status: 'pending'
        });

      if (error) {
        console.error('申请加入项目失败:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('申请加入项目异常:', error);
      return { error };
    }
  }

  static async getUserProjects(userId?: string): Promise<{
    projects: Tables<'projects'>[];
    error: any;
  }> {
    try {
      let targetUserId = userId;

      if (!targetUserId) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          return { projects: [], error: { message: '用户未登录' } };
        }
        targetUserId = user.id;
      }

      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('founder_id', targetUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取用户项目列表失败:', error);
        return { projects: [], error };
      }

      return { projects: data || [], error: null };
    } catch (error) {
      console.error('获取用户项目列表异常:', error);
      return { projects: [], error };
    }
  }

  static async getUserBookmarkedProjects(): Promise<{
    projects: Tables<'projects'>[];
    error: any;
  }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { projects: [], error: { message: '用户未登录' } };
      }

      const { data, error } = await supabase
        .from('project_bookmarks')
        .select(`
          created_at,
          project:projects(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取收藏项目失败:', error);
        return { projects: [], error };
      }

      const projects: Tables<'projects'>[] = [];
      if (data) {
        for (const item of data) {
          if (item.project) {
            projects.push(item.project as unknown as Tables<'projects'>);
          }
        }
      }
      return { projects, error: null };
    } catch (error) {
      console.error('获取收藏项目异常:', error);
      return { projects: [], error };
    }
  }

  static async uploadProjectImage(
    projectId: string,
    file: File,
    type: 'logo' | 'cover' | 'gallery' = 'gallery'
  ): Promise<{
    url: string | null;
    error: any;
  }> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('上传项目图片失败:', uploadError);
        return { url: null, error: uploadError };
      }

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      return { url: data.publicUrl, error: null };
    } catch (error) {
      console.error('上传项目图片异常:', error);
      return { url: null, error };
    }
  }

  static async createProjectUpdate(
    projectId: string,
    title: string,
    content: string,
    type: string = 'general',
    isPublic: boolean = true
  ): Promise<{ error: any }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return { error: { message: '用户未登录' } };
      }

      const { error } = await supabase
        .from('project_updates')
        .insert({
          project_id: projectId,
          author_id: user.id,
          title,
          content,
          type,
          is_public: isPublic
        });

      if (error) {
        console.error('发布项目更新失败:', error);
        return { error };
      }

      return { error: null };
    } catch (error) {
      console.error('发布项目更新异常:', error);
      return { error };
    }
  }

  // ==================== 协作导向的地理位置功能 ====================

  /**
   * 处理项目地理位置信息，包括地址解析和协作偏好设置
   */
  static async processProjectGeolocation(projectData: CreateProjectData): Promise<{
    locationData: Partial<CreateProjectData>;
    error: any;
  }> {
    try {
      const locationData: Partial<CreateProjectData> = {};

      // 如果提供了地址，进行地理编码
      if (projectData.location) {
        const geocodeResult = await GeocodeService.geocodeAddress(projectData.location);
        
        if (geocodeResult.location && !geocodeResult.error) {
          locationData.latitude = geocodeResult.location.latitude;
          locationData.longitude = geocodeResult.location.longitude;
          locationData.location = geocodeResult.formattedAddress;
          locationData.city = geocodeResult.components.city;
          locationData.province = geocodeResult.components.province;
          locationData.country = geocodeResult.components.country || '中国';
        } else if (geocodeResult.error) {
          console.warn('地址解析失败:', geocodeResult.error.message);
          // 不阻断项目创建，只记录警告
        }
      }

      // 设置协作偏好默认值
      locationData.location_type = projectData.location_type || DEFAULT_LOCATION_SETTINGS.type;
      locationData.collaboration_mode = projectData.collaboration_mode || DEFAULT_COLLABORATION_PREFERENCE.mode;
      locationData.max_collaboration_distance = projectData.max_collaboration_distance || DEFAULT_COLLABORATION_PREFERENCE.maxDistance;
      locationData.meeting_preference = projectData.meeting_preference || DEFAULT_COLLABORATION_PREFERENCE.meetingPreference;
      locationData.timezone_flexibility = projectData.timezone_flexibility ?? DEFAULT_COLLABORATION_PREFERENCE.timeZoneFlexibility;
      locationData.location_visibility = projectData.location_visibility || DEFAULT_LOCATION_SETTINGS.visibility;
      locationData.show_exact_address = projectData.show_exact_address ?? DEFAULT_LOCATION_SETTINGS.showExactAddress;
      locationData.allow_contact_for_meetup = projectData.allow_contact_for_meetup ?? DEFAULT_LOCATION_SETTINGS.allowContactForMeetup;
      locationData.service_area_type = projectData.service_area_type || DEFAULT_SERVICE_AREA.type;
      locationData.target_regions = projectData.target_regions || [];

      return { locationData, error: null };

    } catch (error) {
      console.error('处理项目地理位置信息失败:', error);
      return { 
        locationData: {}, 
        error: { message: '地理位置处理失败', originalError: error }
      };
    }
  }

  /**
   * 基于协作偏好搜索项目
   */
  static async searchProjectsByCollaboration(
    searchParams: GeoSearchParams,
    page: number = 1,
    limit: number = 20
  ): Promise<{
    projects: ProjectWithLocation[];
    matches: ProjectMatch[];
    total: number;
    error: any;
  }> {
    try {
      // 使用协作匹配服务进行搜索
      const result = await CollaborationMatchingService.searchProjectsByCollaboration(searchParams);
      
      if (result.error) {
        return {
          projects: [],
          matches: [],
          total: 0,
          error: result.error
        };
      }

      // 分页处理
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedMatches = result.matches.slice(startIndex, endIndex);

      return {
        projects: paginatedMatches.map(match => match.project),
        matches: paginatedMatches,
        total: result.total,
        error: null
      };

    } catch (error) {
      console.error('协作项目搜索失败:', error);
      return {
        projects: [],
        matches: [],
        total: 0,
        error
      };
    }
  }

  /**
   * 获取用户的协作推荐项目
   */
  static async getCollaborationRecommendations(
    userId: string,
    userLocation?: GeoLocation,
    limit: number = 10
  ): Promise<{
    recommendations: ProjectMatch[];
    reasons: any[];
    error: any;
  }> {
    try {
      const result = await CollaborationMatchingService.getSmartRecommendations(
        userId,
        userLocation,
        limit
      );

      return result;

    } catch (error) {
      console.error('获取协作推荐失败:', error);
      return {
        recommendations: [],
        reasons: [],
        error
      };
    }
  }

  /**
   * 分析项目协作可行性
   */
  static async analyzeCollaborationFeasibility(
    projectId: string,
    userLocation: GeoLocation,
    userPreferences: CollaborationPreference
  ): Promise<{
    feasible: boolean;
    score: number;
    factors: any[];
    suggestions: string[];
    error: any;
  }> {
    try {
      // 获取项目详情
      const { project, error: projectError } = await this.getProject(projectId);
      
      if (projectError || !project) {
        return {
          feasible: false,
          score: 0,
          factors: [],
          suggestions: [],
          error: projectError || { message: '项目不存在' }
        };
      }

      // 转换为ProjectWithLocation格式
      const projectWithLocation: ProjectWithLocation = {
        ...project,
        status: project.status || 'active',
        geolocation: this.convertToProjectGeolocation(project)
      } as ProjectWithLocation;

      // 使用协作匹配服务分析可行性
      const analysis = CollaborationMatchingService.analyzeCollaborationFeasibility(
        projectWithLocation,
        userLocation,
        userPreferences
      );

      return {
        ...analysis,
        error: null
      };

    } catch (error) {
      console.error('协作可行性分析失败:', error);
      return {
        feasible: false,
        score: 0,
        factors: [],
        suggestions: [],
        error
      };
    }
  }

  /**
   * 更新项目的协作偏好
   */
  static async updateProjectCollaborationPreference(
    projectId: string,
    collaborationData: {
      collaboration_mode?: 'local_only' | 'remote_friendly' | 'location_flexible';
      max_collaboration_distance?: number;
      meeting_preference?: 'online' | 'offline' | 'both';
      timezone_flexibility?: boolean;
      collaboration_description?: string;
      location_visibility?: 'public' | 'city_only' | 'hidden';
      show_exact_address?: boolean;
      allow_contact_for_meetup?: boolean;
    }
  ): Promise<{
    project: Tables<'projects'> | null;
    error: any;
  }> {
    try {
      const { data, error } = await supabase
        .from('projects')
        .update({
          ...collaborationData,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .select()
        .single();

      if (error) {
        console.error('更新项目协作偏好失败:', error);
        return { project: null, error };
      }

      return { project: data, error: null };

    } catch (error) {
      console.error('更新项目协作偏好异常:', error);
      return { project: null, error };
    }
  }

  /**
   * 批量验证和更新项目地理位置信息
   */
  static async batchUpdateProjectLocations(projectIds: string[]): Promise<{
    updated: number;
    failed: number;
    errors: any[];
  }> {
    try {
      let updated = 0;
      let failed = 0;
      const errors: any[] = [];

      for (const projectId of projectIds) {
        try {
          // 获取项目信息
          const { project, error: getError } = await this.getProject(projectId);
          
          if (getError || !project || !project.location) {
            failed++;
            errors.push({ projectId, error: getError || '缺少地址信息' });
            continue;
          }

          // 重新进行地理编码
          const geocodeResult = await GeocodeService.geocodeAddress(project.location);
          
          if (geocodeResult.location && !geocodeResult.error) {
            // 更新项目位置信息
            const { error: updateError } = await supabase
              .from('projects')
              .update({
                latitude: geocodeResult.location.latitude,
                longitude: geocodeResult.location.longitude,
                location: geocodeResult.formattedAddress,
                city: geocodeResult.components.city,
                province: geocodeResult.components.province,
                country: geocodeResult.components.country || '中国',
                updated_at: new Date().toISOString()
              })
              .eq('id', projectId);

            if (updateError) {
              failed++;
              errors.push({ projectId, error: updateError });
            } else {
              updated++;
            }
          } else {
            failed++;
            errors.push({ projectId, error: geocodeResult.error });
          }

          // 避免API限流
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          failed++;
          errors.push({ projectId, error });
        }
      }

      return { updated, failed, errors };

    } catch (error) {
      console.error('批量更新项目位置失败:', error);
      return { updated: 0, failed: projectIds.length, errors: [error] };
    }
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 将数据库项目记录转换为ProjectGeolocation格式
   */
  private static convertToProjectGeolocation(project: Tables<'projects'>): ProjectGeolocation | undefined {
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
        type: (project as any).location_type || DEFAULT_LOCATION_SETTINGS.type,
        visibility: (project as any).location_visibility || DEFAULT_LOCATION_SETTINGS.visibility,
        showExactAddress: (project as any).show_exact_address ?? DEFAULT_LOCATION_SETTINGS.showExactAddress,
        allowContactForMeetup: (project as any).allow_contact_for_meetup ?? DEFAULT_LOCATION_SETTINGS.allowContactForMeetup
      },
      collaborationPreference: {
        mode: (project as any).collaboration_mode || DEFAULT_COLLABORATION_PREFERENCE.mode,
        maxDistance: (project as any).max_collaboration_distance || DEFAULT_COLLABORATION_PREFERENCE.maxDistance,
        meetingPreference: (project as any).meeting_preference || DEFAULT_COLLABORATION_PREFERENCE.meetingPreference,
        timeZoneFlexibility: (project as any).timezone_flexibility ?? DEFAULT_COLLABORATION_PREFERENCE.timeZoneFlexibility,
        description: (project as any).collaboration_description || ''
      },
      serviceArea: {
        type: (project as any).service_area_type || DEFAULT_SERVICE_AREA.type,
        targetRegions: (project as any).target_regions || [],
        description: (project as any).service_area_description || ''
      },
      accuracy: 'medium',
      source: 'user_input',
      lastVerified: project.updated_at || project.created_at || new Date().toISOString(),
      createdAt: project.created_at || new Date().toISOString(),
      updatedAt: project.updated_at || new Date().toISOString()
    };
  }
}