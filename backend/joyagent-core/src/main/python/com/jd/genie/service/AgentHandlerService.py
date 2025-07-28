#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能体处理服务
对应原Java文件: com.jd.genie.service.AgentHandlerService
"""

from typing import AsyncGenerator, Dict, Any
from loguru import logger

from com.jd.genie.agent.agent.AgentContext import AgentContext
from com.jd.genie.model.req.AgentRequest import AgentRequest
from com.jd.genie.handler.ReactAgentResponseHandler import ReactAgentResponseHandler
from com.jd.genie.handler.PlanSolveAgentResponseHandler import PlanSolveAgentResponseHandler


class AgentHandlerService:
    """智能体处理服务类"""
    
    def __init__(self):
        self.handlers = {
            "react": ReactAgentResponseHandler(),
            "planner": PlanSolveAgentResponseHandler(),
            "executor": PlanSolveAgentResponseHandler(),
            "default": ReactAgentResponseHandler()
        }
    
    def get_handler(self, agent_context: AgentContext, request: AgentRequest):
        """获取处理器"""
        agent_type = request.agent_type or "react"
        
        handler = self.handlers.get(agent_type)
        if not handler:
            logger.warning(f"Unknown agent type: {agent_type}, using default handler")
            handler = self.handlers["default"]
        
        return handler
    
    async def handle_request(self, agent_context: AgentContext, request: AgentRequest) -> AsyncGenerator[str, None]:
        """处理请求"""
        handler = self.get_handler(agent_context, request)
        
        try:
            async for event in handler.handle(agent_context, request):
                yield event
        except Exception as e:
            logger.error(f"{agent_context.request_id} handle request error: {e}")
            error_event = f"data: {{'error': '{str(e)}'}}\n\n"
            yield error_event