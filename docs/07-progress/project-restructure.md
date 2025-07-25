# 项目结构重构说明

## 重构目标

为了集成JoyAgent-JDGenie多智能体系统，我们将项目重构为前后端分离的架构，支持自定义创业智能体的开发和部署。

## 新项目结构

```
startup-planet/
├── frontend/                    # React前端
│   ├── src/                    # 原有前端代码
│   ├── public/                 # 静态资源
│   └── package.json            # 前端依赖
├── backend/                     # 集成后端
│   ├── joyagent-core/          # JoyAgent核心代码 (待集成)
│   ├── startup-agents/         # 自定义创业Agent
│   ├── api/                    # REST API层
│   ├── service/                # 业务服务层
│   └── config/                 # 配置文件
├── shared/                     # 共享类型定义
│   ├── types/                  # TypeScript/Java类型
│   └── constants/              # 常量定义
├── docker/                     # Docker配置
│   ├── Dockerfile              # 多阶段构建
│   └── docker-compose.yml      # 服务编排
└── docs/                       # 项目文档
```

## 迁移完成的内容

### ✅ 已完成
1. **前端代码迁移**
   - 所有src目录下的代码迁移到frontend/src/
   - 配置文件迁移 (package.json, vite.config.ts, tsconfig.json等)
   - 静态资源迁移 (public目录)

2. **后端结构创建**
   - 创建自定义Agent基础结构
   - API控制器和服务层框架
   - 配置类基础结构

3. **共享类型定义**
   - Agent相关类型定义
   - 常量定义

4. **Docker配置**
   - 多阶段构建Dockerfile
   - docker-compose.yml服务编排

### ✅ 已完成 (更新)
1. **JoyAgent核心集成**
   - ✅ 下载并集成JoyAgent-JDGenie源码到backend/joyagent-core/
   - ✅ 集成genie-client Python服务到backend/genie-client/
   - ✅ 集成genie-tool工具服务到backend/genie-tool/
   - ✅ 集成JoyAgent原生UI到backend/ui/
   - ✅ 复制相关配置和启动脚本

### 🔄 待完成

1. **清理工作**
   - ✅ 删除根目录下的原前端文件和配置
   - ✅ 删除不需要的构建产物和依赖
   - ✅ 更新项目README和文档
   - ✅ 创建根目录package.json管理整个项目

2. **Agent实现**
   - 完善BusinessCanvasAgent实现
   - 完善SWOTAnalysisAgent实现
   - 完善PolicyMatchingAgent实现
   - 完善IncubatorAgent实现

3. **API层完善**
   - 实现REST API接口
   - 添加请求验证和错误处理
   - 集成认证和授权

4. **前端适配**
   - 修改前端API调用指向新的后端
   - 集成Agent功能到现有页面
   - 添加Agent交互界面

## 下一步计划

1. **第一阶段**: 集成JoyAgent核心代码
2. **第二阶段**: 实现自定义Agent
3. **第三阶段**: 前后端联调
4. **第四阶段**: 部署和测试

## 注意事项

- 原有的前端功能保持不变
- 新的后端服务将提供AI Agent能力
- 保持向后兼容性
- 逐步迁移现有功能到新架构