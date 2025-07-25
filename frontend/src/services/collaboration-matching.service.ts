// 智能协作匹配服务

import {
  GeoLocation,
  CollaborationPreference,
  ProjectWithLocation,
  ProjectMatch,
  GeoSearchParams,
  RecommendationReason,
  FeasibilityFactor,
  CollaborationMatchConfig,
  COLLABORATION_MODES,
  MEETING_PREFERENCES
} from '../types/geolocation.types';

export interface LocationSearchService {
  calculateDistance(point1: GeoLocation, point2: GeoLocation): number;
  isPointInBounds(point: GeoLocation, bounds: any): boolean;
}

export class CollaborationMatchingService {
  // 默认匹配配置
  private static readonly DEFAULT_CONFIG: CollaborationMatchConfig = {
    locationWeight: 0.4,
    collaborationModeWeight: 0.3,
    meetingPreferenceWeight: 0.2,
    timeZoneWeight: 0.1,
    maxDistance: 100, // 100公里
    minScore: 30 // 最低30分才推荐
  };

  /**
   * 基于地理位置和协作偏好搜索项目
   */
  static async searchProjectsByCollaboration(params: GeoSearchParams): Promise<{
    projects: ProjectWithLocation[];
    matches: ProjectMatch[];
    total: number;
    error: any;
  }> {
    try {
      // 这里应该调用实际的项目搜索API
      // 暂时使用模拟数据进行演示
      const mockProjects = await this.getMockProjects();
      
      let filteredProjects = mockProjects;

      // 按协作模式筛选
      if (params.collaborationMode && params.collaborationMode !== 'all') {
        filteredProjects = filteredProjects.filter(project => 
          project.geolocation?.collaborationPreference.mode === params.collaborationMode
        );
      }

      // 按位置类型筛选
      if (params.locationType) {
        filteredProjects = filteredProjects.filter(project =>
          project.geolocation?.locationSettings.type === params.locationType
        );
      }

      // 按地理位置筛选
      if (params.center && params.radius) {
        filteredProjects = filteredProjects.filter(project => {
          if (!project.geolocation?.location) return false;
          const distance = this.calculateDistance(params.center!, project.geolocation.location);
          return distance <= params.radius!;
        });
      }

      // 按城市筛选
      if (params.city) {
        filteredProjects = filteredProjects.filter(project =>
          project.geolocation?.components.city?.includes(params.city!)
        );
      }

      // 生成匹配结果
      const matches: ProjectMatch[] = filteredProjects.map(project => {
        const matchScore = this.calculateBasicMatchScore(project, params);
        const distance = params.center && project.geolocation?.location 
          ? this.calculateDistance(params.center, project.geolocation.location)
          : undefined;

        return {
          project,
          matchScore,
          distance,
          collaborationCompatibility: matchScore,
          reasons: this.generateMatchReasons(project, params)
        };
      });

      // 按匹配分数排序
      matches.sort((a, b) => b.matchScore - a.matchScore);

      return {
        projects: filteredProjects,
        matches,
        total: matches.length,
        error: null
      };

    } catch (error) {
      return {
        projects: [],
        matches: [],
        total: 0,
        error
      };
    }
  }

  /**
   * 获取协作兼容的附近项目
   */
  static async getCompatibleNearbyProjects(
    userLocation: GeoLocation,
    userPreferences: CollaborationPreference,
    radius: number = 10
  ): Promise<{
    projects: ProjectMatch[];
    error: any;
  }> {
    try {
      const mockProjects = await this.getMockProjects();
      
      const nearbyProjects = mockProjects.filter(project => {
        if (!project.geolocation?.location) return false;
        const distance = this.calculateDistance(userLocation, project.geolocation.location);
        return distance <= radius;
      });

      const matches: ProjectMatch[] = nearbyProjects.map(project => {
        const collaborationScore = this.calculateCollaborationScore(
          project, 
          userPreferences, 
          userLocation
        );

        const distance = this.calculateDistance(userLocation, project.geolocation!.location);

        return {
          project,
          matchScore: collaborationScore,
          distance,
          collaborationCompatibility: collaborationScore,
          reasons: this.generateCollaborationReasons(project, userPreferences, userLocation)
        };
      });

      // 过滤低分项目并排序
      const filteredMatches = matches
        .filter(match => match.matchScore >= this.DEFAULT_CONFIG.minScore)
        .sort((a, b) => b.matchScore - a.matchScore);

      return {
        projects: filteredMatches,
        error: null
      };

    } catch (error) {
      return {
        projects: [],
        error
      };
    }
  }

