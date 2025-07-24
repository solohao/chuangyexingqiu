# TypeScript 类型定义

## 核心类型系统

### 认证相关类型 (Auth Types)

```typescript
// types/auth.ts
export interface User {
  id: string
  email: string
  email_confirmed_at?: string
  created_at: string
  updated_at: string
}

export interface Session {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
  user: User
}

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  initialized: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  username: string
  full_name: string
}

export interface ResetPasswordRequest {
  email: string
}
```

### 用户相关类型 (User Types)

```typescript
// types/user.ts
export interface Location {
  lat: number
  lng: number
  address: string
  city: string
  province: string
}

export interface SocialLinks {
  github?: string
  linkedin?: string
  twitter?: string
  website?: string
  wechat?: string
  qq?: string
}

export interface Education {
  school: string
  degree: string
  field: string
  start_year: number
  end_year?: number
  description?: string
}

export interface Profile {
  id: string
  email: string
  username?: string
  full_name?: string
  avatar_url?: string
  bio?: string
  phone?: string
  location?: Location
  skills: string[]
  interests: string[]
  points: number
  level: number
  role: 'user' | 'admin' | 'moderator'
  status: 'active' | 'suspended' | 'deleted'
  social_links?: SocialLinks
  experience_years?: number
  education?: Education[]
  company?: string
  position?: string
  created_at: string
  updated_at: string
}

export interface PointsHistory {
  id: string
  user_id: string
  points_change: number
  action_type: 'login' | 'post' | 'vote' | 'reward' | 'purchase'
  description?: string
  reference_id?: string
  reference_type?: string
  created_at: string
}

export interface UserStats {
  total_points: number
  current_level: number
  projects_created: number
  services_provided: number
  community_posts: number
  reviews_received: number
  average_rating: number
}
```

### 项目相关类型 (Project Types)

```typescript
// types/project.ts
export interface Project {
  id: string
  user_id: string
  title: string
  description: string
  content?: string
  status: 'active' | 'paused' | 'completed' | 'archived'
  stage: 'idea' | 'prototype' | 'development' | 'launched'
  category: string
  tags: string[]
  skills_needed: string[]
  team_size_current: number
  team_size_target?: number
  budget_range?: 'none' | 'low' | 'medium' | 'high'
  timeline?: 'short' | 'medium' | 'long'
  location?: Location
  is_remote: boolean
  website_url?: string
  demo_url?: string
  github_url?: string
  images: string[]
  video_url?: string
  contact_info?: Record<string, any>
  view_count: number
  like_count: number
  share_count: number
  featured: boolean
  created_at: string
  updated_at: string
  
  // 关联数据
  user?: Profile
  members?: ProjectMember[]
  applications?: ProjectApplication[]
}

export interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member' | 'contributor'
  skills_contributed: string[]
  status: 'active' | 'left' | 'removed'
  joined_at: string
  left_at?: string
  
  // 关联数据
  user?: Profile
}

export interface ProjectApplication {
  id: string
  project_id: string
  user_id: string
  message?: string
  skills_offer: string[]
  status: 'pending' | 'approved' | 'rejected' | 'withdrawn'
  created_at: string
  updated_at: string
  
  // 关联数据
  user?: Profile
  project?: Project
}

export interface ProjectFilter {
  category?: string
  tags?: string[]
  skills?: string[]
  status?: string[]
  stage?: string[]
  budget_range?: string[]
  timeline?: string[]
  is_remote?: boolean
  location?: Location
  search?: string
}

export interface CreateProjectRequest {
  title: string
  description: string
  content?: string
  category: string
  tags: string[]
  skills_needed: string[]
  team_size_target?: number
  budget_range?: string
  timeline?: string
  location?: Location
  is_remote: boolean
  website_url?: string
  demo_url?: string
  github_url?: string
  images?: string[]
  video_url?: string
  contact_info?: Record<string, any>
}
```

