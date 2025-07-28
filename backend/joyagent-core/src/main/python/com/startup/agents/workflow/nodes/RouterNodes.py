#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
路由节点实现
智能的条件路由和工作流控制
"""

import re
from typing import Dict, Any, List
from loguru import logger

from ..ConversationState import ConversationState, add_stream_event, update_state_timestamp
from com.jd.genie.agent.llm.LLMService import llm_service


class RouterNodes:
    """路由节点集合"""
    
    def __init__(self):
        # 智能体映射
        self.agent_mapping = {
            "requirement_analysis": "需求分析",
            "swot_analysis": "SWOT分析", 
            "business_canvas": "商业模式画布",
            "policy_matching": "政策匹配",
            "incubator_recommendation": "孵化器推荐"
        }
        
        # 智能体依赖关系
        self.agent_dependencies = {
            "swot_analysis": ["requirement_analysis"],  # SWOT分析依赖需求分析
            "business_canvas": ["requirement_analysis"],  # 商业画布依赖需求分析
            "policy_matching": [],  # 政策匹配可独立执行
            "incubator_recommendation": []  # 孵化器推荐可独立执行
        }
    
    async def intent_analysis_node(self, state: ConversationState) -> ConversationState:
        """意图分析节点 - 分析用户意图并确定需要的智能体"""
        logger.info(f"[{state['request_id']}] 执行意图分析")
        
        state["current_agent"] = "intent_analyzer"
        state["workflow_stage"] = "routing"
        
        # 发送分析开始事件
        if state["is_streaming"]:
            state = add_stream_event(state, "start", "正在分析您的需求...", "intent_analyzer")
        
        try:
            # 使用LLM分析用户意图
            intent_result = await self._analyze_user_intent(state["user_query"])
            
            # 更新状态
            state["user_intent"] = intent_result["intent"]
            state["requested_agents"] = intent_result["agents"]
            state["project_description"] = intent_result.get("project_description", state["user_query"])
            state["project_type"] = intent_result.get("project_type", "")
            
            # 发送分析结果事件
            if state["is_streaming"]:
                analysis_message = f"已识别您的需求：{intent_result['intent']}\n将为您提供：{', '.join([self.agent_mapping.get(a, a) for a in intent_result['agents']])}"
                state = add_stream_event(state, "progress", analysis_message, "intent_analyzer")
            
            logger.info(f"[{state['request_id']}] 意图分析完成: {intent_result}")
            
        except Exception as e:
            logger.error(f"意图分析失败: {e}")
            # 使用默认策略
            state["user_intent"] = "创业项目分析"
            state["requested_agents"] = ["requirement_analysis"]
            state["project_description"] = state["user_query"]
            
            if state["is_streaming"]:
                state = add_stream_event(state, "progress", "将为您提供需求分析服务", "intent_analyzer")
        
        return update_state_timestamp(state)
    
    async def workflow_router_node(self, state: ConversationState) -> ConversationState:
        """工作流路由节点 - 决定下一个执行的智能体"""
        logger.info(f"[{state['request_id']}] 执行工作流路由")
        
        state["current_agent"] = "workflow_router"
        state["workflow_stage"] = "routing"
        
        # 确定下一个要执行的智能体
        next_agent = self._determine_next_agent(state)
        
        if next_agent:
            state["next_agent"] = next_agent
            state["should_continue"] = True
            
            if state["is_streaming"]:
                agent_name = self.agent_mapping.get(next_agent, next_agent)
                state = add_stream_event(state, "progress", f"准备执行{agent_name}...", "workflow_router")
        else:
            state["next_agent"] = None
            state["should_continue"] = False
            state["workflow_stage"] = "completed"
            
            if state["is_streaming"]:
                state = add_stream_event(state, "progress", "所有分析已完成", "workflow_router")
        
        logger.info(f"[{state['request_id']}] 路由决定: next_agent={next_agent}")
        
        return update_state_timestamp(state)
    
    def workflow_condition(self, state: ConversationState) -> str:
        """工作流条件判断 - 返回下一个节点名称"""
        
        # 如果工作流已完成
        if not state["should_continue"] or state["workflow_stage"] == "completed":
            return "END"
        
        # 如果还没有分析用户意图
        if not state["user_intent"] or not state["requested_agents"]:
            return "intent_analysis"
        
        # 获取下一个智能体
        next_agent = state.get("next_agent")
        
        if next_agent:
            return next_agent
        else:
            # 需要路由决策
            return "workflow_router"
    
    def agent_condition(self, state: ConversationState) -> str:
        """智能体执行后的条件判断"""
        
        # 检查是否还有未完成的智能体
        remaining_agents = set(state["requested_agents"]) - set(state["completed_agents"])
        
        if remaining_agents:
            return "workflow_router"  # 继续路由到下一个智能体
        else:
            return "END"  # 所有智能体都已完成
    
    async def _analyze_user_intent(self, user_query: str) -> Dict[str, Any]:
        """使用LLM分析用户意图"""
        
        system_prompt = """你是一个智能的创业助手路由器。根据用户的查询，分析他们的意图并推荐合适的智能体服务。