  /**
   * 智能项目推荐（基于位置和协作模式）
   */
  static async getSmartRecommendations(
    userId: string,
    userLocation?: GeoLocation,
    limit: number = 10
  ): Promise<{
    recommendations: ProjectMatch[];
    reasons: RecommendationReason[];
    error: any;
  }> {
    try {
      // 获取用户的协作偏好（实际应用中从数据库获取）
      const userPreferences = await this.getUserPreferences(userId);
      const mockProjects = await this.getMockProjects();

      const recommendations: ProjectMatch[] = [];

      for (const project of mockProjects) {
        if (!project.geolocation) continue;

        const matchScore = userLocation 
          ? this.calculateCollaborationScore(project, userPreferences, userLocation)
          : this.calculateCollaborationScore(project, userPreferences);

        if (matchScore >= this.DEFAULT_CONFIG.minScore) {
          const distance = userLocation && project.geolocation.location
            ? this.calculateDistance(userLocation, project.geolocation.location)
            : undefined;

          recommendations.push({
            project,
            matchScore,
            distance,
            collaborationCompatibility: matchScore,
            reasons: this.generateCollaborationReasons(project, userPreferences, userLocation)
          });
        }
      }

      // 排序并限制数量
      recommendations.sort((a, b) => b.matchScore - a.matchScore);
      const limitedRecommendations = recommendations.slice(0, limit);

      // 生成推荐原因汇总
      const reasons = this.generateRecommendationSummary(limitedRecommendations);

      return {
        recommendations: limitedRecommendations,
        reasons,
        error: null
      };

    } catch (error) {
      return {
        recommendations: [],
        reasons: [],
        error
      };
    }
  }

  /**
   * 计算协作兼容性分数
   */
  static calculateCollaborationScore(
    project: ProjectWithLocation,
    userPreferences: CollaborationPreference,
    userLocation?: GeoLocation
  ): number {
    if (!project.geolocation) return 0;

    const config = this.DEFAULT_CONFIG;
    let totalScore = 0;

    // 1. 协作模式兼容性
    const modeScore = this.calculateModeCompatibility(
      project.geolocation.collaborationPreference.mode,
      userPreferences.mode
    );
    totalScore += modeScore * config.collaborationModeWeight;

    // 2. 地理位置分数
    if (userLocation && project.geolocation.location) {
      const locationScore = this.calculateLocationScore(
        userLocation,
        project.geolocation.location,
        userPreferences,
        project.geolocation.collaborationPreference
      );
      totalScore += locationScore * config.locationWeight;
    } else {
      // 如果没有位置信息，根据协作模式给分
      const noLocationScore = userPreferences.mode === COLLABORATION_MODES.REMOTE_FRIENDLY ? 80 : 40;
      totalScore += noLocationScore * config.locationWeight;
    }

    // 3. 会议偏好兼容性
    const meetingScore = this.calculateMeetingCompatibility(
      project.geolocation.collaborationPreference.meetingPreference,
      userPreferences.meetingPreference
    );
    totalScore += meetingScore * config.meetingPreferenceWeight;

    // 4. 时区灵活性
    const timeZoneScore = this.calculateTimeZoneCompatibility(
      project.geolocation.collaborationPreference.timeZoneFlexibility,
      userPreferences.timeZoneFlexibility
    );
    totalScore += timeZoneScore * config.timeZoneWeight;

    return Math.round(totalScore);
  }