### 社区相关类型 (Community Types)

```typescript
// types/community.ts
export interface CommunityItem {
  id: string
  user_id: string
  type: 'idea' | 'feature' | 'experience' | 'question'
  title: string
  content: string
  summary?: string
  category?: string
  tags: string[]
  status: 'active' | 'archived' | 'deleted'
  priority: number
  difficulty?: 'easy' | 'medium' | 'hard'
  estimated_effort?: 'small' | 'medium' | 'large'
  images: string[]
  attachments?: Attachment[]
  metadata?: Record<string, any>
  view_count: number
  vote_count: number
  upvote_count: number
  downvote_count: number
  comment_count: number
  share_count: number
  featured: boolean
  created_at: string
  updated_at: string
  
  // 关联数据
  user?: Profile
  user_vote?: CommunityVote
  comments?: CommunityComment[]
}

export interface CommunityVote {
  id: string
  item_id: string
  user_id: string
  vote_type: 'upvote' | 'downvote'
  created_at: string
}

export interface CommunityComment {
  id: string
  item_id: string
  user_id: string
  parent_id?: string
  content: string
  vote_count: number
  status: 'active' | 'hidden' | 'deleted'
  created_at: string
  updated_at: string
  
  // 关联数据
  user?: Profile
  replies?: CommunityComment[]
}

export interface CommunityFilter {
  type?: string[]
  category?: string
  tags?: string[]
  sort?: 'latest' | 'popular' | 'trending' | 'priority'
  time_range?: 'day' | 'week' | 'month' | 'year' | 'all'
  search?: string
}

export interface CreateCommunityItemRequest {
  type: 'idea' | 'feature' | 'experience' | 'question'
  title: string
  content: string
  summary?: string
  category?: string
  tags: string[]
  difficulty?: 'easy' | 'medium' | 'hard'
  estimated_effort?: 'small' | 'medium' | 'large'
  images?: string[]
  attachments?: Attachment[]
}
```

### 技能市场类型 (Skills Types)

```typescript
// types/skill.ts
export interface PriceRange {
  min: number
  max: number
  currency: 'CNY' | 'USD'
  unit: 'hour' | 'project' | 'month'
}

export interface PortfolioItem {
  title: string
  description: string
  image_url: string
  project_url?: string
  demo_url?: string
  completed_at: string
}

export interface SkillService {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  subcategory?: string
  skills: string[]
  service_type: 'hourly' | 'fixed' | 'subscription'
  price_range: PriceRange
  duration_estimate?: string
  delivery_time?: string
  portfolio_items: PortfolioItem[]
  requirements?: string
  process_description?: string
  availability: 'available' | 'busy' | 'paused'
  rating: number
  review_count: number
  order_count: number
  response_time?: number
  images: string[]
  tags: string[]
  featured: boolean
  created_at: string
  updated_at: string
  
  // 关联数据
  user?: Profile
  reviews?: ServiceReview[]
}

export interface ServiceRequest {
  id: string
  user_id: string
  title: string
  description: string
  category: string
  skills_needed: string[]
  budget_range: PriceRange
  timeline?: string
  requirements?: string
  attachments: Attachment[]
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  applications_count: number
  created_at: string
  updated_at: string
  
  // 关联数据
  user?: Profile
}

export interface ServiceOrder {
  id: string
  service_id?: string
  request_id?: string
  buyer_id: string
  seller_id: string
  title: string
  description?: string
  price: number
  currency: string
  status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
  deadline?: string
  requirements?: string
  deliverables: Attachment[]
  messages_channel?: string
  created_at: string
  updated_at: string
  
  // 关联数据
  service?: SkillService
  request?: ServiceRequest
  buyer?: Profile
  seller?: Profile
}

export interface ServiceReview {
  id: string
  order_id: string
  reviewer_id: string
  reviewee_id: string
  service_id: string
  rating: number
  review_text?: string
  tags: string[]
  is_anonymous: boolean
  created_at: string
  
  // 关联数据
  reviewer?: Profile
  reviewee?: Profile
}

export interface SkillFilter {
  category?: string
  subcategory?: string
  skills?: string[]
  service_type?: string[]
  price_range?: PriceRange
  rating_min?: number
  availability?: string[]
  delivery_time?: string[]
  search?: string
  sort?: 'latest' | 'rating' | 'price_low' | 'price_high' | 'reviews'
}
```

