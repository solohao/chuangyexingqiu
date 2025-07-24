# 系统架构总览

## 架构文档结构

本目录包含"创业星球"项目的完整技术架构文档：

- **[代码架构设计](./code-structure.md)** - 技术栈选择、项目结构、模块划分
- **[数据库设计](./database-design.md)** - 完整的数据库表结构和关系设计
- **[TypeScript类型定义](./typescript-types.md)** - 所有核心类型和接口定义
- **[核心组件设计](./core-components.md)** - 关键组件示例和开发最佳实践

## 系统架构概述

### 技术栈总览

```
前端架构: React 18 + TypeScript + Vite
├── 状态管理: Zustand + React Query
├── 样式系统: TailwindCSS + HeadlessUI
├── 组件库: Radix UI + 自定义组件
├── 路由管理: React Router v6
└── 地图集成: 高德地图 Web API

后端服务: Supabase BaaS
├── 数据库: PostgreSQL + RLS
├── 认证系统: Supabase Auth
├── 文件存储: Supabase Storage
├── 实时功能: Supabase Realtime
└── 边缘函数: Supabase Edge Functions

开发工具链
├── 包管理: pnpm
├── 代码规范: ESLint + Prettier
├── 类型检查: TypeScript
├── 测试框架: Vitest + React Testing Library
└── 部署平台: Vercel/Netlify
```

### 系统模块架构

```
创业星球平台
├── 用户认证模块
│   ├── 登录/注册/登出
│   ├── 用户权限管理
│   └── 社交登录集成
├── 用户资料模块
│   ├── 个人信息管理
│   ├── 技能标签系统
│   └── 积分系统
├── 项目展示模块
│   ├── 项目创建和管理
│   ├── 项目协作功能
│   └── 地理位置展示
├── 社区广场模块 (统一设计)
│   ├── 想法分享
│   ├── 功能建议
│   ├── 经验分享
│   └── 投票排名系统
├── 技能市场模块
│   ├── 技能服务发布
│   ├── 服务需求匹配
│   └── 交易评价系统
├── 实时聊天模块
│   ├── 一对一聊天
│   ├── 群组聊天
│   └── 项目协作聊天
├── 地图功能模块
│   ├── 项目地理展示
│   ├── 附近推荐
│   └── 位置搜索
└── AI推荐模块
    ├── 项目推荐
    ├── 技能匹配
    └── 用户推荐
```

### 数据库设计概览

#### 核心表结构
```sql
-- 用户相关 (3张表)
profiles                 -- 用户资料表
user_points_history      -- 积分历史表

-- 项目相关 (3张表)  
projects                 -- 项目主表
project_members          -- 项目成员表
project_applications     -- 项目申请表

-- 社区相关 (3张表)
community_items          -- 统一社区内容表
community_votes          -- 社区投票表
community_comments       -- 社区评论表

-- 技能市场 (4张表)
skill_services           -- 技能服务表
service_requests         -- 服务需求表
service_orders           -- 服务订单表
service_reviews          -- 服务评价表

-- 聊天相关 (3张表)
chat_channels            -- 聊天频道表
chat_participants        -- 聊天参与者表
chat_messages            -- 聊天消息表

-- 系统功能 (2张表)
notifications            -- 通知表
app_settings            -- 应用设置表
```

#### 统一社区表设计
采用统一的 `community_items` 表设计，通过 `type` 字段区分不同类型的社区内容：
- `idea`: 想法分享
- `feature`: 功能建议  
- `experience`: 经验分享
- `question`: 问题咨询

### 前端架构设计

#### 目录结构
```
src/
├── components/          # 可复用组件
│   ├── ui/             # 基础UI组件
│   ├── layout/         # 布局组件
│   ├── auth/           # 认证组件
│   ├── project/        # 项目组件
│   ├── community/      # 社区组件
│   ├── skills/         # 技能市场组件
│   ├── chat/           # 聊天组件
│   ├── map/            # 地图组件
│   └── common/         # 通用组件
├── pages/              # 页面组件
├── hooks/              # 自定义Hooks
├── stores/             # 状态管理
├── services/           # API服务层
├── types/              # TypeScript类型
├── utils/              # 工具函数
└── styles/             # 样式文件
```

#### 状态管理策略
- **本地状态**: Zustand (认证、UI状态等)
- **服务器状态**: React Query (API数据缓存)
- **实时状态**: Supabase Realtime (聊天、通知等)

