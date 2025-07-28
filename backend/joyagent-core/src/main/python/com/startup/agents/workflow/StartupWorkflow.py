#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创业智能体工作流
基于LangGraph的智能工作流实现
"""

import asyncio
from typing import Dict, Any, AsyncGenerator
from loguru import logger

from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver

from .ConversationState import ConversationState, create_initial_state
from .nodes.AgentNodes import AgentNodes
from .nodes.RouterNodes import RouterNodes


class StartupWorkflow:
    """创业智能体工作流"""
    
    def __init__(self):
        self.agent_nodes = AgentNodes()
        self.router_nodes = RouterNodes()
        self.workflow = self._build_workflow()
        
        # 使用内存检查点保存器
        self.checkpointer = MemorySaver()
        self.app = self.workflow.compile(checkpointer=self.checkpointer)
    
    def _build_workflow(self) -> StateGraph:
        """构建工作流图"""
        
        # 创建状态图
        workflow = StateGraph(ConversationState)
        
        # 添加路由节点
        workflow.add_node("intent_analysis", self.router_nodes.intent_analysis_node)
        workflow.add_node("workflow_router", self.router_nodes.workflow_router_node)
        
        # 添加智能体节点
        workflow.add_node("requirement_analysis", self.agent_nodes.requirement_analysis_node)
        workflow.add_node("swot_analysis", self.agent_nodes.swot_analysis_node)
        workflow.add_node("business_canvas", self.agent_nodes.business_canvas_node)
        workflow.add_node("policy_matching", self.agent_nodes.policy_matching_node)
        workflow.add_node("incubator_recommendation", self.agent_nodes.incubator_recommendation_node)
        
        # 设置入口点
        workflow.set_entry_point("intent_analysis")
        
        # 添加条件边 - 从意图分析到具体智能体或路由器
        workflow.add_conditional_edges(
            "intent_analysis",
            self.router_nodes.workflow_condition,
            {
                "requirement_analysis": "requirement_analysis",
                "swot_analysis": "swot_analysis", 
                "business_canvas": "business_canvas",
                "policy_matching": "policy_matching",
                "incubator_recommendation": "incubator_recommendation",
                "workflow_router": "workflow_router",
                "END": END
            }
        )
        
        # 添加从工作流路由器到各个智能体的条件边
        workflow.add_conditional_edges(
            "workflow_router",
            self.router_nodes.workflow_condition,
            {
                "requirement_analysis": "requirement_analysis",
                "swot_analysis": "swot_analysis",
                "business_canvas": "business_canvas", 
                "policy_matching": "policy_matching",
                "incubator_recommendation": "incubator_recommendation",
                "END": END
            }
        )
        
        # 添加从各个智能体回到路由器或结束的边
        for agent_name in ["requirement_analysis", "swot_analysis", "business_canvas", 
                          "policy_matching", "incubator_recommendation"]:
            workflow.add_conditional_edges(
                agent_name,
                self.router_nodes.agent_condition,
                {
                    "workflow_router": "workflow_router",
                    "END": END
                }
            )
        
        return workflow
    
    async def execute_workflow(
        self,
        user_query: str,
        session_id: str,
        request_id: str,
        project_description: str = "",
        project_type: str = "",
        is_streaming: bool = True
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """执行工作流并返回流式结果"""
        
        logger.info(f"[{request_id}] 开始执行创业智能体工作流")
        
        # 创建初始状态
        initial_state = create_initial_state(
            session_id=session_id,
            request_id=request_id,
            user_query=user_query,
            project_description=project_description,
            project_type=project_type,
            is_streaming=is_streaming
        )
        
        # 配置运行参数
        config = {
            "configurable": {
                "thread_id": session_id,
                "checkpoint_ns": request_id
            }
        }
        
        try:
            # 流式执行工作流
            async for event in self.app.astream(initial_state, config=config):
                # 处理每个节点的输出
                for node_name, node_output in event.items():
                    if isinstance(node_output, dict):
                        # 发送节点完成事件
                        yield {
                            "type": "node_complete",
                            "node": node_name,
                            "state": node_output,
                            "timestamp": node_output.get("updated_at")
                        }
                        
                        # 如果有流式事件，逐个发送
                        if "stream_events" in node_output:
                            for stream_event in node_output["stream_events"]:
                                # 只发送新的事件（避免重复）
                                if not hasattr(self, '_sent_events'):
                                    self._sent_events = set()
                                
                                event_key = f"{stream_event.get('agent', '')}_{stream_event.get('timestamp', '')}"
                                if event_key not in self._sent_events:
                                    yield stream_event
                                    self._sent_events.add(event_key)
            
            logger.info(f"[{request_id}] 工作流执行完成")
            
            # 发送最终完成事件
            yield {
                "type": "workflow_complete",
                "message": "所有分析已完成",
                "request_id": request_id,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"[{request_id}] 工作流执行失败: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "request_id": request_id,
                "session_id": session_id
            }
    
    async def get_workflow_state(self, session_id: str, request_id: str) -> Dict[str, Any]:
        """获取工作流状态"""
        
        config = {
            "configurable": {
                "thread_id": session_id,
                "checkpoint_ns": request_id
            }
        }
        
        try:
            # 获取最新状态
            state = await self.app.aget_state(config)
            return state.values if state else {}
        except Exception as e:
            logger.error(f"获取工作流状态失败: {e}")
            return {}
    
    async def get_workflow_history(self, session_id: str, request_id: str) -> list:
        """获取工作流执行历史"""
        
        config = {
            "configurable": {
                "thread_id": session_id,
                "checkpoint_ns": request_id
            }
        }
        
        try:
            # 获取执行历史
            history = []
            async for state in self.app.aget_state_history(config):
                history.append({
                    "config": state.config,
                    "values": state.values,
                    "next": state.next,
                    "created_at": state.created_at
                })
            return history
        except Exception as e:
            logger.error(f"获取工作流历史失败: {e}")
            return []
    
    def visualize_workflow(self) -> str:
        """可视化工作流图"""
        try:
            # 生成Mermaid图表
            return self.workflow.get_graph().draw_mermaid()
        except Exception as e:
            logger.error(f"生成工作流图表失败: {e}")
            return "无法生成工作流图表"
    
    async def interrupt_workflow(self, session_id: str, request_id: str) -> bool:
        """中断工作流执行"""
        
        config = {
            "configurable": {
                "thread_id": session_id,
                "checkpoint_ns": request_id
            }
        }
        
        try:
            # 更新状态以中断工作流
            current_state = await self.app.aget_state(config)
            if current_state and current_state.values:
                interrupted_state = current_state.values.copy()
                interrupted_state["should_continue"] = False
                interrupted_state["workflow_stage"] = "interrupted"
                
                await self.app.aupdate_state(config, interrupted_state)
                return True
        except Exception as e:
            logger.error(f"中断工作流失败: {e}")
        
        return False


# 创建全局工作流实例
startup_workflow = StartupWorkflow()