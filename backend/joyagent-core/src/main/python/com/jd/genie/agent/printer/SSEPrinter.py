#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSE打印器
对应原Java文件: com.jd.genie.agent.printer.SSEPrinter
"""

import json
import asyncio
from typing import Any, Dict, Optional
from loguru import logger

from com.jd.genie.util.SseEmitterUTF8 import SseEmitterUTF8
from com.jd.genie.model.req.AgentRequest import AgentRequest


class SSEPrinter:
    """SSE打印器类"""
    
    def __init__(self, emitter: SseEmitterUTF8, request: AgentRequest, agent_type: str):
        self.emitter = emitter
        self.request = request
        self.agent_type = agent_type
        self.request_id = request.request_id
    
    async def print_text(self, text: str, event_type: str = "message"):
        """打印文本"""
        try:
            await self.emitter.send_text(text, event_type)
            logger.debug(f"{self.request_id} printed text: {text[:100]}...")
        except Exception as e:
            logger.error(f"{self.request_id} print text error: {e}")
    
    async def print_json(self, data: Dict[str, Any], event_type: str = "message"):
        """打印JSON数据"""
        try:
            await self.emitter.send_json(data, event_type)
            logger.debug(f"{self.request_id} printed json: {list(data.keys())}")
        except Exception as e:
            logger.error(f"{self.request_id} print json error: {e}")
    
    async def print_thinking(self, thinking: str):
        """打印思考过程"""
        data = {
            "type": "thinking",
            "content": thinking,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "thinking")
    
    async def print_action(self, action: str, parameters: Optional[Dict[str, Any]] = None):
        """打印行动"""
        data = {
            "type": "action",
            "action": action,
            "parameters": parameters or {},
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "action")
    
    async def print_observation(self, observation: str):
        """打印观察结果"""
        data = {
            "type": "observation",
            "content": observation,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "observation")
    
    async def print_tool_call(self, tool_name: str, parameters: Dict[str, Any], result: Any = None):
        """打印工具调用"""
        data = {
            "type": "tool_call",
            "tool_name": tool_name,
            "parameters": parameters,
            "result": result,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "tool_call")
    
    async def print_step_start(self, step: int, description: str):
        """打印步骤开始"""
        data = {
            "type": "step_start",
            "step": step,
            "description": description,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "step")
    
    async def print_step_end(self, step: int, result: str):
        """打印步骤结束"""
        data = {
            "type": "step_end",
            "step": step,
            "result": result,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "step")
    
    async def print_final_answer(self, answer: str):
        """打印最终答案"""
        data = {
            "type": "final_answer",
            "content": answer,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "final_answer")
    
    async def print_error(self, error_message: str):
        """打印错误信息"""
        data = {
            "type": "error",
            "message": error_message,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "error")
    
    async def print_progress(self, current: int, total: int, description: str = ""):
        """打印进度"""
        data = {
            "type": "progress",
            "current": current,
            "total": total,
            "percentage": round((current / total) * 100, 2) if total > 0 else 0,
            "description": description,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "progress")
    
    async def print_status(self, status: str, message: str = ""):
        """打印状态"""
        data = {
            "type": "status",
            "status": status,
            "message": message,
            "agent_type": self.agent_type,
            "request_id": self.request_id
        }
        await self.print_json(data, "status")
    
    async def close(self):
        """关闭打印器"""
        try:
            await self.emitter.complete()
            logger.info(f"{self.request_id} SSE printer closed")
        except Exception as e:
            logger.error(f"{self.request_id} close printer error: {e}")