可用的智能体服务：
1. requirement_analysis - 需求分析：分析项目需求、可行性、复杂度
2. swot_analysis - SWOT分析：分析优势、劣势、机会、威胁
3. business_canvas - 商业模式画布：设计商业模式的九大要素
4. policy_matching - 政策匹配：匹配相关的创业政策和补贴
5. incubator_recommendation - 孵化器推荐：推荐合适的孵化器和加速器

请分析用户意图并返回JSON格式的结果：
{
    "intent": "用户意图描述",
    "agents": ["推荐的智能体列表"],
    "project_description": "提取的项目描述",
    "project_type": "项目类型"
}

注意：
- 如果用户明确要求特定分析，只返回对应的智能体
- 如果用户描述了一个项目但没有明确要求，推荐需求分析
- 如果用户要求全面分析，可以推荐多个智能体
- agents列表按执行优先级排序"""

        user_prompt = f"""用户查询：{user_query}

请分析用户意图并推荐合适的智能体服务。"""

        try:
            response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.3,
                max_tokens=500
            )
            
            # 尝试解析JSON响应
            import json
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start != -1 and json_end > json_start:
                json_str = response[json_start:json_end]
                result = json.loads(json_str)
                
                # 验证和清理结果
                if "agents" not in result:
                    result["agents"] = ["requirement_analysis"]
                
                # 确保智能体名称有效
                valid_agents = []
                for agent in result["agents"]:
                    if agent in self.agent_mapping:
                        valid_agents.append(agent)
                
                if not valid_agents:
                    valid_agents = ["requirement_analysis"]
                
                result["agents"] = valid_agents
                return result
            
        except Exception as e:
            logger.warning(f"LLM意图分析失败: {e}")
        
        # 使用规则基础的备用分析
        return self._rule_based_intent_analysis(user_query)
    
    def _rule_based_intent_analysis(self, user_query: str) -> Dict[str, Any]:
        """基于规则的意图分析（备用方案）"""
        
        query_lower = user_query.lower()
        
        # 关键词匹配
        if any(keyword in query_lower for keyword in ["swot", "优势", "劣势", "机会", "威胁"]):
            return {
                "intent": "SWOT分析需求",
                "agents": ["requirement_analysis", "swot_analysis"],
                "project_description": user_query,
                "project_type": "创业项目"
            }
        
        if any(keyword in query_lower for keyword in ["商业模式", "画布", "商业计划"]):
            return {
                "intent": "商业模式设计需求",
                "agents": ["requirement_analysis", "business_canvas"],
                "project_description": user_query,
                "project_type": "创业项目"
            }
        
        if any(keyword in query_lower for keyword in ["政策", "补贴", "扶持", "优惠"]):
            return {
                "intent": "政策匹配需求",
                "agents": ["policy_matching"],
                "project_description": user_query,
                "project_type": "创业项目"
            }
        
        if any(keyword in query_lower for keyword in ["孵化器", "加速器", "投资", "融资"]):
            return {
                "intent": "孵化器推荐需求",
                "agents": ["incubator_recommendation"],
                "project_description": user_query,
                "project_type": "创业项目"
            }
        
        # 默认返回需求分析
        return {
            "intent": "项目需求分析",
            "agents": ["requirement_analysis"],
            "project_description": user_query,
            "project_type": "创业项目"
        }
    
    def _determine_next_agent(self, state: ConversationState) -> str:
        """确定下一个要执行的智能体"""
        
        # 获取还未完成的智能体
        remaining_agents = [
            agent for agent in state["requested_agents"] 
            if agent not in state["completed_agents"]
        ]
        
        if not remaining_agents:
            return None
        
        # 检查依赖关系，优先执行没有依赖或依赖已满足的智能体
        for agent in remaining_agents:
            dependencies = self.agent_dependencies.get(agent, [])
            
            # 检查依赖是否都已完成
            if all(dep in state["completed_agents"] for dep in dependencies):
                return agent
        
        # 如果所有剩余智能体都有未满足的依赖，返回第一个
        # 这种情况通常不应该发生，但作为安全措施
        return remaining_agents[0]