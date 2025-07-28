#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genie配置管理类
对应原Java文件: com.jd.genie.config.GenieConfig
"""

import os
import yaml
import json
from typing import Dict, List, Any, Optional
from pydantic import BaseModel
from pydantic_settings import BaseSettings
from pathlib import Path


class LLMConfig(BaseModel):
    """LLM配置模型"""
    base_url: str
    apikey: str
    interface_url: str
    model: str
    max_tokens: int = 2000
    temperature: float = 0.7
    max_input_tokens: int = 6000


class GenieConfig:
    """Genie主配置类"""
    
    def __init__(self):
        self.main_config = {}
        self.modelscope_config = {}
        self._load_config()
    
    def _load_config(self):
        """加载配置文件"""
        # 获取配置文件路径
        config_dir = Path(__file__).parent.parent.parent.parent / "resources"
        
        # 加载主配置文件
        main_config_path = config_dir / "application.yml"
        if main_config_path.exists():
            with open(main_config_path, 'r', encoding='utf-8') as f:
                self.main_config = yaml.safe_load(f)
        else:
            self.main_config = {}
        
        # 加载ModelScope配置
        modelscope_config_path = config_dir / "application-modelscope.yml"
        if modelscope_config_path.exists():
            with open(modelscope_config_path, 'r', encoding='utf-8') as f:
                self.modelscope_config = yaml.safe_load(f)
        else:
            self.modelscope_config = {}
    
    def get_llm_config(self) -> Dict[str, Any]:
        """获取LLM配置"""
        llm_config = self.main_config.get('llm', {})
        
        # 处理环境变量替换
        default_config = llm_config.get('default', {})
        if 'apikey' in default_config:
            apikey = default_config['apikey']
            if '${' in apikey:
                # 提取环境变量名
                env_var = apikey.split('${')[1].split(':')[0].rstrip('}')
                default_value = apikey.split(':')[1].rstrip('}') if ':' in apikey else ''
                default_config['apikey'] = os.getenv(env_var, default_value)
        
        return llm_config
    
    def get_llm_settings(self) -> Dict[str, LLMConfig]:
        """获取LLM设置"""
        llm_config = self.get_llm_config()
        settings_str = llm_config.get('settings', '{}')
        
        try:
            settings_dict = json.loads(settings_str)
            llm_settings = {}
            
            for model_name, config in settings_dict.items():
                # 处理环境变量
                if 'apikey' in config and '${' in config['apikey']:
                    env_var = config['apikey'].split('${')[1].split(':')[0].rstrip('}')
                    default_value = config['apikey'].split(':')[1].rstrip('}') if ':' in config['apikey'] else ''
                    config['apikey'] = os.getenv(env_var, default_value)
                
                llm_settings[model_name] = LLMConfig(**config)
            
            return llm_settings
        except json.JSONDecodeError:
            return {}
    
    def get_autobot_config(self) -> Dict[str, Any]:
        """获取自动机器人配置"""
        return self.main_config.get('autobots', {})
    
    def get_autoagent_config(self) -> Dict[str, Any]:
        """获取自动智能体配置"""
        autobots = self.get_autobot_config()
        return autobots.get('autoagent', {})
    
    def get_planner_config(self) -> Dict[str, Any]:
        """获取规划器配置"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('planner', {})
    
    def get_executor_config(self) -> Dict[str, Any]:
        """获取执行器配置"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('executor', {})
    
    def get_react_config(self) -> Dict[str, Any]:
        """获取React配置"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('react', {})
    
    def get_tool_config(self) -> Dict[str, Any]:
        """获取工具配置"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('tool', {})
    
    def get_code_interpreter_url(self) -> str:
        """获取代码解释器URL"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('code_interpreter_url', 'http://127.0.0.1:1601')
    
    def get_deep_search_url(self) -> str:
        """获取深度搜索URL"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('deep_search_url', 'http://127.0.0.1:1601')
    
    def get_mcp_client_url(self) -> str:
        """获取MCP客户端URL"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('mcp_client_url', 'http://127.0.0.1:8188')
    
    def get_mcp_server_url_arr(self) -> List[str]:
        """获取MCP服务器URL数组"""
        autoagent = self.get_autoagent_config()
        mcp_server_url = autoagent.get('mcp_server_url', '')
        if mcp_server_url:
            return [mcp_server_url]
        return []
    
    def get_multi_agent_tool_list_map(self) -> Dict[str, str]:
        """获取多智能体工具列表映射"""
        return {
            'default': 'search,code,report'
        }
    
    def get_output_style_prompts(self) -> Dict[str, str]:
        """获取输出样式提示"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('output_style_prompts', {
            'html': '',
            'docs': '，最后以 markdown 展示最终结果',
            'table': '，最后以excel 展示最终结果',
            'ppt': '，最后以 ppt 展示最终结果'
        })
    
    def get_server_port(self) -> int:
        """获取服务器端口"""
        server_config = self.main_config.get('server', {})
        return server_config.get('port', 8080)
    
    def get_default_model_name(self) -> str:
        """获取默认模型名称"""
        autoagent = self.get_autoagent_config()
        return autoagent.get('default_model_name', 'gpt-4.1')
    
