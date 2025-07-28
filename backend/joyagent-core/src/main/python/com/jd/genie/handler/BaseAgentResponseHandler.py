#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
基础智能体响应处理器
对应原Java文件: com.jd.genie.handler.BaseAgentResponseHandler
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any
from loguru import logger

from com.jd.genie.agent.agent.AgentContext import AgentContext
from com.jd.genie.model.req.AgentRequest import AgentRequest


class BaseAgentResponseHandler(ABC):
    """基础智能体响应处理器"""
    
    def __init__(self):
        self.max_iterations = 10
        self.timeout = 300  # 5分钟超时
    
    @abstractmethod
    async def handle(self, agent_context: AgentContext, request: AgentRequest) -> AsyncGenerator[str, None]:
        """处理请求"""
        pass
    
    async def send_sse_event(self, event_type: str, data: Dict[str, Any]) -> str:
        """发送SSE事件"""
        import json
        return f"event: {event_type}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
    
    async def send_thinking(self, thinking: str, request_id: str) -> str:
        """发送思考过程"""
        data = {
            "type": "thinking",
            "content": thinking,
            "request_id": request_id
        }
        return await self.send_sse_event("thinking", data)
    
    async def send_action(self, action: str, parameters: Dict[str, Any], request_id: str) -> str:
        """发送行动"""
        data = {
            "type": "action", 
            "action": action,
            "parameters": parameters,
            "request_id": request_id
        }
        return await self.send_sse_event("action", data)
    
    async def send_observation(self, observation: str, request_id: str) -> str:
        """发送观察结果"""
        data = {
            "type": "observation",
            "content": observation,
            "request_id": request_id
        }
        return await self.send_sse_event("observation", data)
    
    async def send_final_answer(self, answer: str, request_id: str) -> str:
        """发送最终答案"""
        data = {
            "type": "final_answer",
            "content": answer,
            "request_id": request_id
        }
        return await self.send_sse_event("final_answer", data)
    
    async def send_error(self, error_message: str, request_id: str) -> str:
        """发送错误信息"""
        data = {
            "type": "error",
            "message": error_message,
            "request_id": request_id
        }
        return await self.send_sse_event("error", data)
    
    async def call_external_tool(self, tool_name: str, parameters: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """调用外部工具"""
        try:
            # 这里实现具体的工具调用逻辑
            # 根据工具名称调用相应的外部服务
            
            if tool_name == "search":
                return await self._call_search_tool(parameters, agent_context)
            elif tool_name == "code":
                return await self._call_code_tool(parameters, agent_context)
            elif tool_name == "report":
                return await self._call_report_tool(parameters, agent_context)
            else:
                return {"error": f"Unknown tool: {tool_name}"}
                
        except Exception as e:
            logger.error(f"Call tool {tool_name} error: {e}")
            return {"error": str(e)}
    
    async def _call_search_tool(self, parameters: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """调用搜索工具"""
        # 调用Genie-Tool的搜索接口
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://127.0.0.1:1601/search",
                    json=parameters,
                    timeout=30.0
                )
                return response.json()
        except Exception as e:
            return {"error": f"Search tool error: {e}"}
    
    async def _call_code_tool(self, parameters: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """调用代码工具"""
        # 调用Genie-Tool的代码执行接口
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://127.0.0.1:1601/code",
                    json=parameters,
                    timeout=60.0
                )
                return response.json()
        except Exception as e:
            return {"error": f"Code tool error: {e}"}
    
    async def _call_report_tool(self, parameters: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """调用报告工具"""
        # 调用Genie-Tool的报告生成接口
        import httpx
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "http://127.0.0.1:1601/report",
                    json=parameters,
                    timeout=60.0
                )
                return response.json()
        except Exception as e:
            return {"error": f"Report tool error: {e}"}