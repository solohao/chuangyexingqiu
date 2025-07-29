#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
直接模式智能体路由器
在直接模式下智能选择和执行智能体
"""

from typing import Dict, Any, Optional, AsyncGenerator
from loguru import logger

from .context.ConversationContextManager import conversation_context_manager
from .RequirementAnalysisAgent import RequirementAnalysisAgent
from .SWOTAnalysisAgent import SWOTAnalysisAgent
from .BusinessCanvasAgent import BusinessCanvasAgent
from .PolicyMatchingAgent import PolicyMatchingAgent
from .IncubatorAgent import IncubatorAgent


class DirectModeRouter:
    """直接模式智能体路由器"""
    
    def __init__(self):
        # 初始化所有智能体
        self.agents = {
            "requirement_analysis_agent": RequirementAnalysisAgent(),
            "swot_analysis_agent": SWOTAnalysisAgent(),
            "business_canvas_agent": BusinessCanvasAgent(),
            "policy_matching_agent": PolicyMatchingAgent(),
            "incubator_recommendation_agent": IncubatorAgent()
        }
        
        # 智能体显示名称映射
        self.agent_display_names = {
            "requirement_analysis_agent": "需求分析智能体",
            "swot_analysis_agent": "SWOT分析智能体",
            "business_canvas_agent": "商业画布智能体",
            "policy_matching_agent": "政策匹配智能体",
            "incubator_recommendation_agent": "孵化器推荐智能体"
        }
    
    def create_or_get_session(self, session_id: str, user_query: str, project_description: str = "", project_type: str = "") -> Dict[str, Any]:
        """创建或获取对话会话"""
        session = conversation_context_manager.get_session(session_id)
        
        if not session:
            # 创建新会话
            session = conversation_context_manager.create_session(
                session_id=session_id,
                user_query=user_query,
                project_description=project_description,
                project_type=project_type
            )
            logger.info(f"创建新的对话会话: {session_id}")
        else:
            logger.info(f"使用现有对话会话: {session_id}")
        
        return session
    
    def analyze_user_intent(self, user_query: str, session_id: str = None) -> str:
        """分析用户意图，确定应该使用哪个智能体"""
        query_lower = user_query.lower()
        
        # 获取会话信息
        session = None
        if session_id:
            session = conversation_context_manager.get_session(session_id)
        
        # 如果用户明确要求特定分析
        if any(keyword in query_lower for keyword in ["swot", "优势", "劣势", "机会", "威胁"]):
            return "swot_analysis_agent"
        
        if any(keyword in query_lower for keyword in ["商业模式", "画布", "商业计划"]):
            return "business_canvas_agent"
        
        if any(keyword in query_lower for keyword in ["政策", "补贴", "扶持", "优惠"]):
            return "policy_matching_agent"
        
        if any(keyword in query_lower for keyword in ["孵化器", "加速器", "投资", "融资"]):
            return "incubator_recommendation_agent"
        
        # 如果用户说"继续分析"或类似的话
        if any(keyword in query_lower for keyword in ["继续", "接下来", "然后", "下一步"]):
            if session:
                # 建议下一个智能体
                next_agent = conversation_context_manager.suggest_next_agent(session_id)
                if next_agent:
                    return next_agent
        
        # 默认情况：如果没有任何分析结果，从需求分析开始
        if not session or not session.get("agent_results"):
            return "requirement_analysis_agent"
        
        # 如果已有需求分析，建议SWOT分析
        if "requirement_analysis_agent" in session.get("agent_results", {}):
            if "swot_analysis_agent" not in session.get("agent_results", {}):
                return "swot_analysis_agent"
        
        # 默认返回需求分析
        return "requirement_analysis_agent"
    
    async def execute_agent(
        self, 
        agent_name: str, 
        session_id: str, 
        user_query: str = "",
        is_streaming: bool = True,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """执行指定的智能体"""
        
        if agent_name not in self.agents:
            yield {
                "type": "error",
                "error": f"未知的智能体: {agent_name}",
                "available_agents": list(self.agents.keys())
            }
            return
        
        agent = self.agents[agent_name]
        display_name = self.agent_display_names.get(agent_name, agent_name)
        
        # 发送开始事件
        yield {
            "type": "agent_start",
            "agent": agent_name,
            "agent_display_name": display_name,
            "message": f"正在与{display_name}对话"
        }
        
        try:
            if is_streaming:
                # 流式执行
                async for chunk in agent.execute_direct_stream(session_id=session_id, **kwargs):
                    # 添加智能体信息到chunk
                    chunk["agent"] = agent_name
                    chunk["agent_display_name"] = display_name
                    yield chunk
            else:
                # 非流式执行
                result = await agent.execute_direct(session_id=session_id, **kwargs)
                yield {
                    "type": "result",
                    "agent": agent_name,
                    "agent_display_name": display_name,
                    "data": result
                }
        
        except Exception as e:
            logger.error(f"执行智能体 {agent_name} 失败: {e}")
            yield {
                "type": "error",
                "agent": agent_name,
                "agent_display_name": display_name,
                "error": str(e)
            }
    
    async def handle_user_query(
        self,
        user_query: str,
        session_id: str,
        project_description: str = "",
        project_type: str = "",
        is_streaming: bool = True
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """处理用户查询，自动选择和执行智能体"""
        
        # 创建或获取会话
        session = self.create_or_get_session(session_id, user_query, project_description, project_type)
        
        # 分析用户意图
        suggested_agent = self.analyze_user_intent(user_query, session_id)
        
        logger.info(f"用户查询: {user_query}")
        logger.info(f"建议智能体: {suggested_agent}")
        
        # 发送路由信息
        yield {
            "type": "routing",
            "suggested_agent": suggested_agent,
            "agent_display_name": self.agent_display_names.get(suggested_agent, suggested_agent),
            "message": f"已切换到直接模式，正在与{self.agent_display_names.get(suggested_agent, suggested_agent)}对话"
        }
        
        # 执行智能体
        async for event in self.execute_agent(
            agent_name=suggested_agent,
            session_id=session_id,
            user_query=user_query,
            is_streaming=is_streaming
        ):
            yield event
        
        # 发送完成信息和建议
        next_agent = conversation_context_manager.suggest_next_agent(session_id)
        if next_agent:
            yield {
                "type": "suggestion",
                "next_agent": next_agent,
                "next_agent_display_name": self.agent_display_names.get(next_agent, next_agent),
                "message": f"分析完成！如需进一步分析，可以说\"请你继续分析\"，我将为您提供{self.agent_display_names.get(next_agent, next_agent)}服务。"
            }
        else:
            yield {
                "type": "completion",
                "message": "所有建议的分析已完成！如有其他需求，请随时告诉我。"
            }
    
    def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """获取会话摘要"""
        return conversation_context_manager.get_session_summary(session_id)
    
    def clear_session(self, session_id: str) -> bool:
        """清除会话"""
        return conversation_context_manager.clear_session(session_id)


# 全局路由器实例
direct_mode_router = DirectModeRouter()