  /**
   * 分析协作可行性
   */
  static analyzeCollaborationFeasibility(
    project: ProjectWithLocation,
    userLocation: GeoLocation,
    userPreferences: CollaborationPreference
  ): {
    feasible: boolean;
    score: number;
    factors: FeasibilityFactor[];
    suggestions: string[];
  } {
    const score = this.calculateCollaborationScore(project, userPreferences, userLocation);
    const feasible = score >= this.DEFAULT_CONFIG.minScore;
    
    const factors: FeasibilityFactor[] = [];
    const suggestions: string[] = [];

    if (!project.geolocation) {
      factors.push({
        factor: '缺少地理位置信息',
        impact: 'negative',
        description: '项目未设置地理位置信息',
        weight: 0.5
      });
      suggestions.push('建议联系项目创始人确认位置信息');
    } else {
      // 分析距离因子
      if (project.geolocation.location) {
        const distance = this.calculateDistance(userLocation, project.geolocation.location);
        if (distance <= (userPreferences.maxDistance || 50)) {
          factors.push({
            factor: '地理位置',
            impact: 'positive',
            description: `距离${distance.toFixed(1)}公里，在可接受范围内`,
            weight: 0.4
          });
        } else {
          factors.push({
            factor: '地理位置',
            impact: 'negative',
            description: `距离${distance.toFixed(1)}公里，超出偏好范围`,
            weight: 0.4
          });
          if (project.geolocation.collaborationPreference.mode !== COLLABORATION_MODES.REMOTE_FRIENDLY) {
            suggestions.push('考虑远程协作的可能性');
          }
        }
      }

      // 分析协作模式兼容性
      const modeCompatible = this.calculateModeCompatibility(
        project.geolocation.collaborationPreference.mode,
        userPreferences.mode
      ) > 60;

      factors.push({
        factor: '协作模式',
        impact: modeCompatible ? 'positive' : 'negative',
        description: modeCompatible ? '协作模式高度兼容' : '协作模式存在差异',
        weight: 0.3
      });

      if (!modeCompatible) {
        suggestions.push('可以尝试沟通协作方式的灵活性');
      }
    }

    return {
      feasible,
      score,
      factors,
      suggestions
    };
  }

  // 私有辅助方法

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

  private static calculateModeCompatibility(projectMode: string, userMode: string): number {
    // 协作模式兼容性矩阵
    const compatibilityMatrix: { [key: string]: { [key: string]: number } } = {
      [COLLABORATION_MODES.LOCAL_ONLY]: {
        [COLLABORATION_MODES.LOCAL_ONLY]: 100,
        [COLLABORATION_MODES.REMOTE_FRIENDLY]: 30,
        [COLLABORATION_MODES.LOCATION_FLEXIBLE]: 70
      },
      [COLLABORATION_MODES.REMOTE_FRIENDLY]: {
        [COLLABORATION_MODES.LOCAL_ONLY]: 30,
        [COLLABORATION_MODES.REMOTE_FRIENDLY]: 100,
        [COLLABORATION_MODES.LOCATION_FLEXIBLE]: 90
      },
      [COLLABORATION_MODES.LOCATION_FLEXIBLE]: {
        [COLLABORATION_MODES.LOCAL_ONLY]: 70,
        [COLLABORATION_MODES.REMOTE_FRIENDLY]: 90,
        [COLLABORATION_MODES.LOCATION_FLEXIBLE]: 100
      }
    };

    return compatibilityMatrix[projectMode]?.[userMode] || 50;
  }

  private static calculateLocationScore(
    userLocation: GeoLocation,
    projectLocation: GeoLocation,
    userPreferences: CollaborationPreference,
    projectPreferences: CollaborationPreference
  ): number {
    const distance = this.calculateDistance(userLocation, projectLocation);
    const maxDistance = Math.max(
      userPreferences.maxDistance || 50,
      projectPreferences.maxDistance || 50
    );

    if (distance <= maxDistance) {
      // 距离越近分数越高
      return Math.max(100 - (distance / maxDistance) * 50, 50);
    } else {
      // 超出距离范围，但如果支持远程协作仍有分数
      if (userPreferences.mode === COLLABORATION_MODES.REMOTE_FRIENDLY ||
          projectPreferences.mode === COLLABORATION_MODES.REMOTE_FRIENDLY) {
        return 40;
      }
      return 10;
    }
  }

