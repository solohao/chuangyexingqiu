#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能体基类
创业星球专用智能体基类
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
from enum import Enum
from loguru import logger
import asyncio
import json


class AgentState(Enum):
    """智能体状态枚举"""
    IDLE = "idle"
    RUNNING = "running"
    FINISHED = "finished"
    ERROR = "error"


class RoleType(Enum):
    """角色类型枚举"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


class Message:
    """消息类"""
    def __init__(self, role: RoleType, content: str, metadata: Optional[Dict] = None):
        self.role = role
        self.content = content
        self.metadata = metadata or {}


class Memory:
    """记忆管理类"""
    def __init__(self):
        self.messages: List[Message] = []
    
    def add_message(self, message: Message):
        """添加消息到记忆中"""
        self.messages.append(message)
    
    def get_messages(self) -> List[Message]:
        """获取所有消息"""
        return self.messages
    
    def clear(self):
        """清空记忆"""
        self.messages.clear()


class BaseAgent(ABC):
    """智能体基类"""
    
    def __init__(self, name: str, description: str):
        self.name = name
        self.description = description
        self.state = AgentState.IDLE
        self.memory = Memory()
        self.max_steps = 10
        self.current_step = 0
        self.agent_context: Optional[Any] = None
        
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    @abstractmethod
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行智能体任务 - 子类必须实现"""
        pass
    
    async def run(self, query: str, parameters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """运行智能体主循环"""
        self.state = AgentState.RUNNING
        
        try:
            # 添加用户查询到记忆
            if query:
                self.memory.add_message(Message(RoleType.USER, query))
            
            # 执行智能体任务
            result = await self.execute(parameters or {})
            
            # 添加结果到记忆
            if result.get("success"):
                self.memory.add_message(Message(RoleType.ASSISTANT, json.dumps(result)))
            
            self.state = AgentState.FINISHED
            return result
            
        except Exception as e:
            self.state = AgentState.ERROR
            logger.error(f"Agent {self.name} execution failed: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": self.name
            }
    
    def update_memory(self, role: RoleType, content: str, metadata: Optional[Dict] = None):
        """更新智能体记忆"""
        message = Message(role, content, metadata)
        self.memory.add_message(message)
    
    def get_memory_summary(self) -> List[Dict]:
        """获取记忆摘要"""
        return [
            {
                "role": msg.role.value,
                "content": msg.content,
                "metadata": msg.metadata
            }
            for msg in self.memory.get_messages()
        ]
    
    def reset(self):
        """重置智能体状态"""
        self.state = AgentState.IDLE
        self.current_step = 0
        self.memory.clear()