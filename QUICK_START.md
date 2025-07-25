# 🚀 快速启动指南

## 项目结构概览

```
startup-planet/
├── frontend/           # React前端应用
├── backend/           # 后端服务集合
│   ├── joyagent-core/ # JoyAgent Java后端
│   ├── genie-client/  # Python API客户端
│   ├── genie-tool/    # Python工具服务
│   ├── startup-agents/ # 自定义创业Agent
│   └── ui/            # JoyAgent原生UI
├── shared/            # 共享类型和常量
└── docker/            # Docker配置
```

## 🔧 环境准备

### 必需软件
- **Node.js** >= 18.0.0
- **Java** >= 17 (推荐OpenJDK)
- **Python** >= 3.9
- **pnpm** >= 8.0.0
- **Maven** >= 3.6 (通常Java安装包含)

### 可选软件
- **Docker** & **Docker Compose** (用于容器化部署)
- **Git** (用于版本控制)

## ⚡ 快速启动

### 方式一：开发模式 (推荐)

```bash
# 1. 克隆项目
git clone https://github.com/solohao/chuangyexingqiu.git
cd chuangyexingqiu

# 2. 安装根目录依赖
npm install

# 3. 启动前端 (终端1)
cd frontend
pnpm install
pnpm run dev
# 前端将在 http://localhost:3000 启动

# 4. 启动Java后端 (终端2)
cd backend/joyagent-core
./mvnw spring-boot:run
# 后端将在 http://localhost:8080 启动

# 5. 启动Python服务 (终端3)
cd backend/genie-client
python server.py
# 客户端服务将在 http://localhost:1601 启动

# 6. 启动工具服务 (终端4)
cd backend/genie-tool
python server.py
# 工具服务将在 http://localhost:1602 启动
```

### 方式二：一键启动 (需要安装concurrently)

```bash
# 安装根目录依赖
npm install

# 一键启动所有服务
npm run dev
```

### 方式三：Docker部署

```bash
# 构建并启动所有服务
npm run docker:up

# 或者手动执行
cd docker
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
npm run docker:down
```

## 🔑 环境配置

### 前端配置
在 `frontend/` 目录创建 `.env.local` 文件：

```bash
# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# 高德地图配置
VITE_AMAP_KEY=your_amap_api_key

# JoyAgent后端配置
VITE_JOYAGENT_API_URL=http://localhost:8080

# 环境标识
VITE_APP_ENV=development
```

**注意**: 如果你的根目录已经有 `.env.local` 文件，需要复制到前端目录：
```bash
cp .env.local frontend/.env.local
```

### 后端配置
编辑 `backend/joyagent-core/src/main/resources/application.yml`：

```yaml
# OpenAI配置
openai:
  api-key: your_openai_api_key
  base-url: https://api.openai.com/v1

# MCP服务配置
mcp_server_url: "http://localhost:1601/sse"

# 服务端口
server:
  port: 8080

# 数据库配置 (如果需要)
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/startup_planet
    username: your_username
    password: your_password
```

### Python服务配置
在 `backend/genie-tool/` 目录创建 `.env` 文件：

```bash
# 从 .env_template 复制并修改
cp .env_template .env

# 编辑 .env 文件
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
```

## 🌐 访问地址

启动成功后，可以通过以下地址访问：

- **前端应用**: http://localhost:3000
- **JoyAgent后端**: http://localhost:8080
- **JoyAgent原生UI**: http://localhost:3004 (如果启动)
- **Python客户端**: http://localhost:1601
- **Python工具服务**: http://localhost:1602

## 🔍 验证安装

### 检查前端
访问 http://localhost:3000，应该能看到创业星球的主页。

### 检查后端
访问 http://localhost:8080/actuator/health，应该返回：
```json
{"status":"UP"}
```

### 检查Python服务
访问 http://localhost:1601/health，应该返回健康状态。

## 🐛 常见问题

### 端口冲突
如果遇到端口被占用，可以修改配置文件中的端口号：
- 前端: `frontend/vite.config.ts` 中的 `server.port`
- 后端: `backend/joyagent-core/src/main/resources/application.yml` 中的 `server.port`

### Java版本问题
确保使用Java 17或更高版本：
```bash
java -version
```

### Python依赖问题
如果Python服务启动失败，尝试：
```bash
cd backend/genie-client
pip install -r requirements.txt  # 如果有的话
# 或者
python -m pip install fastapi uvicorn
```

### 权限问题 (Linux/Mac)
如果遇到权限问题，给启动脚本添加执行权限：
```bash
chmod +x backend/joyagent-core/mvnw
chmod +x backend/start_genie.sh
```

## 📚 下一步

1. 查看 [开发文档](docs/README.md)
2. 了解 [API接口](docs/05-api/)
3. 学习 [自定义Agent开发](docs/04-development/)
4. 参与 [贡献指南](CONTRIBUTING.md)

## 🆘 获取帮助

- 查看 [项目文档](docs/)
- 提交 [Issue](https://github.com/solohao/chuangyexingqiu/issues)
- 参考 [JoyAgent文档](backend/README.joyagent.md)

---

🎉 **恭喜！** 你已经成功启动了创业星球项目！