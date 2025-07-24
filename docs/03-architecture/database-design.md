# 数据库设计

## Supabase 数据库架构

### 用户相关表 (User Tables)

#### 1. profiles (用户资料表)
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  username VARCHAR UNIQUE,
  full_name VARCHAR,
  avatar_url VARCHAR,
  bio TEXT,
  phone VARCHAR,
  location JSONB, -- {lat, lng, address, city, province}
  skills TEXT[], -- 技能标签数组
  interests TEXT[], -- 兴趣标签数组
  points INTEGER DEFAULT 0, -- 积分
  level INTEGER DEFAULT 1, -- 用户等级
  role VARCHAR DEFAULT 'user', -- user, admin, moderator
  status VARCHAR DEFAULT 'active', -- active, suspended, deleted
  social_links JSONB, -- 社交媒体链接
  experience_years INTEGER, -- 工作经验年数
  education JSONB, -- 教育背景
  company VARCHAR, -- 公司
  position VARCHAR, -- 职位
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_skills ON profiles USING GIN(skills);
CREATE INDEX idx_profiles_location ON profiles USING GIN(location);
```

#### 2. user_points_history (积分历史表)
```sql
CREATE TABLE user_points_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  points_change INTEGER NOT NULL, -- 积分变化 (+/-)
  action_type VARCHAR NOT NULL, -- login, post, vote, reward, purchase
  description TEXT,
  reference_id UUID, -- 关联对象ID
  reference_type VARCHAR, -- project, community_item, skill_service
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_points_history_user ON user_points_history(user_id);
CREATE INDEX idx_points_history_date ON user_points_history(created_at);
```

### 项目相关表 (Project Tables)

#### 3. projects (项目表)
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  content TEXT, -- 详细内容 (Markdown)
  status VARCHAR DEFAULT 'active', -- active, paused, completed, archived
  stage VARCHAR DEFAULT 'idea', -- idea, prototype, development, launched
  category VARCHAR NOT NULL, -- tech, design, business, social, etc.
  tags TEXT[], -- 项目标签
  skills_needed TEXT[], -- 需要的技能
  team_size_current INTEGER DEFAULT 1,
  team_size_target INTEGER,
  budget_range VARCHAR, -- none, low, medium, high
  timeline VARCHAR, -- short, medium, long
  location JSONB, -- 项目位置
  is_remote BOOLEAN DEFAULT false,
  website_url VARCHAR,
  demo_url VARCHAR,
  github_url VARCHAR,
  images TEXT[], -- 项目图片URLs
  video_url VARCHAR,
  contact_info JSONB,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_category ON projects(category);
CREATE INDEX idx_projects_tags ON projects USING GIN(tags);
CREATE INDEX idx_projects_location ON projects USING GIN(location);
CREATE INDEX idx_projects_created_at ON projects(created_at);
```

#### 4. project_members (项目成员表)
```sql
CREATE TABLE project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'member', -- owner, admin, member, contributor
  skills_contributed TEXT[],
  status VARCHAR DEFAULT 'active', -- active, left, removed
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_members_project ON project_members(project_id);
CREATE INDEX idx_project_members_user ON project_members(user_id);
```

#### 5. project_applications (项目申请表)
```sql
CREATE TABLE project_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  skills_offer TEXT[],
  status VARCHAR DEFAULT 'pending', -- pending, approved, rejected, withdrawn
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_applications_project ON project_applications(project_id);
CREATE INDEX idx_project_applications_user ON project_applications(user_id);
CREATE INDEX idx_project_applications_status ON project_applications(status);
```

### 社区相关表 (Community Tables)

#### 6. community_items (社区内容表) - 统一表设计
```sql
CREATE TABLE community_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL, -- idea, feature, experience, question
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  summary TEXT, -- 简短描述
  category VARCHAR, -- 分类
  tags TEXT[], -- 标签
  status VARCHAR DEFAULT 'active', -- active, archived, deleted
  priority INTEGER DEFAULT 0, -- 优先级分数
  difficulty VARCHAR, -- easy, medium, hard (用于功能建议)
  estimated_effort VARCHAR, -- small, medium, large (用于功能建议)
  images TEXT[], -- 图片URLs
  attachments JSONB, -- 附件信息
  metadata JSONB, -- 额外元数据
  view_count INTEGER DEFAULT 0,
  vote_count INTEGER DEFAULT 0, -- 净投票数 (upvotes - downvotes)
  upvote_count INTEGER DEFAULT 0,
  downvote_count INTEGER DEFAULT 0,
  comment_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_community_items_user ON community_items(user_id);
CREATE INDEX idx_community_items_type ON community_items(type);
CREATE INDEX idx_community_items_category ON community_items(category);
CREATE INDEX idx_community_items_tags ON community_items USING GIN(tags);
CREATE INDEX idx_community_items_priority ON community_items(priority DESC);
CREATE INDEX idx_community_items_vote_count ON community_items(vote_count DESC);
CREATE INDEX idx_community_items_created_at ON community_items(created_at DESC);
```

