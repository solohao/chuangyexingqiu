# 代码架构设计

## 技术栈选择

### 前端技术栈
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **状态管理**: Zustand + React Query
- **样式**: TailwindCSS + HeadlessUI
- **地图**: 高德地图 Web API
- **路由**: React Router v6
- **实时通信**: Supabase Realtime
- **组件库**: Radix UI + 自定义组件

### 后端服务
- **BaaS**: Supabase
  - 数据库: PostgreSQL
  - 认证: Supabase Auth
  - 存储: Supabase Storage
  - 实时功能: Supabase Realtime
  - 边缘函数: Supabase Edge Functions

### 开发工具
- **包管理**: pnpm
- **代码规范**: ESLint + Prettier
- **类型检查**: TypeScript
- **测试**: Vitest + React Testing Library
- **部署**: Vercel/Netlify

## 项目目录结构

```
创业星球/
├── docs/                           # 项目文档
├── .env.example                    # 环境变量模板
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── eslint.config.js
├── prettier.config.js
├── index.html
├── public/                         # 静态资源
│   ├── icons/
│   ├── images/
│   └── manifest.json
└── src/                           # 源代码目录
    ├── main.tsx                   # 应用入口
    ├── App.tsx                    # 根组件
    ├── vite-env.d.ts
    ├── components/                # 可复用组件
    │   ├── ui/                    # 基础UI组件
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── modal.tsx
    │   │   ├── card.tsx
    │   │   ├── badge.tsx
    │   │   ├── avatar.tsx
    │   │   ├── loading.tsx
    │   │   └── index.ts
    │   ├── layout/                # 布局组件
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── Footer.tsx
    │   │   ├── Navigation.tsx
    │   │   └── Layout.tsx
    │   ├── map/                   # 地图相关组件
    │   │   ├── AMapContainer.tsx
    │   │   ├── ProjectMarker.tsx
    │   │   ├── LocationPicker.tsx
    │   │   └── MapControls.tsx
    │   ├── auth/                  # 认证组件
    │   │   ├── LoginForm.tsx
    │   │   ├── RegisterForm.tsx
    │   │   ├── ProtectedRoute.tsx
    │   │   └── AuthProvider.tsx
    │   ├── profile/               # 个人资料组件
    │   │   ├── ProfileCard.tsx
    │   │   ├── ProfileEditor.tsx
    │   │   ├── SkillsTags.tsx
    │   │   └── PointsDisplay.tsx
    │   ├── project/               # 项目相关组件
    │   │   ├── ProjectCard.tsx
    │   │   ├── ProjectForm.tsx
    │   │   ├── ProjectGallery.tsx
    │   │   └── ProjectFilter.tsx
    │   ├── community/             # 社区组件
    │   │   ├── CommunityTabs.tsx
    │   │   ├── ItemCard.tsx
    │   │   ├── RankingList.tsx
    │   │   ├── VoteButton.tsx
    │   │   ├── CommentList.tsx
    │   │   └── PostForm.tsx
    │   ├── skills/                # 技能市场组件
    │   │   ├── SkillCard.tsx
    │   │   ├── SkillFilter.tsx
    │   │   ├── ServiceRequest.tsx
    │   │   └── RatingSystem.tsx
    │   ├── chat/                  # 聊天组件
    │   │   ├── ChatWindow.tsx
    │   │   ├── MessageList.tsx
    │   │   ├── MessageInput.tsx
    │   │   ├── ChatList.tsx
    │   │   └── EmojiPicker.tsx
    │   └── common/                # 通用组件
    │       ├── ErrorBoundary.tsx
    │       ├── NotFound.tsx
    │       ├── Pagination.tsx
    │       ├── SearchBox.tsx
    │       ├── FileUpload.tsx
    │       └── ConfirmDialog.tsx
    ├── pages/                     # 页面组件
    │   ├── HomePage.tsx           # 首页
    │   ├── auth/                  # 认证页面
    │   │   ├── LoginPage.tsx
    │   │   └── RegisterPage.tsx
    │   ├── profile/               # 个人中心
    │   │   ├── ProfilePage.tsx
    │   │   ├── SettingsPage.tsx
    │   │   └── PointsPage.tsx
    │   ├── projects/              # 项目页面
    │   │   ├── ProjectsPage.tsx
    │   │   ├── ProjectDetailPage.tsx
    │   │   └── CreateProjectPage.tsx
    │   ├── community/             # 社区广场
    │   │   └── CommunityPage.tsx
    │   ├── skills/                # 技能市场
    │   │   ├── SkillsPage.tsx
    │   │   └── ServiceDetailPage.tsx
    │   ├── chat/                  # 聊天中心
    │   │   └── ChatPage.tsx
    │   └── ai/                    # AI推荐
    │       └── RecommendationPage.tsx
    ├── hooks/                     # 自定义Hooks
    │   ├── useAuth.ts             # 认证相关
    │   ├── useMap.ts              # 地图功能
    │   ├── useProjects.ts         # 项目管理
    │   ├── useCommunity.ts        # 社区功能
    │   ├── useSkills.ts           # 技能市场
    │   ├── useChat.ts             # 聊天功能
    │   ├── usePoints.ts           # 积分系统
    │   ├── useLocalStorage.ts     # 本地存储
    │   ├── useDebounce.ts         # 防抖
    │   └── useInfiniteScroll.ts   # 无限滚动
    ├── stores/                    # 状态管理
    │   ├── authStore.ts           # 用户认证状态
    │   ├── userStore.ts           # 用户信息状态
    │   ├── projectStore.ts        # 项目状态
    │   ├── communityStore.ts      # 社区状态
    │   ├── chatStore.ts           # 聊天状态
    │   ├── mapStore.ts            # 地图状态
    │   └── globalStore.ts         # 全局状态
    ├── services/                  # API服务层
    │   ├── supabase.ts            # Supabase客户端配置
    │   ├── auth.ts                # 认证服务
    │   ├── users.ts               # 用户服务
    │   ├── projects.ts            # 项目服务
    │   ├── community.ts           # 社区服务
    │   ├── skills.ts              # 技能服务
    │   ├── chat.ts                # 聊天服务
    │   ├── files.ts               # 文件上传服务
    │   ├── maps.ts                # 地图服务
    │   └── ai.ts                  # AI推荐服务
    ├── types/                     # TypeScript类型定义
    │   ├── auth.ts                # 认证相关类型
    │   ├── user.ts                # 用户类型
    │   ├── project.ts             # 项目类型
    │   ├── community.ts           # 社区类型
    │   ├── skill.ts               # 技能类型
    │   ├── chat.ts                # 聊天类型
    │   ├── common.ts              # 通用类型
    │   └── database.ts            # 数据库类型
    ├── utils/                     # 工具函数
    │   ├── constants.ts           # 常量定义
    │   ├── helpers.ts             # 辅助函数
    │   ├── validators.ts          # 表单验证
    │   ├── formatters.ts          # 数据格式化
    │   ├── permissions.ts         # 权限检查
    │   ├── encryption.ts          # 加密工具
    │   └── date.ts                # 日期处理
    ├── styles/                    # 样式文件
    │   ├── globals.css            # 全局样式
    │   ├── components.css         # 组件样式
    │   └── utilities.css          # 工具样式
    └── assets/                    # 静态资源
        ├── icons/                 # 图标
        ├── images/                # 图片
        └── fonts/                 # 字体
```

