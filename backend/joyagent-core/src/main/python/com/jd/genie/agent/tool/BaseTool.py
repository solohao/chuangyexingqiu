#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
工具基类
对应原Java文件: com.jd.genie.agent.tool.BaseTool
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional


class BaseTool(ABC):
    """工具基类"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.agent_context: Optional[Any] = None
        self.parameters: Dict[str, Any] = {}
    
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> str:
        """执行工具 - 子类必须实现"""
        pass
    
    def get_name(self) -> str:
        """获取工具名称"""
        return self.name
    
    def get_description(self) -> str:
        """获取工具描述"""
        return self.description
    
    def get_parameters(self) -> Dict[str, Any]:
        """获取工具参数schema"""
        return self.parameters