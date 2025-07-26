# API配置说明

## 概述

本项目使用魔搭ModelScope API，API Key通过环境变量 `MODELSCOPE_ACCESS_TOKEN` 配置

## 配置文件位置

### 1. 后端环境配置
- **主配置文件**: `backend/.env.local` - 包含所有API Key和服务配置
- **模板文件**: `backend/.env.local.example` - 配置模板，用于新环境部署

### 2. JoyAgent-Core配置
- **主配置**: `backend/joyagent-core/src/main/resources/application.yml`
- **魔搭专用配置**: `backend/joyagent-core/src/main/resources/application-modelscope.yml`

### 3. Genie-Tool配置
- **运行配置**: `backend/genie-tool/.env`
- **模板配置**: `backend/genie-tool/.env_template`

## API端点配置

### 魔搭ModelScope API
- **API Key**: 通过环境变量 `MODELSCOPE_ACCESS_TOKEN` 配置
- **API-Inference端点**: `https://api-inference.modelscope.cn/v1`
- **DashScope端点**: `https://dashscope.aliyuncs.com/compatible-mode/v1`

### 支持的模型
- `Qwen/Qwen2.5-7B-Instruct` - 通用对话和规划
- `Qwen/Qwen2.5-14B-Instruct` - 复杂任务执行
- `Qwen/Qwen2.5-Coder-32B-Instruct` - 代码生成和分析
- `deepseek-ai/DeepSeek-V3` - 高级推理任务

## 启动说明

### 1. 启动JoyAgent-Core
```bash
cd backend/joyagent-core
./start.sh
```

### 2. 启动Genie-Tool
```bash
cd backend/genie-tool
./start.sh
```

### 3. 启动Genie-Client
```bash
cd backend/genie-client
./start.sh
```

## 服务端口
- JoyAgent-Core: `http://localhost:8080`
- Genie-Tool: `http://localhost:1601`
- Genie-Client: `http://localhost:8188`

## 注意事项
1. 确保所有服务都使用相同的API Key
2. 如需更换API Key，请同时更新所有相关配置文件
3. 生产环境部署时，请使用环境变量而非硬编码API Key