#### 组件设计模式
- **容器组件**: 负责数据获取和状态管理
- **展示组件**: 负责UI渲染和用户交互
- **高阶组件**: 权限控制、错误边界等
- **Hooks模式**: 复用业务逻辑

### API设计架构

#### 服务层结构
```typescript
services/
├── supabase.ts         # Supabase客户端配置
├── auth.ts             # 认证服务
├── users.ts            # 用户服务
├── projects.ts         # 项目服务
├── community.ts        # 社区服务
├── skills.ts           # 技能服务
├── chat.ts             # 聊天服务
├── files.ts            # 文件服务
├── maps.ts             # 地图服务
└── ai.ts               # AI推荐服务
```

#### API调用模式
```typescript
// 统一的API调用封装
const apiCall = async <T>(
  operation: () => Promise<T>,
  errorMessage?: string
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    console.error(errorMessage || 'API调用失败:', error)
    throw error
  }
}

// 分页查询模式
const fetchPaginated = async <T>(
  queryFn: (params: PaginationParams) => Promise<PaginatedResponse<T>>,
  params: PaginationParams
) => {
  return await queryFn(params)
}

// 实时订阅模式
const subscribeToUpdates = (
  table: string,
  filter?: string,
  callback?: (payload: any) => void
) => {
  return supabase
    .channel('updates')
    .on('postgres_changes', { 
      event: '*', 
      schema: 'public', 
      table: table,
      filter: filter 
    }, callback)
    .subscribe()
}
```

### 性能优化策略

#### 前端优化
1. **代码分割**: 路由级别的懒加载
2. **组件优化**: React.memo、useMemo、useCallback
3. **虚拟化**: 长列表虚拟滚动
4. **缓存策略**: React Query缓存 + 本地存储
5. **图片优化**: WebP格式 + 响应式图片
6. **预加载**: 关键路由和资源预加载

#### 数据库优化
1. **索引优化**: 为查询字段添加合适索引
2. **全文搜索**: PostgreSQL全文搜索索引
3. **复合索引**: 常见组合查询的复合索引
4. **RLS策略**: 行级安全策略优化
5. **分页优化**: 游标分页 + 计数优化

### 安全策略

#### 认证安全
- JWT令牌机制
- 刷新令牌轮换
- 会话超时管理
- 多因素认证支持

#### 数据安全
- Row Level Security (RLS)
- 输入验证和清理
- XSS防护
- CSRF保护

#### API安全
- 接口限流
- 权限验证
- 参数验证
- 错误信息脱敏

### 部署架构

#### 开发环境
```
Development
├── Frontend: Vite Dev Server (localhost:5173)
├── Backend: Supabase Local Development
├── Database: Local PostgreSQL
└── Storage: Local File System
```

#### 生产环境
```
Production
├── Frontend: Vercel/Netlify CDN
├── Backend: Supabase Cloud
├── Database: Supabase PostgreSQL
├── Storage: Supabase Storage
└── Monitoring: Supabase Dashboard + Custom Analytics
```

### 开发工作流

#### Git工作流
```
main (生产分支)
├── develop (开发分支)
├── feature/* (功能分支)
├── hotfix/* (热修复分支)
└── release/* (发布分支)
```

#### CI/CD流程
```
代码提交 → ESLint检查 → TypeScript编译 → 单元测试 → 构建 → 部署
```

## 快速开始

### 环境配置
```bash
# 1. 克隆项目
git clone <repository-url>
cd 创业星球

# 2. 安装依赖
pnpm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 添加必要的API密钥

# 4. 启动开发服务器
pnpm dev
```

### 数据库初始化
```bash
# 1. 连接到Supabase项目
# 2. 运行SQL脚本创建表结构
# 3. 配置RLS策略
# 4. 初始化基础数据
```

### 开发规范
- 遵循TypeScript严格模式
- 使用ESLint + Prettier代码规范
- 组件命名采用PascalCase
- 文件命名采用camelCase
- 提交信息遵循Conventional Commits规范

## 扩展计划

### 短期目标 (1-2个月)
- [ ] 完成MVP版本开发
- [ ] 用户认证和基础功能
- [ ] 项目展示和社区功能
- [ ] 基础聊天功能

### 中期目标 (3-6个月)
- [ ] 技能市场功能完善
- [ ] AI推荐系统集成
- [ ] 移动端适配
- [ ] 性能优化

### 长期目标 (6-12个月)
- [ ] 微信小程序版本
- [ ] 国际化支持
- [ ] 高级分析功能
- [ ] 企业版功能 