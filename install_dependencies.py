#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创业星球多智能体系统 - 依赖安装脚本
一键安装所有Python依赖
"""

import os
import sys
import subprocess
from pathlib import Path

class Colors:
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    NC = '\033[0m'

def log_info(message):
    print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")

def log_success(message):
    print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")

def log_warning(message):
    print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")

def log_error(message):
    print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")

def check_python_version():
    """检查Python版本"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        log_error(f"需要Python 3.8+，当前版本: {version.major}.{version.minor}")
        return False
    
    log_success(f"Python版本检查通过: {version.major}.{version.minor}.{version.micro}")
    return True

def install_pip_dependencies():
    """安装pip依赖"""
    log_info("安装Python依赖包...")
    
    requirements_file = Path(__file__).parent / "requirements.txt"
    if not requirements_file.exists():
        log_error("requirements.txt 文件不存在")
        return False
    
    try:
        # 升级pip
        log_info("升级pip...")
        subprocess.run([sys.executable, "-m", "pip", "install", "--upgrade", "pip"], 
                      check=True, capture_output=True)
        
        # 安装依赖
        log_info("安装项目依赖...")
        result = subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", str(requirements_file)
        ], capture_output=True, text=True)
        
        if result.returncode != 0:
            log_error(f"依赖安装失败: {result.stderr}")
            return False
        
        log_success("Python依赖安装完成")
        return True
        
    except subprocess.CalledProcessError as e:
        log_error(f"安装过程出错: {e}")
        return False
    except Exception as e:
        log_error(f"未知错误: {e}")
        return False

def check_java_environment():
    """检查Java环境（可选）"""
    log_info("检查Java环境...")
    
    try:
        result = subprocess.run(["java", "-version"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            java_version = result.stderr.split('\n')[0]
            log_success(f"Java环境: {java_version}")
            return True
    except FileNotFoundError:
        pass
    
    log_warning("Java环境未找到")
    log_info("如果需要完整功能，请安装Java 11+")
    log_info("或者使用 --python-only 选项仅启动Python服务")
    return False

def check_node_environment():
    """检查Node.js环境（前端需要）"""
    log_info("检查Node.js环境...")
    
    try:
        result = subprocess.run(["node", "--version"], 
                              capture_output=True, text=True)
        if result.returncode == 0:
            node_version = result.stdout.strip()
            log_success(f"Node.js环境: {node_version}")
            
            # 检查npm
            npm_result = subprocess.run(["npm", "--version"], 
                                      capture_output=True, text=True)
            if npm_result.returncode == 0:
                npm_version = npm_result.stdout.strip()
                log_success(f"npm版本: {npm_version}")
                return True
    except FileNotFoundError:
        pass
    
    log_warning("Node.js环境未找到")
    log_info("前端需要Node.js环境，请安装Node.js 16+")
    return False

def setup_environment():
    """设置环境配置"""
    log_info("检查环境配置...")
    
    root_dir = Path(__file__).parent
    env_file = root_dir / ".env"
    env_local_file = root_dir / ".env.local"
    env_example_file = root_dir / ".env.example"
    
    if not env_file.exists():
        log_error(".env 文件不存在")
        return False
    
    if not env_local_file.exists() and env_example_file.exists():
        log_info("创建本地环境配置文件...")
        try:
            import shutil
            shutil.copy(env_example_file, env_local_file)
            log_success("已创建 .env.local 文件")
            log_warning("请编辑 .env.local 文件，设置你的API Key")
        except Exception as e:
            log_error(f"创建配置文件失败: {e}")
            return False
    
    log_success("环境配置检查完成")
    return True

def main():
    """主函数"""
    print("=" * 50)
    print("创业星球多智能体系统 - 环境安装器")
    print("=" * 50)
    
    # 检查Python版本
    if not check_python_version():
        sys.exit(1)
    
    # 安装Python依赖
    if not install_pip_dependencies():
        sys.exit(1)
    
    # 检查其他环境
    check_java_environment()
    check_node_environment()
    
    # 设置环境配置
    if not setup_environment():
        sys.exit(1)
    
    print("\n" + "=" * 50)
    log_success("环境安装完成！")
    print("=" * 50)
    
    print("\n下一步操作:")
    print("1. 编辑 .env.local 文件，设置你的API Key")
    print("2. 运行后端服务: python start_backend.py")
    print("3. 运行前端服务: cd frontend && npm install && npm run dev")
    print("\n启动选项:")
    print("- 完整启动: python start_backend.py")
    print("- 仅Python服务: python start_backend.py --python-only")
    print("- 指定服务: python start_backend.py --services genie-tool genie-client")

if __name__ == "__main__":
    main()