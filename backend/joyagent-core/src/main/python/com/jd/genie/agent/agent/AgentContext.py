#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能体上下文
对应原Java文件: com.jd.genie.agent.agent.AgentContext
"""

from typing import List, Optional, Any, Dict
from dataclasses import dataclass, field
from datetime import datetime


@dataclass
class AgentContext:
    """智能体上下文类"""
    
    request_id: str
    session_id: str
    query: str
    task: str = ""
    
    # 打印器和工具
    printer: Optional[Any] = None
    tool_collection: Optional[Any] = None
    
    # 时间和文件信息
    date_info: str = ""
    product_files: List[str] = field(default_factory=list)
    task_product_files: List[str] = field(default_factory=list)
    
    # 提示信息
    sop_prompt: str = ""
    base_prompt: str = ""
    
    # 智能体配置
    agent_type: str = "react"
    is_stream: bool = False
    
    # 模型配置
    model_name: Optional[str] = None
    temperature: float = 0.7
    max_tokens: int = 2000
    max_iterations: int = 10
    
    # 执行状态
    current_step: int = 0
    max_steps: int = 40
    is_finished: bool = False
    
    # 历史记录
    execution_history: List[Dict[str, Any]] = field(default_factory=list)
    tool_calls: List[Dict[str, Any]] = field(default_factory=list)
    
    # 其他属性
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    
    def add_execution_record(self, step_type: str, content: str, result: Any = None):
        """添加执行记录"""
        record = {
            "step": self.current_step,
            "type": step_type,
            "content": content,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        self.execution_history.append(record)
    
    def add_tool_call(self, tool_name: str, parameters: Dict[str, Any], result: Any = None):
        """添加工具调用记录"""
        tool_call = {
            "step": self.current_step,
            "tool_name": tool_name,
            "parameters": parameters,
            "result": result,
            "timestamp": datetime.now().isoformat()
        }
        self.tool_calls.append(tool_call)
    
    def increment_step(self):
        """增加步骤计数"""
        self.current_step += 1
        if self.current_step >= self.max_steps:
            self.is_finished = True
    
    def finish(self):
        """标记为完成"""
        self.is_finished = True
    
    def get_context_summary(self) -> Dict[str, Any]:
        """获取上下文摘要"""
        return {
            "request_id": self.request_id,
            "session_id": self.session_id,
            "agent_type": self.agent_type,
            "current_step": self.current_step,
            "max_steps": self.max_steps,
            "is_finished": self.is_finished,
            "execution_count": len(self.execution_history),
            "tool_call_count": len(self.tool_calls),
            "created_at": self.created_at.isoformat()
        }