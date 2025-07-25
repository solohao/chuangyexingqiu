// 协作导向的地理位置类型定义

// 基础地理位置接口
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

// 地址组件接口
export interface AddressComponents {
  country?: string;
  province?: string;
  city?: string;
  district?: string;
  street?: string;
  streetNumber?: string;
  postalCode?: string;
}

// 协作偏好接口
export interface CollaborationPreference {
  mode: 'local_only' | 'remote_friendly' | 'location_flexible';
  maxDistance?: number; // 愿意线下协作的最大距离（公里）
  meetingPreference: 'online' | 'offline' | 'both';
  timeZoneFlexibility: boolean; // 是否接受跨时区协作
  description?: string; // 协作偏好说明
}

// 位置类型和可见性设置
export interface LocationSettings {
  type: 'physical' | 'remote' | 'hybrid';
  visibility: 'public' | 'city_only' | 'hidden';
  showExactAddress: boolean;
  allowContactForMeetup: boolean;
}

// 服务区域接口
export interface ServiceArea {
  type: 'local' | 'regional' | 'national' | 'global';
  targetRegions?: string[]; // 目标服务区域
  description?: string; // 服务范围说明
}

// 完整项目地理位置信息
export interface ProjectGeolocation {
  id: string;
  projectId: string;
  
  // 基础位置信息
  location: GeoLocation;
  address: string;
  formattedAddress: string;
  components: AddressComponents;
  
  // 协作相关设置
  locationSettings: LocationSettings;
  collaborationPreference: CollaborationPreference;
  serviceArea: ServiceArea;
  
  // 元数据
  accuracy: 'high' | 'medium' | 'low';
  source: 'user_input' | 'gps' | 'geocoded' | 'manual';
  lastVerified: string;
  createdAt: string;
  updatedAt: string;
}

// 地理搜索参数（增强版）
export interface GeoSearchParams {
  query?: string;
  center?: GeoLocation;
  radius?: number; // 搜索半径（公里）
  bounds?: {
    northeast: GeoLocation;
    southwest: GeoLocation;
  };
  city?: string;
  province?: string;
  
  // 协作相关筛选
  collaborationMode?: 'local_only' | 'remote_friendly' | 'location_flexible' | 'all';
  meetingPreference?: 'online' | 'offline' | 'both';
  locationType?: 'physical' | 'remote' | 'hybrid';
  serviceAreaType?: 'local' | 'regional' | 'national' | 'global';
}

// 项目匹配结果
export interface ProjectMatch {
  project: ProjectWithLocation;
  matchScore: number; // 匹配分数 0-100
  distance?: number; // 距离（公里）
  collaborationCompatibility: number; // 协作兼容性分数
  reasons: string[]; // 推荐原因
}

// 带地理位置信息的项目接口
export interface ProjectWithLocation {
  id: string;
  title: string;
  description: string;
  type: string;
  category: string;
  stage: string;
  status: string;
  
  // 基础位置信息（从数据库）
  location?: string;
  city?: string;
  province?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  
  // 项目详细信息
  content?: string;
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
  
  // 协作相关字段
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
  
  // 统计信息
  views?: number;
  likes?: number;
  bookmarks?: number;
  progress_percentage?: number;
  is_published?: boolean;
  is_featured?: boolean;
  
  // 地理位置信息
  geolocation?: ProjectGeolocation;
  distance?: number; // 与搜索中心的距离（公里）
  
  // 其他项目信息
  founder_id: string;
  founder_name?: string;
  created_at: string;
  updated_at: string;
}

// 地址建议
export interface AddressSuggestion {
  id: string;
  name: string;
  district: string;
  address: string;
  location: GeoLocation;
  type: 'poi' | 'address' | 'bus_stop' | 'subway';
}

// 共享办公空间建议
export interface CoworkingSpaceSuggestion {
  id: string;
  name: string;
  address: string;
  location: GeoLocation;
  amenities: string[];
  priceRange: string;
  rating?: number;
}

// 地理编码结果
export interface GeocodeResult {
  originalAddress: string;
  location: GeoLocation | null;
  formattedAddress: string;
  components: AddressComponents;
  confidence: number;
  error?: string;
}

// 推荐原因
export interface RecommendationReason {
  type: 'location' | 'collaboration' | 'skills' | 'stage' | 'industry';
  description: string;
  weight: number;
}

// 可行性因子
export interface FeasibilityFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
}

// 地理边界
export interface GeoBounds {
  northeast: GeoLocation;
  southwest: GeoLocation;
}

// 协作匹配配置
export interface CollaborationMatchConfig {
  locationWeight: number; // 地理位置权重
  collaborationModeWeight: number; // 协作模式权重
  meetingPreferenceWeight: number; // 会议偏好权重
  timeZoneWeight: number; // 时区权重
  maxDistance: number; // 最大匹配距离
  minScore: number; // 最小匹配分数
}

// 协作模式常量
export const COLLABORATION_MODES = {
  LOCAL_ONLY: 'local_only',
  REMOTE_FRIENDLY: 'remote_friendly',
  LOCATION_FLEXIBLE: 'location_flexible'
} as const;

export const LOCATION_TYPES = {
  PHYSICAL: 'physical',
  REMOTE: 'remote',
  HYBRID: 'hybrid'
} as const;

export const MEETING_PREFERENCES = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  BOTH: 'both'
} as const;

export const LOCATION_VISIBILITY = {
  PUBLIC: 'public',
  CITY_ONLY: 'city_only',
  HIDDEN: 'hidden'
} as const;

// 默认配置
export const DEFAULT_COLLABORATION_PREFERENCE: CollaborationPreference = {
  mode: 'location_flexible',
  maxDistance: 50,
  meetingPreference: 'both',
  timeZoneFlexibility: true,
  description: ''
};

export const DEFAULT_LOCATION_SETTINGS: LocationSettings = {
  type: 'hybrid',
  visibility: 'city_only',
  showExactAddress: false,
  allowContactForMeetup: true
};

export const DEFAULT_SERVICE_AREA: ServiceArea = {
  type: 'regional',
  targetRegions: [],
  description: ''
};