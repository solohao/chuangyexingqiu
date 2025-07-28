#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能体节点实现
将现有智能体包装为LangGraph节点
"""

import asyncio
from typing import Dict, Any, AsyncGenerator
from loguru import logger

from ..ConversationState import ConversationState, add_agent_result, add_stream_event, update_state_timestamp
from ...RequirementAnalysisAgent import RequirementAnalysisAgent
from ...SWOTAnalysisAgent import SWOTAnalysisAgent
from ...BusinessCanvasAgent import BusinessCanvasAgent
from ...PolicyMatchingAgent import PolicyMatchingAgent
from ...IncubatorAgent import IncubatorAgent


class AgentNodes:
    """智能体节点集合"""
    
    def __init__(self):
        # 初始化智能体实例
        self.requirement_agent = RequirementAnalysisAgent()
        self.swot_agent = SWOTAnalysisAgent()
        self.canvas_agent = BusinessCanvasAgent()
        self.policy_agent = PolicyMatchingAgent()
        self.incubator_agent = IncubatorAgent()
    
    async def requirement_analysis_node(self, state: ConversationState) -> ConversationState:
        """需求分析节点"""
        logger.info(f"[{state['request_id']}] 执行需求分析节点")
        
        # 更新当前智能体
        state["current_agent"] = "requirement_analysis"
        state["workflow_stage"] = "analyzing"
        
        # 准备参数，包含项目上下文
        parameters = {
            "project_description": state["project_description"] or state["user_query"],
            "analysis_type": "comprehensive"
        }
        
        # 如果是流式处理
        if state["is_streaming"]:
            return await self._execute_streaming_agent(
                state, 
                self.requirement_agent, 
                parameters,
                "requirement_analysis"
            )
        else:
            # 非流式处理
            result = await self.requirement_agent.execute(parameters)
            return add_agent_result(state, "requirement_analysis", result)
    
    async def swot_analysis_node(self, state: ConversationState) -> ConversationState:
        """SWOT分析节点"""
        logger.info(f"[{state['request_id']}] 执行SWOT分析节点")
        
        state["current_agent"] = "swot_analysis"
        state["workflow_stage"] = "analyzing"
        
        # 从项目上下文和前面的分析结果构建输入
        project_info = self._build_project_info_for_swot(state)
        
        parameters = {
            "project_info": project_info
        }
        
        if state["is_streaming"]:
            return await self._execute_streaming_agent(
                state,
                self.swot_agent,
                parameters,
                "swot_analysis"
            )
        else:
            result = await self.swot_agent.execute(parameters)
            return add_agent_result(state, "swot_analysis", result)
    
    async def business_canvas_node(self, state: ConversationState) -> ConversationState:
        """商业模式画布节点"""
        logger.info(f"[{state['request_id']}] 执行商业模式画布节点")
        
        state["current_agent"] = "business_canvas"
        state["workflow_stage"] = "analyzing"
        
        # 从项目上下文构建商业想法
        business_idea = self._build_business_idea_for_canvas(state)
        
        parameters = {
            "business_idea": business_idea
        }
        
        if state["is_streaming"]:
            return await self._execute_streaming_agent(
                state,
                self.canvas_agent,
                parameters,
                "business_canvas"
            )
        else:
            result = await self.canvas_agent.execute(parameters)
            return add_agent_result(state, "business_canvas", result)
    
    async def policy_matching_node(self, state: ConversationState) -> ConversationState:
        """政策匹配节点"""
        logger.info(f"[{state['request_id']}] 执行政策匹配节点")
        
        state["current_agent"] = "policy_matching"
        state["workflow_stage"] = "analyzing"
        
        parameters = {
            "project_type": state["project_type"] or "创业项目",
            "location": state["metadata"].get("location", "")
        }
        
        if state["is_streaming"]:
            return await self._execute_streaming_agent(
                state,
                self.policy_agent,
                parameters,
                "policy_matching"
            )
        else:
            result = await self.policy_agent.execute(parameters)
            return add_agent_result(state, "policy_matching", result)
    
    async def incubator_recommendation_node(self, state: ConversationState) -> ConversationState:
        """孵化器推荐节点"""
        logger.info(f"[{state['request_id']}] 执行孵化器推荐节点")
        
        state["current_agent"] = "incubator_recommendation"
        state["workflow_stage"] = "analyzing"
        
        parameters = {
            "project_stage": state["metadata"].get("project_stage", "idea"),
            "industry": state["project_type"] or "科技",
            "location": state["metadata"].get("location", "")
        }
        
        if state["is_streaming"]:
            return await self._execute_streaming_agent(
                state,
                self.incubator_agent,
                parameters,
                "incubator_recommendation"
            )
        else:
            result = await self.incubator_agent.execute(parameters)
            return add_agent_result(state, "incubator_recommendation", result)
    
    async def _execute_streaming_agent(
        self,
        state: ConversationState,
        agent: Any,
        parameters: Dict[str, Any],
        agent_name: str
    ) -> ConversationState:
        """执行流式智能体并收集结果"""
        
        # 发送开始事件
        state = add_stream_event(state, "start", f"开始{agent_name}分析", agent_name)
        
        try:
            # 收集流式输出
            full_content = ""
            final_result = None
            
            async for chunk in agent.execute_stream(parameters):
                # 添加流式事件到状态
                state = add_stream_event(state, chunk.get("type", "stream"), chunk, agent_name)
                
                # 收集内容
                if chunk.get("type") == "stream" and chunk.get("accumulated_content"):
                    full_content = chunk["accumulated_content"]
                elif chunk.get("type") == "stream_complete" and chunk.get("final_content"):
                    full_content = chunk["final_content"]
                elif chunk.get("type") == "result":
                    final_result = chunk.get("data")
            
            # 保存最终结果
            result = final_result or {"content": full_content}
            state = add_agent_result(state, agent_name, result)
            
            # 发送完成事件
            state = add_stream_event(state, "complete", f"{agent_name}分析完成", agent_name)
            
        except Exception as e:
            logger.error(f"执行{agent_name}失败: {e}")
            error_result = {"error": str(e), "success": False}
            state = add_agent_result(state, agent_name, error_result)
            state = add_stream_event(state, "error", str(e), agent_name)
        
        return update_state_timestamp(state)
    
    def _build_project_info_for_swot(self, state: ConversationState) -> str:
        """为SWOT分析构建项目信息"""
        info_parts = []
        
        # 基础项目信息
        if state["project_description"]:
            info_parts.append(f"项目描述: {state['project_description']}")
        else:
            info_parts.append(f"项目描述: {state['user_query']}")
        
        if state["project_type"]:
            info_parts.append(f"项目类型: {state['project_type']}")
        
        # 如果有需求分析结果，添加相关信息
        if "requirement_analysis" in state["agent_results"]:
            req_result = state["agent_results"]["requirement_analysis"]
            if isinstance(req_result, dict):
                if "content" in req_result:
                    info_parts.append(f"需求分析结果: {req_result['content'][:500]}...")
                elif req_result.get("success") and "result" in req_result:
                    result_data = req_result["result"]
                    if isinstance(result_data, dict):
                        if "project_overview" in result_data:
                            overview = result_data["project_overview"]
                            if isinstance(overview, dict):
                                info_parts.append(f"项目概览: {overview.get('description', '')}")
        
        return "\n".join(info_parts)
    
    def _build_business_idea_for_canvas(self, state: ConversationState) -> str:
        """为商业画布构建商业想法"""
        idea_parts = []
        
        # 基础信息
        if state["project_description"]:
            idea_parts.append(state["project_description"])
        else:
            idea_parts.append(state["user_query"])
        
        # 如果有需求分析结果，添加功能需求信息
        if "requirement_analysis" in state["agent_results"]:
            req_result = state["agent_results"]["requirement_analysis"]
            if isinstance(req_result, dict) and req_result.get("success"):
                result_data = req_result.get("result", {})
                if isinstance(result_data, dict) and "functional_requirements" in result_data:
                    func_reqs = result_data["functional_requirements"]
                    if isinstance(func_reqs, list) and func_reqs:
                        idea_parts.append(f"主要功能: {', '.join(func_reqs[:3])}")
        
        return " ".join(idea_parts)