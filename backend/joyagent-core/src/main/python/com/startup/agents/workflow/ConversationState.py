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
    
    # 项目上下文 - 增强的上下文管理
    project_context: Dict[str, Any]
    project_description: str
    project_type: str
    
    # 智能体结果存储 - 结构化存储
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
    
    # 对话历史和上下文传递 - 新增
    conversation_history: List[Dict[str, Any]]
    context_summary: str  # 当前对话的上下文摘要
    shared_context: Dict[str, Any]  # 智能体间共享的上下文
    
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
        conversation_history=[],
        context_summary="",
        shared_context={},
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


def build_context_for_agent(state: ConversationState, agent_name: str) -> str:
    """为特定智能体构建上下文信息"""
    context_parts = []
    
    # 基础项目信息
    context_parts.append(f"项目描述: {state['project_description'] or state['user_query']}")
    
    if state.get("project_type"):
        context_parts.append(f"项目类型: {state['project_type']}")
    
    # 添加之前智能体的分析结果
    if state["agent_results"]:
        context_parts.append("\n=== 之前的分析结果 ===")
        
        for completed_agent, result in state["agent_results"].items():
            if completed_agent != agent_name and isinstance(result, dict):
                if "content" in result:
                    # 提取内容的关键部分
                    content = result["content"]
                    if len(content) > 500:
                        content = content[:500] + "..."
                    context_parts.append(f"\n{completed_agent}分析结果:\n{content}")
                elif "result" in result and isinstance(result["result"], dict):
                    # 结构化结果的摘要
                    result_data = result["result"]
                    if "project_overview" in result_data:
                        overview = result_data["project_overview"]
                        if isinstance(overview, dict):
                            context_parts.append(f"\n{completed_agent}项目概览:")
                            context_parts.append(f"- 描述: {overview.get('description', '')}")
                            context_parts.append(f"- 分类: {overview.get('category', '')}")
                            context_parts.append(f"- 复杂度: {overview.get('complexity', '')}")
                    
                    if "functional_requirements" in result_data:
                        func_reqs = result_data["functional_requirements"]
                        if isinstance(func_reqs, list) and func_reqs:
                            context_parts.append(f"\n主要功能需求: {', '.join(func_reqs[:3])}")
    
    # 添加对话历史摘要
    if state.get("context_summary"):
        context_parts.append(f"\n=== 对话上下文 ===\n{state['context_summary']}")
    
    return "\n".join(context_parts)


def update_context_summary(state: ConversationState, agent_name: str, result: Dict[str, Any]) -> ConversationState:
    """更新对话上下文摘要"""
    summary_parts = []
    
    # 保留现有摘要的关键部分
    if state.get("context_summary"):
        existing_summary = state["context_summary"]
        if len(existing_summary) > 200:
            existing_summary = existing_summary[:200] + "..."
        summary_parts.append(existing_summary)
    
    # 添加新的分析结果摘要
    if result.get("success") and "result" in result:
        result_data = result["result"]
        if isinstance(result_data, dict):
            if "project_overview" in result_data:
                overview = result_data["project_overview"]
                if isinstance(overview, dict):
                    summary_parts.append(f"{agent_name}: {overview.get('description', '')[:100]}...")
            elif "content" in result_data:
                content = result_data["content"]
                summary_parts.append(f"{agent_name}: {content[:100]}...")
    elif result.get("content"):
        content = result["content"]
        summary_parts.append(f"{agent_name}: {content[:100]}...")
    
    # 更新状态
    state["context_summary"] = "\n".join(summary_parts)
    return state


def add_to_conversation_history(
    state: ConversationState, 
    role: str, 
    content: str, 
    agent_name: str = "",
    metadata: Dict[str, Any] = None
) -> ConversationState:
    """添加到对话历史"""
    history_entry = {
        "role": role,
        "content": content,
        "agent": agent_name,
        "timestamp": datetime.now().isoformat(),
        "metadata": metadata or {}
    }
    
    state["conversation_history"].append(history_entry)
    
    # 限制历史记录长度，保持最近的20条
    if len(state["conversation_history"]) > 20:
        state["conversation_history"] = state["conversation_history"][-20:]
    
    return state


def get_relevant_context_for_agent(state: ConversationState, agent_name: str) -> Dict[str, Any]:
    """获取与特定智能体相关的上下文"""
    relevant_context = {
        "project_info": state.get("project_description", "") or state.get("user_query", ""),
        "project_type": state.get("project_type", ""),
        "previous_analyses": {},
        "conversation_context": state.get("context_summary", "")
    }
    
    # 根据智能体类型添加相关的前置分析结果
    if agent_name == "swot_analysis_agent":
        # SWOT分析需要需求分析的结果
        if "requirement_analysis_agent" in state["agent_results"]:
            relevant_context["previous_analyses"]["requirement_analysis"] = state["agent_results"]["requirement_analysis_agent"]
    
    elif agent_name == "business_canvas_agent":
        # 商业画布需要需求分析和SWOT分析的结果
        for dep_agent in ["requirement_analysis_agent", "swot_analysis_agent"]:
            if dep_agent in state["agent_results"]:
                relevant_context["previous_analyses"][dep_agent.replace("_agent", "")] = state["agent_results"][dep_agent]
    
    return relevant_context