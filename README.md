# 🌍 创业星球 (StartupPlanet)

> 基于JoyAgent-JDGenie的智能创业服务平台

[![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)](https://github.com/solohao/chuangyexingqiu)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![JoyAgent](https://img.shields.io/badge/powered%20by-JoyAgent--JDGenie-orange.svg)](https://github.com/jd-opensource/joyagent-jdgenie)

## 📖 项目概述

创业星球是一个集成了JoyAgent-JDGenie多智能体系统的智能创业服务平台，为创业者提供从创意到产品的完整转化链路支持。

### 🎯 核心价值
- **AI驱动的创业指导** - 基于多智能体系统的专业创业咨询
- **智能匹配与协作** - 通过地理位置和技能的智能合作伙伴推荐
- **全链路创业服务** - 从创意验证到产品落地的完整支持
- **专业知识图谱** - 整合创业、法务、财税、政策等专业知识

## ✨ 核心功能

### 🤖 AI智能体服务
- **商业模式画布Agent** - 引导完成九大要素分析
- **SWOT分析Agent** - 专业的优势劣势机会威胁分析
- **政策匹配Agent** - 智能推荐适合的政策和补贴
- **孵化器推荐Agent** - 根据项目特点推荐合适孵化器
- **报告生成Agent** - 自动生成专业分析报告
- **PPT生成Agent** - 创建专业路演演示文稿

### �️ 地图展示与匹配
- 高德地图集成，可视化展示创业项目分布
- 基于地理位置的智能协作匹配
- 实时项目信息展示和交互

### 🏛️ 社区广场
- **💡 创意市场** - 创业想法分享和团队组建
- **🛒 大师工坊** - 汇聚专业技能服务
- **�  功能需求** - 用户驱动的产品完善
- **🏆 排行榜** - 多维度社区贡献排名

## 🛠️ 技术栈

### 前端 (frontend/)
- **框架**: React 18 + TypeScript
- **构建工具**: Vite
- **UI库**: TailwindCSS + Headless UI
- **状态管理**: Zustand
- **地图服务**: 高德地图 API

### 后端 (backend/)
- **多智能体框架**: JoyAgent-JDGenie
- **后端服务**: Java Spring Boot
- **Python服务**: genie-client, genie-tool
- **数据库**: Supabase (PostgreSQL + Realtime)
- **认证**: Supabase Auth

### 共享 (shared/)
- **类型定义**: TypeScript interfaces
- **常量定义**: 跨语言常量

## 🗂️ 项目结构

```
startup-planet/
├── frontend/                    # React前端
│   ├── src/
│   │   ├── components/         # 可复用组件
│   │   ├── pages/             # 页面组件
│   │   ├── hooks/             # 自定义Hook
│   │   ├── store/             # 状态管理
│   │   ├── services/          # API服务
│   │   ├── types/             # TypeScript类型
│   │   └── utils/             # 工具函数
│   ├── public/                # 静态资源
│   └── package.json
├── backend/                     # 集成后端
│   ├── joyagent-core/          # JoyAgent核心代码
│   ├── startup-agents/         # 自定义创业Agent
│   │   ├── BusinessCanvasAgent.java
│   │   ├── SWOTAnalysisAgent.java
│   │   ├── PolicyMatchingAgent.java
│   │   └── IncubatorAgent.java
│   ├── api/                    # REST API层
│   ├── service/                # 业务服务层
│   ├── config/                 # 配置文件
│   ├── genie-client/           # Python API客户端
│   ├── genie-tool/             # 工具执行服务
│   └── ui/                     # JoyAgent原生UI
├── shared/                     # 共享类型定义
│   ├── types/
│   └── constants/
├── docker/                     # Docker配置
│   ├── Dockerfile
│   └── docker-compose.yml
├── docs/                       # 项目文档
└── .github/                    # GitHub Actions
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- Java >= 17
- Python >= 3.9
- pnpm >= 8.0.0

### 安装步骤

```bash
# 克隆项目
git clone https://github.com/solohao/chuangyexingqiu.git
cd chuangyexingqiu

# 前端开发
cd frontend
pnpm install
pnpm run dev

# 后端开发 (另开终端)
cd backend/joyagent-core
./mvnw spring-boot:run

# Python服务 (另开终端)
cd backend/genie-client
python server.py

cd backend/genie-tool
python server.py
```

### 环境配置

在 `frontend/` 目录创建 `.env.local` 文件：

```bash
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 高德地图
VITE_AMAP_KEY=your_amap_api_key

# JoyAgent后端
VITE_JOYAGENT_API_URL=http://localhost:8080

# 其他配置
VITE_APP_ENV=development
```

**注意**: 如果根目录已有 `.env.local` 文件，请复制到前端目录：
```bash
cp .env.local frontend/.env.local
```

在 `backend/joyagent-core/src/main/resources/` 目录配置 `application.yml`：

```yaml
# OpenAI配置
openai:
  api-key: your_openai_api_key
  base-url: https://api.openai.com

# MCP服务配置
mcp_server_url: "http://localhost:1601/sse"

# 数据库配置
spring:
  datasource:
    url: your_database_url
```

## 🐳 Docker部署

```bash
# 构建和启动所有服务
cd docker
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 📊 项目状态

- **当前版本**: v0.2.0 (JoyAgent集成版)
- **开发进度**: 60%
- **最后更新**: 2025-01-25

## 🤝 贡献指南

我们欢迎所有形式的贡献！

### 开发流程
1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目基于 MIT License 开源。
JoyAgent-JDGenie 基于 Apache 2.0 License。

## 🙏 致谢

- [JoyAgent-JDGenie](https://github.com/jd-opensource/joyagent-jdgenie) - 提供强大的多智能体框架
- [Supabase](https://supabase.com/) - 提供后端即服务
- [高德地图](https://lbs.amap.com/) - 提供地图服务

## 📞 联系我们

- **项目主页**: https://github.com/solohao/chuangyexingqiu
- **问题反馈**: https://github.com/solohao/chuangyexingqiu/issues

---

<div align="center">
  <p>Made with ❤️ by solohao</p>
  <p>Powered by JoyAgent-JDGenie 🤖</p>
  <p>⭐ 如果这个项目对你有帮助，请给我们一个星标！</p>
</div>