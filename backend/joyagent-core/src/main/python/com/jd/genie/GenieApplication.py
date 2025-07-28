#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
JoyAgent-Core Python版本主应用入口
对应原Java文件: com.jd.genie.GenieApplication
"""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# 加载环境变量 - 按优先级：.env.local > .env
# 从当前文件向上找到项目根目录
current_file = Path(__file__).resolve()
project_root = current_file

# 向上查找直到找到包含.env文件的目录，最多查找5层
max_levels = 5
for _ in range(max_levels):
    if project_root.parent == project_root:  # 到达根目录
        break
    if (project_root / ".env").exists() or (project_root / ".env.local").exists():
        break
    project_root = project_root.parent

# 如果没找到，使用相对路径（从joyagent-core目录向上两层到项目根目录）
if not (project_root / ".env").exists() and not (project_root / ".env.local").exists():
    # 从 backend/joyagent-core/src/main/python/com/jd/genie/ 向上到项目根目录
    project_root = Path(__file__).resolve().parent.parent.parent.parent.parent.parent.parent

print(f"[DEBUG] 项目根目录: {project_root}")
print(f"[DEBUG] .env文件存在: {(project_root / '.env').exists()}")
print(f"[DEBUG] .env.local文件存在: {(project_root / '.env.local').exists()}")

# 先加载.env，再加载.env.local（后者会覆盖前者）
if (project_root / ".env").exists():
    load_dotenv(project_root / ".env")
    print(f"[DEBUG] 已加载 .env 文件")

if (project_root / ".env.local").exists():
    load_dotenv(project_root / ".env.local")
    print(f"[DEBUG] 已加载 .env.local 文件")

# 验证环境变量加载
api_key = os.getenv("MODELSCOPE_ACCESS_TOKEN")
print(f"[DEBUG] API Key loaded: {api_key[:10]}..." if api_key else "[DEBUG] API Key not found")

# 添加项目根目录到Python路径
project_root = Path(__file__).parent.parent.parent.parent.parent
sys.path.insert(0, str(project_root))

from com.jd.genie.controller.GenieController import router as genie_router
from com.jd.genie.controller.StartupAgentsController import router as startup_agents_router
from com.jd.genie.controller.ChatSessionController import router as chat_session_router
from com.jd.genie.config.GenieConfig import GenieConfig
from com.jd.genie.util.SseUtil import setup_sse


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时初始化
    print("JoyAgent-Core Python版本启动中...")
    
    # 初始化配置
    config = GenieConfig()
    app.state.config = config
    
    print("JoyAgent-Core 启动完成")
    yield
    
    # 关闭时清理
    print("JoyAgent-Core 正在关闭...")


def create_app() -> FastAPI:
    """创建FastAPI应用"""
    app = FastAPI(
        title="JoyAgent-Core",
        description="创业星球多智能体系统核心服务 - Python版本",
        version="1.0.0",
        lifespan=lifespan
    )
    
    # CORS中间件
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # 注册路由
    app.include_router(genie_router, prefix="")
    app.include_router(startup_agents_router, prefix="/api/startup-agents", tags=["startup-agents"])
    app.include_router(chat_session_router, prefix="/api/chat", tags=["chat-sessions"])
    
    # 设置SSE支持
    setup_sse(app)
    
    return app


app = create_app()


def main():
    """主函数"""
    port = int(os.getenv("SERVER_PORT", 8080))
    host = os.getenv("SERVER_HOST", "0.0.0.0")
    
    print(f"启动JoyAgent-Core服务: http://{host}:{port}")
    
    uvicorn.run(
        app,
        host=host,
        port=port,
        reload=False,
        log_level="info"
    )


if __name__ == "__main__":
    main()