#### 7. community_votes (社区投票表)
```sql
CREATE TABLE community_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES community_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  vote_type VARCHAR NOT NULL, -- upvote, downvote
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(item_id, user_id)
);

CREATE INDEX idx_community_votes_item ON community_votes(item_id);
CREATE INDEX idx_community_votes_user ON community_votes(user_id);
```

#### 8. community_comments (社区评论表)
```sql
CREATE TABLE community_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES community_items(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES community_comments(id) ON DELETE CASCADE, -- 回复功能
  content TEXT NOT NULL,
  vote_count INTEGER DEFAULT 0,
  status VARCHAR DEFAULT 'active', -- active, hidden, deleted
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_community_comments_item ON community_comments(item_id);
CREATE INDEX idx_community_comments_user ON community_comments(user_id);
CREATE INDEX idx_community_comments_parent ON community_comments(parent_id);
```

### 技能市场表 (Skills Market Tables)

#### 9. skill_services (技能服务表)
```sql
CREATE TABLE skill_services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL, -- development, design, marketing, consulting, etc.
  subcategory VARCHAR,
  skills TEXT[], -- 相关技能
  service_type VARCHAR NOT NULL, -- hourly, fixed, subscription
  price_range JSONB, -- {min, max, currency, unit}
  duration_estimate VARCHAR, -- 预估时长
  delivery_time VARCHAR, -- 交付时间
  portfolio_items JSONB[], -- 作品集
  requirements TEXT, -- 服务要求
  process_description TEXT, -- 服务流程
  availability VARCHAR DEFAULT 'available', -- available, busy, paused
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  order_count INTEGER DEFAULT 0,
  response_time INTEGER, -- 响应时间(小时)
  images TEXT[],
  tags TEXT[],
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_skill_services_user ON skill_services(user_id);
CREATE INDEX idx_skill_services_category ON skill_services(category);
CREATE INDEX idx_skill_services_skills ON skill_services USING GIN(skills);
CREATE INDEX idx_skill_services_rating ON skill_services(rating DESC);
```

#### 10. service_requests (服务需求表)
```sql
CREATE TABLE service_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR NOT NULL,
  skills_needed TEXT[],
  budget_range JSONB, -- {min, max, currency}
  timeline VARCHAR,
  requirements TEXT,
  attachments JSONB[],
  status VARCHAR DEFAULT 'open', -- open, in_progress, completed, cancelled
  applications_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_requests_user ON service_requests(user_id);
CREATE INDEX idx_service_requests_category ON service_requests(category);
CREATE INDEX idx_service_requests_status ON service_requests(status);
```

#### 11. service_orders (服务订单表)
```sql
CREATE TABLE service_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES skill_services(id),
  request_id UUID REFERENCES service_requests(id),
  buyer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  currency VARCHAR DEFAULT 'CNY',
  status VARCHAR DEFAULT 'pending', -- pending, accepted, in_progress, delivered, completed, cancelled, disputed
  deadline TIMESTAMPTZ,
  requirements TEXT,
  deliverables JSONB[],
  messages_channel UUID, -- 关联聊天频道
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_orders_service ON service_orders(service_id);
CREATE INDEX idx_service_orders_request ON service_orders(request_id);
CREATE INDEX idx_service_orders_buyer ON service_orders(buyer_id);
CREATE INDEX idx_service_orders_seller ON service_orders(seller_id);
```

#### 12. service_reviews (服务评价表)
```sql
CREATE TABLE service_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES service_orders(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES skill_services(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  tags TEXT[], -- 评价标签
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(order_id, reviewer_id)
);

CREATE INDEX idx_service_reviews_service ON service_reviews(service_id);
CREATE INDEX idx_service_reviews_reviewee ON service_reviews(reviewee_id);
```

### 聊天相关表 (Chat Tables)