## 核心模块架构

### 1. 认证模块 (Auth Module)
```typescript
// 用户认证和权限管理
- 登录/注册/登出
- 用户权限验证
- Session管理
- 社交登录集成
```

### 2. 用户模块 (User Module)
```typescript
// 用户信息和个人资料
- 个人资料管理
- 技能标签系统
- 积分系统
- 用户设置
```

### 3. 项目模块 (Project Module)
```typescript
// 项目展示和管理
- 项目创建/编辑
- 项目展示和搜索
- 项目地理位置
- 项目协作
```

### 4. 社区模块 (Community Module)
```typescript
// 统一社区广场
- 想法分享 (Ideas)
- 功能建议 (Features)
- 经验分享 (Experience)
- 投票和排名系统
- 评论和讨论
```

### 5. 技能市场模块 (Skills Module)
```typescript
// 技能服务交易
- 技能发布
- 服务需求
- 匹配推荐
- 评价系统
```

### 6. 聊天模块 (Chat Module)
```typescript
// 实时通信
- 一对一聊天
- 群组聊天
- 消息推送
- 文件分享
```

### 7. 地图模块 (Map Module)
```typescript
// 地理位置功能
- 项目地图展示
- 位置选择
- 附近项目推荐
- 路径规划
```

### 8. AI推荐模块 (AI Module)
```typescript
// 智能推荐
- 项目推荐
- 技能匹配
- 用户推荐
- 内容推荐
```

## 数据流架构

### 状态管理模式
```typescript
// Zustand + React Query 混合模式
- 本地状态: Zustand
- 服务器状态: React Query
- 实时状态: Supabase Realtime
- 缓存策略: React Query缓存
```

### API调用模式
```typescript
// 统一的API调用层
- Service层封装Supabase客户端
- Hook层处理状态和副作用
- Error Boundary处理错误
- Loading状态统一管理
```

## 部署架构

### 前端部署
- **平台**: Vercel/Netlify
- **CDN**: 自动集成
- **环境**: Development/Staging/Production

### 后端服务
- **数据库**: Supabase PostgreSQL
- **认证**: Supabase Auth
- **存储**: Supabase Storage
- **实时**: Supabase Realtime
- **函数**: Supabase Edge Functions

### 环境配置
```bash
# .env.local
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_AMAP_KEY=
VITE_APP_URL=
```

## 开发规范

### 代码组织规则
1. **组件命名**: PascalCase
2. **文件命名**: camelCase
3. **常量命名**: UPPER_SNAKE_CASE
4. **接口命名**: I前缀 + PascalCase

### 导入顺序
```typescript
// 1. React相关
import React from 'react'
import { useState, useEffect } from 'react'

// 2. 第三方库
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-hot-toast'

// 3. 内部模块
import { Button } from '@/components/ui'
import { useAuth } from '@/hooks'
import { projectsService } from '@/services'

// 4. 类型定义
import type { Project } from '@/types'
```

### 性能优化策略
1. **懒加载**: React.lazy + Suspense
2. **虚拟化**: 长列表虚拟滚动
3. **缓存**: React Query缓存策略
4. **预加载**: 关键路由预加载
5. **代码分割**: 路由级别分割
6. **图片优化**: WebP格式 + 响应式 