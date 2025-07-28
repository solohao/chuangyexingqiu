#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
对话状态定义
基于LangGraph的状态管理
"""

from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langgraph.graph.message import add_messages
from datetime import datetime


class ConversationState(TypedDict):
    """对话状态类型定义"""
    
    # 消息历史 - 使用LangGraph的消息管理
    messages: Annotated[List[Dict[str, Any]], add_messages]
    
    # 会话信息
    session_id: str
    request_id: str
    user_query: str
    
    # 项目上下文
    project_context: Dict[str, Any]
    project_description: str
    project_type: str
    
    # 智能体结果存储
    agent_results: Dict[str, Any]
    
    # 当前智能体信息
    current_agent: str
    next_agent: Optional[str]
    
    # 工作流控制
    workflow_stage: str  # "start", "analyzing", "routing", "completed"
    should_continue: bool
    
    # 用户意图和路由信息
    user_intent: str
    requested_agents: List[str]
    completed_agents: List[str]
    
    # 流式输出控制
    is_streaming: bool
    stream_events: List[Dict[str, Any]]
    
    # 元数据
    metadata: Dict[str, Any]
    created_at: str
    updated_at: str


def create_initial_state(
    session_id: str,
    request_id: str,
    user_query: str,
    project_description: str = "",
    project_type: str = "",
    is_streaming: bool = True
) -> ConversationState:
    """创建初始对话状态"""
    
    now = datetime.now().isoformat()
    
    return ConversationState(
        messages=[],
        session_id=session_id,
        request_id=request_id,
        user_query=user_query,
        project_context={},
        project_description=project_description,
        project_type=project_type,
        agent_results={},
        current_agent="",
        next_agent=None,
        workflow_stage="start",
        should_continue=True,
        user_intent="",
        requested_agents=[],
        completed_agents=[],
        is_streaming=is_streaming,
        stream_events=[],
        metadata={},
        created_at=now,
        updated_at=now
    )


def update_state_timestamp(state: ConversationState) -> ConversationState:
    """更新状态时间戳"""
    state["updated_at"] = datetime.now().isoformat()
    return state


def add_agent_result(
    state: ConversationState, 
    agent_name: str, 
    result: Any
) -> ConversationState:
    """添加智能体结果"""
    state["agent_results"][agent_name] = result
    if agent_name not in state["completed_agents"]:
        state["completed_agents"].append(agent_name)
    return update_state_timestamp(state)


def add_stream_event(
    state: ConversationState,
    event_type: str,
    content: Any,
    agent_name: str = ""
) -> ConversationState:
    """添加流式事件"""
    event = {
        "type": event_type,
        "content": content,
        "agent": agent_name,
        "timestamp": datetime.now().isoformat()
    }
    state["stream_events"].append(event)
    return update_state_timestamp(state)


def get_project_context_summary(state: ConversationState) -> str:
    """获取项目上下文摘要"""
    context_parts = []
    
    if state["project_description"]:
        context_parts.append(f"项目描述: {state['project_description']}")
    
    if state["project_type"]:
        context_parts.append(f"项目类型: {state['project_type']}")
    
    # 添加已完成的分析结果摘要
    for agent_name, result in state["agent_results"].items():
        if isinstance(result, dict) and "summary" in result:
            context_parts.append(f"{agent_name}分析: {result['summary']}")
    
    return "\n".join(context_parts) if context_parts else "暂无项目上下文信息"


def should_continue_workflow(state: ConversationState) -> bool:
    """判断工作流是否应该继续"""
    return (
        state["should_continue"] and 
        state["workflow_stage"] != "completed" and
        len(state["completed_agents"]) < len(state["requested_agents"])
    )