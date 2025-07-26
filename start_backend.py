#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创业星球多智能体系统 - Python一键启动脚本
支持启动所有后端服务：JoyAgent-Core (Java) + Genie-Tool (Python) + Genie-Client (Python)
"""

import os
import sys
import time
import subprocess
import threading
import signal
import argparse
import socket
from pathlib import Path
from typing import List, Dict, Optional
import psutil
import requests

class Colors:
    """终端颜色定义"""
    RED = '\033[0;31m'
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    BLUE = '\033[0;34m'
    PURPLE = '\033[0;35m'
    CYAN = '\033[0;36m'
    WHITE = '\033[1;37m'
    NC = '\033[0m'  # No Color

class Logger:
    """日志输出类"""
    
    @staticmethod
    def info(message: str):
        print(f"{Colors.BLUE}[INFO]{Colors.NC} {message}")
    
    @staticmethod
    def success(message: str):
        print(f"{Colors.GREEN}[SUCCESS]{Colors.NC} {message}")
    
    @staticmethod
    def warning(message: str):
        print(f"{Colors.YELLOW}[WARNING]{Colors.NC} {message}")
    
    @staticmethod
    def error(message: str):
        print(f"{Colors.RED}[ERROR]{Colors.NC} {message}")
    
    @staticmethod
    def debug(message: str):
        print(f"{Colors.PURPLE}[DEBUG]{Colors.NC} {message}")

class ServiceManager:
    """服务管理器"""
    
    def __init__(self):
        self.processes: Dict[str, subprocess.Popen] = {}
        self.root_dir = Path(__file__).parent.absolute()
        self.logger = Logger()
        
        # 服务配置
        self.services = {
            'joyagent-core': {
                'name': 'JoyAgent-Core (Java)',
                'port': 8080,
                'dir': 'backend/joyagent-core',
                'start_cmd': ['./start.sh'],
                'health_url': 'http://localhost:8080/health',
                'required': True,
                'type': 'java'
            },
            'genie-tool': {
                'name': 'Genie-Tool (Python)',
                'port': 1601,
                'dir': 'backend/genie-tool',
                'start_cmd': ['./start.sh'],
                'health_url': 'http://localhost:1601/health',
                'required': False,
                'type': 'python'
            },
            'genie-client': {
                'name': 'Genie-Client (Python)',
                'port': 8188,
                'dir': 'backend/genie-client',
                'start_cmd': ['./start.sh'],
                'health_url': 'http://localhost:8188/health',
                'required': False,
                'type': 'python'
            }
        }
    
    def check_environment(self) -> bool:
        """检查环境配置"""
        self.logger.info("检查环境配置...")
        
        # 检查环境配置文件
        env_file = self.root_dir / '.env'
        env_local_file = self.root_dir / '.env.local'
        
        if not env_file.exists():
            self.logger.error("默认环境配置文件 .env 不存在！")
            return False
        
        if not env_local_file.exists():
            self.logger.warning("本地环境配置文件 .env.local 不存在")
            self.logger.info("建议复制 .env.example 为 .env.local 并配置你的API Key")
            self.logger.info("系统将使用 .env 中的默认配置")
        
        # 检查API Key配置
        config_file = env_local_file if env_local_file.exists() else env_file
        try:
            with open(config_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if 'your_modelscope_api_key_here' in content:
                    self.logger.error("API Key未配置，仍为占位符")
                    self.logger.info(f"请在 {config_file.name} 中设置正确的 MODELSCOPE_ACCESS_TOKEN")
                    return False
        except Exception as e:
            self.logger.error(f"读取配置文件失败: {e}")
            return False
        
        self.logger.success("环境配置检查通过")
        return True
    
    def check_dependencies(self, service_types: List[str]) -> bool:
        """检查依赖环境"""
        self.logger.info("检查依赖环境...")
        
        # 检查Python
        try:
            python_version = subprocess.check_output([sys.executable, '--version'], 
                                                   stderr=subprocess.STDOUT, text=True).strip()
            self.logger.success(f"Python: {python_version}")
        except Exception as e:
            self.logger.error(f"Python检查失败: {e}")
            return False
        
        # 如果需要Java服务，检查Java
        if 'java' in service_types:
            try:
                java_version = subprocess.check_output(['java', '-version'], 
                                                     stderr=subprocess.STDOUT, text=True)
                java_version_line = java_version.split('\n')[0]
                self.logger.success(f"Java: {java_version_line}")
            except Exception as e:
                self.logger.error(f"Java检查失败: {e}")
                self.logger.error("请安装Java 11+或使用 --python-only 选项")
                return False
            
            # 检查Maven
            try:
                mvn_version = subprocess.check_output(['mvn', '-version'], 
                                                    stderr=subprocess.STDOUT, text=True)
                mvn_version_line = mvn_version.split('\n')[0]
                self.logger.success(f"Maven: {mvn_version_line}")
            except Exception as e:
                self.logger.error(f"Maven检查失败: {e}")
                self.logger.error("请安装Maven或使用 --python-only 选项")
                return False
        
        return True
    
    def check_port(self, port: int, service_name: str) -> bool:
        """检查端口是否被占用"""
        try:
            for conn in psutil.net_connections():
                if conn.laddr.port == port and conn.status == psutil.CONN_LISTEN:
                    self.logger.warning(f"端口 {port} 已被占用，可能 {service_name} 已在运行")
                    return False
            return True
        except Exception:
            # 如果psutil检查失败，尝试简单的连接测试
            import socket
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                result = s.connect_ex(('localhost', port))
                if result == 0:
                    self.logger.warning(f"端口 {port} 已被占用，可能 {service_name} 已在运行")
                    return False
            return True
    
    def prepare_java_service(self, service_name: str) -> bool:
        """准备Java服务（构建项目）"""
        if service_name != 'joyagent-core':
            return True
        
        service_dir = self.root_dir / self.services[service_name]['dir']
        target_dir = service_dir / 'target'
        
        if not target_dir.exists():
            self.logger.info("首次运行，正在构建Java项目...")
            try:
                result = subprocess.run(
                    ['mvn', 'clean', 'package', '-DskipTests'],
                    cwd=service_dir,
                    capture_output=True,
                    text=True,
                    timeout=300  # 5分钟超时
                )
                if result.returncode != 0:
                    self.logger.error(f"Maven构建失败: {result.stderr}")
                    return False
                self.logger.success("Java项目构建完成")
            except subprocess.TimeoutExpired:
                self.logger.error("Maven构建超时")
                return False
            except Exception as e:
                self.logger.error(f"Maven构建异常: {e}")
                return False
        
        return True
    
    def prepare_python_service(self, service_name: str) -> bool:
        """准备Python服务（安装依赖）"""
        service_dir = self.root_dir / self.services[service_name]['dir']
        venv_dir = service_dir / '.venv'
        
        if not venv_dir.exists():
            self.logger.info(f"为 {service_name} 创建Python虚拟环境...")
            try:
                subprocess.run([sys.executable, '-m', 'venv', '.venv'], 
                             cwd=service_dir, check=True)
                
                # 安装依赖
                if (service_dir / 'requirements.txt').exists():
                    pip_cmd = str(venv_dir / 'bin' / 'pip') if os.name != 'nt' else str(venv_dir / 'Scripts' / 'pip.exe')
                    subprocess.run([pip_cmd, 'install', '-r', 'requirements.txt'], 
                                 cwd=service_dir, check=True)
                elif (service_dir / 'pyproject.toml').exists():
                    pip_cmd = str(venv_dir / 'bin' / 'pip') if os.name != 'nt' else str(venv_dir / 'Scripts' / 'pip.exe')
                    subprocess.run([pip_cmd, 'install', '-e', '.'], 
                                 cwd=service_dir, check=True)
                
                self.logger.success(f"{service_name} Python环境准备完成")
            except Exception as e:
                self.logger.error(f"Python环境准备失败: {e}")
                return False
        
        return True
    
    def start_service(self, service_name: str) -> bool:
        """启动单个服务"""
        service = self.services[service_name]
        service_dir = self.root_dir / service['dir']
        
        self.logger.info(f"启动 {service['name']}...")
        
        # 检查端口
        if not self.check_port(service['port'], service['name']):
            return False
        
        # 准备服务环境
        if service['type'] == 'java':
            if not self.prepare_java_service(service_name):
                return False
        elif service['type'] == 'python':
            if not self.prepare_python_service(service_name):
                return False
        
        # 启动服务
        try:
            # 设置环境变量
            env = os.environ.copy()
            
            # 加载.env文件
            env_file = self.root_dir / '.env'
            if env_file.exists():
                self._load_env_file(env_file, env)
            
            # 加载.env.local文件（优先级更高）
            env_local_file = self.root_dir / '.env.local'
            if env_local_file.exists():
                self._load_env_file(env_local_file, env)
            
            # 启动进程
            process = subprocess.Popen(
                service['start_cmd'],
                cwd=service_dir,
                env=env,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            self.processes[service_name] = process
            
            # 启动日志输出线程
            log_thread = threading.Thread(
                target=self._log_output,
                args=(process, service['name']),
                daemon=True
            )
            log_thread.start()
            
            self.logger.success(f"{service['name']} 启动完成 (端口: {service['port']})")
            return True
            
        except Exception as e:
            self.logger.error(f"启动 {service['name']} 失败: {e}")
            return False
    
    def _load_env_file(self, env_file: Path, env_dict: dict):
        """加载环境变量文件"""
        try:
            with open(env_file, 'r', encoding='utf-8') as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith('#') and '=' in line:
                        key, value = line.split('=', 1)
                        env_dict[key.strip()] = value.strip()
        except Exception as e:
            self.logger.warning(f"加载环境文件 {env_file} 失败: {e}")
    
    def _log_output(self, process: subprocess.Popen, service_name: str):
        """输出服务日志"""
        try:
            for line in iter(process.stdout.readline, ''):
                if line:
                    print(f"{Colors.CYAN}[{service_name}]{Colors.NC} {line.rstrip()}")
        except Exception:
            pass
    
    def wait_for_service(self, service_name: str, timeout: int = 60) -> bool:
        """等待服务启动完成"""
        service = self.services[service_name]
        health_url = service.get('health_url')
        
        if not health_url:
            time.sleep(5)  # 简单等待
            return True
        
        self.logger.info(f"等待 {service['name']} 启动完成...")
        
        for i in range(timeout):
            try:
                response = requests.get(health_url, timeout=2)
                if response.status_code == 200:
                    self.logger.success(f"{service['name']} 健康检查通过")
                    return True
            except Exception:
                pass
            
            time.sleep(1)
        
        self.logger.warning(f"{service['name']} 健康检查超时")
        return False
    
    def start_all_services(self, service_names: List[str]) -> bool:
        """启动所有服务"""
        self.logger.info("=== 启动后端服务 ===")
        
        success_count = 0
        for service_name in service_names:
            if self.start_service(service_name):
                # 等待服务启动
                if self.wait_for_service(service_name):
                    success_count += 1
                    time.sleep(2)  # 服务间启动间隔
                else:
                    self.logger.warning(f"{service_name} 可能未完全启动")
            else:
                if self.services[service_name]['required']:
                    self.logger.error(f"必需服务 {service_name} 启动失败")
                    return False
        
        if success_count > 0:
            self.logger.success("=== 后端服务启动完成 ===")
            self._print_service_info(service_names)
            return True
        else:
            self.logger.error("没有服务成功启动")
            return False
    
    def _print_service_info(self, service_names: List[str]):
        """打印服务信息"""
        print(f"\n{Colors.WHITE}服务访问地址:{Colors.NC}")
        for service_name in service_names:
            if service_name in self.processes:
                service = self.services[service_name]
                print(f"  • {service['name']}: http://localhost:{service['port']}")
        print(f"\n{Colors.YELLOW}按 Ctrl+C 停止所有服务{Colors.NC}\n")
    
    def stop_all_services(self):
        """停止所有服务"""
        self.logger.info("正在停止所有服务...")
        
        for service_name, process in self.processes.items():
            try:
                self.logger.info(f"停止 {self.services[service_name]['name']}...")
                process.terminate()
                
                # 等待进程结束
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    self.logger.warning(f"强制终止 {service_name}")
                    process.kill()
                    process.wait()
                
            except Exception as e:
                self.logger.error(f"停止 {service_name} 失败: {e}")
        
        self.processes.clear()
        self.logger.success("所有服务已停止")
    
    def run(self, python_only: bool = False, services: Optional[List[str]] = None):
        """运行服务管理器"""
        # 确定要启动的服务
        if services:
            service_names = [s for s in services if s in self.services]
        elif python_only:
            service_names = ['genie-tool', 'genie-client']
        else:
            service_names = list(self.services.keys())
        
        # 检查环境
        if not self.check_environment():
            sys.exit(1)
        
        # 检查依赖
        service_types = [self.services[name]['type'] for name in service_names]
        if not self.check_dependencies(service_types):
            sys.exit(1)
        
        # 设置信号处理
        def signal_handler(signum, frame):
            self.stop_all_services()
            sys.exit(0)
        
        signal.signal(signal.SIGINT, signal_handler)
        signal.signal(signal.SIGTERM, signal_handler)
        
        # 启动服务
        if self.start_all_services(service_names):
            try:
                # 保持运行
                while True:
                    time.sleep(1)
                    # 检查进程是否还在运行
                    for service_name in list(self.processes.keys()):
                        process = self.processes[service_name]
                        if process.poll() is not None:
                            self.logger.error(f"{self.services[service_name]['name']} 意外退出")
                            del self.processes[service_name]
            except KeyboardInterrupt:
                pass
        else:
            sys.exit(1)

def main():
    """主函数"""
    parser = argparse.ArgumentParser(description='创业星球多智能体系统后端启动器')
    parser.add_argument('--python-only', action='store_true', 
                       help='仅启动Python服务，不启动Java服务')
    parser.add_argument('--services', nargs='+', 
                       choices=['joyagent-core', 'genie-tool', 'genie-client'],
                       help='指定要启动的服务')
    
    args = parser.parse_args()
    
    manager = ServiceManager()
    manager.run(python_only=args.python_only, services=args.services)

if __name__ == '__main__':
    main()