### 聊天相关类型 (Chat Types)

```typescript
// types/chat.ts
export interface ChatChannel {
  id: string
  type: 'direct' | 'group' | 'project' | 'service'
  name?: string
  description?: string
  avatar_url?: string
  is_private: boolean
  reference_id?: string
  reference_type?: string
  last_message_id?: string
  last_activity_at: string
  created_by?: string
  created_at: string
  updated_at: string
  
  // 关联数据
  participants?: ChatParticipant[]
  last_message?: ChatMessage
  unread_count?: number
}

export interface ChatParticipant {
  id: string
  channel_id: string
  user_id: string
  role: 'admin' | 'member'
  joined_at: string
  last_read_at: string
  is_muted: boolean
  
  // 关联数据
  user?: Profile
}

export interface ChatMessage {
  id: string
  channel_id: string
  user_id: string
  content?: string
  message_type: 'text' | 'image' | 'file' | 'system'
  attachments: Attachment[]
  reply_to?: string
  is_edited: boolean
  is_deleted: boolean
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  
  // 关联数据
  user?: Profile
  reply_message?: ChatMessage
}

export interface CreateChannelRequest {
  type: 'direct' | 'group' | 'project' | 'service'
  name?: string
  description?: string
  participant_ids: string[]
  reference_id?: string
  reference_type?: string
}

export interface SendMessageRequest {
  channel_id: string
  content?: string
  message_type?: 'text' | 'image' | 'file'
  attachments?: Attachment[]
  reply_to?: string
}
```

### 通用类型 (Common Types)

```typescript
// types/common.ts
export interface Attachment {
  id: string
  filename: string
  file_type: string
  file_size: number
  url: string
  thumbnail_url?: string
  metadata?: Record<string, any>
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  content?: string
  reference_id?: string
  reference_type?: string
  is_read: boolean
  created_at: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  page: number
  per_page: number
  total_pages: number
  has_more: boolean
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}

export interface LoadingState {
  loading: boolean
  error?: ApiError | null
}

export interface PaginationParams {
  page?: number
  per_page?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface SearchParams {
  q?: string
  filters?: Record<string, any>
}

export interface GeoLocation {
  lat: number
  lng: number
  accuracy?: number
}

export interface Address {
  formatted: string
  street?: string
  city: string
  province: string
  country: string
  postal_code?: string
}

export interface MapMarker {
  id: string
  position: GeoLocation
  title: string
  content?: string
  type: 'project' | 'user' | 'service'
  data?: any
}

export interface FileUploadProgress {
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'success' | 'error'
  url?: string
  error?: string
}

export interface FormValidation {
  valid: boolean
  errors: Record<string, string[]>
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  description?: string
}

export interface TabItem {
  key: string
  label: string
  content: React.ReactNode
  disabled?: boolean
  badge?: number | string
}

export interface MenuItem {
  key: string
  label: string
  icon?: React.ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
  children?: MenuItem[]
}

export interface Theme {
  mode: 'light' | 'dark'
  colors: Record<string, string>
  fonts: Record<string, string>
  spacing: Record<string, number>
}

export interface AppConfig {
  app_name: string
  app_version: string
  api_url: string
  supabase_url: string
  supabase_anon_key: string
  amap_key: string
  upload_max_size: number
  supported_file_types: string[]
  pagination_default_size: number
  cache_ttl: number
}
```

### 数据库类型 (Database Types)