#### 13. chat_channels (聊天频道表)
```sql
CREATE TABLE chat_channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR NOT NULL, -- direct, group, project, service
  name VARCHAR,
  description TEXT,
  avatar_url VARCHAR,
  is_private BOOLEAN DEFAULT true,
  reference_id UUID, -- 关联对象ID (project_id, order_id等)
  reference_type VARCHAR, -- project, service_order, etc.
  last_message_id UUID,
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_channels_type ON chat_channels(type);
CREATE INDEX idx_chat_channels_reference ON chat_channels(reference_id, reference_type);
CREATE INDEX idx_chat_channels_last_activity ON chat_channels(last_activity_at DESC);
```

#### 14. chat_participants (聊天参与者表)
```sql
CREATE TABLE chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR DEFAULT 'member', -- admin, member
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT false,
  
  UNIQUE(channel_id, user_id)
);

CREATE INDEX idx_chat_participants_channel ON chat_participants(channel_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
```

#### 15. chat_messages (聊天消息表)
```sql
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES chat_channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  message_type VARCHAR DEFAULT 'text', -- text, image, file, system
  attachments JSONB[], -- 附件信息
  reply_to UUID REFERENCES chat_messages(id),
  is_edited BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  metadata JSONB, -- 额外元数据
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_channel ON chat_messages(channel_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
```

### 通知相关表 (Notification Tables)

#### 16. notifications (通知表)
```sql
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL, -- project_application, new_message, service_order, etc.
  title VARCHAR NOT NULL,
  content TEXT,
  reference_id UUID, -- 关联对象ID
  reference_type VARCHAR, -- project, message, order, etc.
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### 系统配置表 (System Tables)

#### 17. app_settings (应用设置表)
```sql
CREATE TABLE app_settings (
  key VARCHAR PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始化基础设置
INSERT INTO app_settings (key, value, description) VALUES
('points.login_daily', '10', '每日登录获得积分'),
('points.post_content', '20', '发布内容获得积分'),
('points.vote_received', '5', '收到投票获得积分'),
('user.max_projects', '10', '用户最大项目数'),
('community.daily_post_limit', '5', '每日发布限制');
```

## Row Level Security (RLS) 策略

```sql
-- 启用 RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- 用户资料访问策略
CREATE POLICY "用户可以查看所有公开资料" ON profiles FOR SELECT USING (true);
CREATE POLICY "用户只能更新自己的资料" ON profiles FOR UPDATE USING (auth.uid() = id);

-- 项目访问策略
CREATE POLICY "所有人可以查看活跃项目" ON projects FOR SELECT USING (status = 'active');
CREATE POLICY "用户可以管理自己的项目" ON projects FOR ALL USING (auth.uid() = user_id);

-- 社区内容访问策略
CREATE POLICY "所有人可以查看活跃内容" ON community_items FOR SELECT USING (status = 'active');
CREATE POLICY "认证用户可以创建内容" ON community_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "用户可以编辑自己的内容" ON community_items FOR UPDATE USING (auth.uid() = user_id);

-- 聊天消息访问策略
CREATE POLICY "参与者可以查看消息" ON chat_messages FOR SELECT USING (
  channel_id IN (
    SELECT channel_id FROM chat_participants WHERE user_id = auth.uid()
  )
);
```

## 触发器和函数

```sql
-- 更新 updated_at 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为相关表添加触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 用户积分更新函数
CREATE OR REPLACE FUNCTION update_user_points(
  p_user_id UUID,
  p_points_change INTEGER,
  p_action_type VARCHAR,
  p_description TEXT DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  -- 更新用户积分
  UPDATE profiles 
  SET points = points + p_points_change 
  WHERE id = p_user_id;
  
  -- 记录积分历史
  INSERT INTO user_points_history (
    user_id, points_change, action_type, description, 
    reference_id, reference_type
  ) VALUES (
    p_user_id, p_points_change, p_action_type, p_description,
    p_reference_id, p_reference_type
  );
END;
$$ LANGUAGE plpgsql;
```

## 性能优化索引

```sql
-- 复合索引用于常见查询
CREATE INDEX idx_projects_category_status ON projects(category, status);
CREATE INDEX idx_community_items_type_priority ON community_items(type, priority DESC);
CREATE INDEX idx_skill_services_category_rating ON skill_services(category, rating DESC);

-- 全文搜索索引
CREATE INDEX idx_projects_search ON projects USING gin(to_tsvector('chinese', title || ' ' || description));
CREATE INDEX idx_community_search ON community_items USING gin(to_tsvector('chinese', title || ' ' || content));
CREATE INDEX idx_skills_search ON skill_services USING gin(to_tsvector('chinese', title || ' ' || description));
``` 