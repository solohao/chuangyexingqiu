# 🌍 创业星球 (StartupPlanet)

> 连接独立创业者的智能匹配平台

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/solohao/chuangyexingqiu)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/solohao/chuangyexingqiu/actions)

## 📖 项目概述

创业星球是一个专为独立创业者设计的智能匹配平台，通过地图可视化、AI智能推荐和社区互动，帮助创业者找到合适的合作伙伴、验证产品创意、获取技能服务。

### 🎯 核心价值
- **解决孤独创业** - 通过地理位置匹配让线下协作成为可能
- **技能互补** - 连接有想法和有技能的创业者
- **创意验证** - 社区化的创意讨论和验证机制
- **智能匹配** - AI驱动的精准合作伙伴推荐

## ✨ 核心功能

### 🗺️ 地图展示
- 高德地图集成，可视化展示创业项目分布
- 基于地理位置的项目搜索和筛选
- 实时项目信息展示和交互

### 🏛️ 社区广场
- **💡 创意市场** - 创业想法分享和团队组建
- **🛒 大师工坊** - 汇聚大师级人才的专业技能平台
- **🔧 功能需求** - 用户驱动的产品功能完善
- **🏆 排行榜** - 多维度的社区贡献排名

### 🤖 AI智能匹配
- 基于技能、兴趣、地理位置的智能推荐
- 多维度匹配算法优化
- 个性化推荐引擎

## 🛠️ 技术栈

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI库**: TailwindCSS + Headless UI
- **状态管理**: Zustand
- **地图服务**: 高德地图 API

### 后端
- **数据库**: Supabase (PostgreSQL + Realtime)
- **认证**: Supabase Auth
- **文件存储**: Supabase Storage

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/solohao/chuangyexingqiu.git
cd chuangyexingqiu

# 安装依赖
pnpm install

# 配置环境变量
cp .env.local.example .env.local
# 编辑 .env.local 文件，填入你的API密钥

# 启动开发服务器
pnpm run dev
```

### 环境配置

创建 `.env.local` 文件：

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 高德地图
VITE_AMAP_KEY=your_amap_api_key

# 其他配置
VITE_APP_ENV=development
```

## 🗂️ 项目结构

```
chuangyexingqiu/
├── src/
│   ├── components/     # 可复用组件
│   ├── pages/         # 页面组件
│   ├── hooks/         # 自定义Hook
│   ├── store/         # 状态管理
│   ├── services/      # API服务
│   ├── types/         # TypeScript类型
│   └── utils/         # 工具函数
├── public/            # 静态资源
├── docs/              # 项目文档
└── .github/           # GitHub Actions
```

## 🚀 部署

项目使用 GitHub Actions 自动部署到 GitHub Pages。

每次推送到 `main` 分支时，会自动触发构建和部署流程。

访问地址：https://solohao.github.io/chuangyexingqiu/

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📊 项目状态

- **当前版本**: v0.1.0 (MVP开发中)
- **开发进度**: 40%
- **最后更新**: 2025-01-24

## 📄 许可证

本项目基于 MIT License 开源。

## 📞 联系我们

- **项目主页**: https://github.com/solohao/chuangyexingqiu
- **问题反馈**: https://github.com/solohao/chuangyexingqiu/issues

---

<div align="center">
  <p>Made with ❤️ by solohao</p>
  <p>⭐ 如果这个项目对你有帮助，请给我们一个星标！</p>
</div>