  private static calculateMeetingCompatibility(projectPref: string, userPref: string): number {
    if (projectPref === userPref) return 100;
    if (projectPref === MEETING_PREFERENCES.BOTH || userPref === MEETING_PREFERENCES.BOTH) return 80;
    return 30; // 完全不兼容
  }

  private static calculateTimeZoneCompatibility(projectFlexible: boolean, userFlexible: boolean): number {
    if (projectFlexible && userFlexible) return 100;
    if (projectFlexible || userFlexible) return 70;
    return 50; // 都不灵活，但同时区可能还行
  }

  private static calculateBasicMatchScore(project: ProjectWithLocation, params: GeoSearchParams): number {
    // 简化的匹配分数计算
    let score = 50; // 基础分数

    if (project.geolocation) {
      // 协作模式匹配
      if (params.collaborationMode && 
          project.geolocation.collaborationPreference.mode === params.collaborationMode) {
        score += 30;
      }

      // 位置类型匹配
      if (params.locationType && 
          project.geolocation.locationSettings.type === params.locationType) {
        score += 20;
      }
    }

    return Math.min(score, 100);
  }

  private static generateMatchReasons(project: ProjectWithLocation, params: GeoSearchParams): string[] {
    const reasons: string[] = [];

    if (project.geolocation) {
      if (params.collaborationMode === project.geolocation.collaborationPreference.mode) {
        reasons.push('协作模式匹配');
      }
      
      if (params.locationType === project.geolocation.locationSettings.type) {
        reasons.push('位置类型匹配');
      }

      if (params.city && project.geolocation.components.city?.includes(params.city)) {
        reasons.push('同城项目');
      }
    }

    return reasons;
  }

  private static generateCollaborationReasons(
    project: ProjectWithLocation, 
    userPreferences: CollaborationPreference,
    userLocation?: GeoLocation
  ): string[] {
    const reasons: string[] = [];

    if (!project.geolocation) return reasons;

    // 协作模式兼容性
    const modeScore = this.calculateModeCompatibility(
      project.geolocation.collaborationPreference.mode,
      userPreferences.mode
    );
    if (modeScore >= 80) {
      reasons.push('协作模式高度兼容');
    }

    // 地理位置
    if (userLocation && project.geolocation.location) {
      const distance = this.calculateDistance(userLocation, project.geolocation.location);
      if (distance <= (userPreferences.maxDistance || 50)) {
        reasons.push(`距离仅${distance.toFixed(1)}公里`);
      }
    }

    // 会议偏好
    if (project.geolocation.collaborationPreference.meetingPreference === userPreferences.meetingPreference) {
      reasons.push('会议偏好一致');
    }

    return reasons;
  }

  private static generateRecommendationSummary(matches: ProjectMatch[]): RecommendationReason[] {
    const reasons: RecommendationReason[] = [];

    if (matches.length > 0) {
      const avgScore = matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length;
      
      reasons.push({
        type: 'collaboration',
        description: `找到${matches.length}个高匹配度项目，平均兼容性${avgScore.toFixed(0)}分`,
        weight: 1.0
      });

      const nearbyCount = matches.filter(match => match.distance && match.distance <= 10).length;
      if (nearbyCount > 0) {
        reasons.push({
          type: 'location',
          description: `其中${nearbyCount}个项目在10公里范围内`,
          weight: 0.8
        });
      }
    }

    return reasons;
  }

  // 模拟数据和用户偏好获取
  private static async getMockProjects(): Promise<ProjectWithLocation[]> {
    // 实际应用中这里应该调用项目服务API
    return [];
  }

  private static async getUserPreferences(userId: string): Promise<CollaborationPreference> {
    // 实际应用中从数据库获取用户偏好
    return {
      mode: COLLABORATION_MODES.LOCATION_FLEXIBLE,
      maxDistance: 50,
      meetingPreference: MEETING_PREFERENCES.BOTH,
      timeZoneFlexibility: true,
      description: ''
    };
  }
}