```typescript
// types/database.ts
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      projects: {
        Row: Project
        Insert: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'like_count' | 'share_count'>
        Update: Partial<Omit<Project, 'id' | 'created_at'>>
      }
      community_items: {
        Row: CommunityItem
        Insert: Omit<CommunityItem, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'vote_count' | 'upvote_count' | 'downvote_count' | 'comment_count' | 'share_count'>
        Update: Partial<Omit<CommunityItem, 'id' | 'created_at'>>
      }
      skill_services: {
        Row: SkillService
        Insert: Omit<SkillService, 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'order_count'>
        Update: Partial<Omit<SkillService, 'id' | 'created_at'>>
      }
      chat_messages: {
        Row: ChatMessage
        Insert: Omit<ChatMessage, 'id' | 'created_at' | 'updated_at' | 'is_edited' | 'is_deleted'>
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at' | 'channel_id' | 'user_id'>>
      }
      // ... 其他表类型
    }
    Views: {
      // 视图类型
    }
    Functions: {
      // 函数类型
      update_user_points: {
        Args: {
          p_user_id: string
          p_points_change: number
          p_action_type: string
          p_description?: string
          p_reference_id?: string
          p_reference_type?: string
        }
        Returns: void
      }
    }
    Enums: {
      user_role: 'user' | 'admin' | 'moderator'
      user_status: 'active' | 'suspended' | 'deleted'
      project_status: 'active' | 'paused' | 'completed' | 'archived'
      project_stage: 'idea' | 'prototype' | 'development' | 'launched'
      community_item_type: 'idea' | 'feature' | 'experience' | 'question'
      vote_type: 'upvote' | 'downvote'
      service_type: 'hourly' | 'fixed' | 'subscription'
      order_status: 'pending' | 'accepted' | 'in_progress' | 'delivered' | 'completed' | 'cancelled' | 'disputed'
      message_type: 'text' | 'image' | 'file' | 'system'
      channel_type: 'direct' | 'group' | 'project' | 'service'
    }
  }
}

// Supabase 客户端类型
export type SupabaseClient = import('@supabase/supabase-js').SupabaseClient<Database>
export type SupabaseUser = import('@supabase/supabase-js').User
export type SupabaseSession = import('@supabase/supabase-js').Session
```

### 状态管理类型 (Store Types)

```typescript
// types/store.ts
export interface AuthStore {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  
  // Actions
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

export interface ProjectStore {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  filters: ProjectFilter
  pagination: PaginationParams
  
  // Actions
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  createProject: (data: CreateProjectRequest) => Promise<Project>
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  joinProject: (id: string, message?: string) => Promise<void>
  likeProject: (id: string) => Promise<void>
  setFilters: (filters: Partial<ProjectFilter>) => void
  clearFilters: () => void
}

export interface CommunityStore {
  items: CommunityItem[]
  currentItem: CommunityItem | null
  loading: boolean
  filters: CommunityFilter
  
  // Actions
  fetchItems: () => Promise<void>
  fetchItem: (id: string) => Promise<void>
  createItem: (data: CreateCommunityItemRequest) => Promise<CommunityItem>
  updateItem: (id: string, updates: Partial<CommunityItem>) => Promise<void>
  deleteItem: (id: string) => Promise<void>
  voteItem: (id: string, type: 'upvote' | 'downvote') => Promise<void>
  addComment: (itemId: string, content: string, parentId?: string) => Promise<void>
}

export interface ChatStore {
  channels: ChatChannel[]
  currentChannel: ChatChannel | null
  messages: Record<string, ChatMessage[]>
  loading: boolean
  
  // Actions
  fetchChannels: () => Promise<void>
  createChannel: (data: CreateChannelRequest) => Promise<ChatChannel>
  selectChannel: (id: string) => void
  sendMessage: (data: SendMessageRequest) => Promise<void>
  markAsRead: (channelId: string) => Promise<void>
  subscribeToMessages: (channelId: string) => () => void
}
``` 