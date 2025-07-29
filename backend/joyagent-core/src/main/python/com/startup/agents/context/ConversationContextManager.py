#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
对话上下文管理器
为直接模式的智能体对话提供上下文共享能力
"""

from typing import Dict, Any, Optional, List
from datetime import datetime
from loguru import logger


class ConversationContextManager:
    """对话上下文管理器"""
    
    def __init__(self):
        # 会话存储：session_id -> 会话数据
        self._sessions: Dict[str, Dict[str, Any]] = {}
    
    def create_session(self, session_id: str, user_query: str, project_description: str = "", project_type: str = "") -> Dict[str, Any]:
        """创建新的对话会话"""
        session_data = {
            "session_id": session_id,
            "user_query": user_query,
            "project_description": project_description or user_query,
            "project_type": project_type,
            "agent_results": {},  # 智能体结果存储
            "conversation_history": [],  # 对话历史
            "context_summary": "",  # 上下文摘要
            "last_agent": "",  # 最后执行的智能体
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        self._sessions[session_id] = session_data
        logger.info(f"创建对话会话: {session_id}")
        return session_data
    
    def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """获取对话会话"""
        return self._sessions.get(session_id)
    
    def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """更新对话会话"""
        if session_id not in self._sessions:
            return False
        
        self._sessions[session_id].update(updates)
        self._sessions[session_id]["updated_at"] = datetime.now().isoformat()
        return True
    
    def add_agent_result(self, session_id: str, agent_name: str, result: Dict[str, Any]) -> bool:
        """添加智能体结果"""
        if session_id not in self._sessions:
            return False
        
        session = self._sessions[session_id]
        session["agent_results"][agent_name] = result
        session["last_agent"] = agent_name
        session["updated_at"] = datetime.now().isoformat()
        
        # 更新上下文摘要
        self._update_context_summary(session_id, agent_name, result)
        
        logger.info(f"会话 {session_id} 添加智能体结果: {agent_name}")
        return True
    
    def add_conversation_entry(self, session_id: str, role: str, content: str, agent_name: str = "", metadata: Dict[str, Any] = None) -> bool:
        """添加对话记录"""
        if session_id not in self._sessions:
            return False
        
        entry = {
            "role": role,
            "content": content,
            "agent": agent_name,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {}
        }
        
        session = self._sessions[session_id]
        session["conversation_history"].append(entry)
        
        # 限制历史记录长度
        if len(session["conversation_history"]) > 20:
            session["conversation_history"] = session["conversation_history"][-20:]
        
        session["updated_at"] = datetime.now().isoformat()
        return True
    
    def build_context_for_agent(self, session_id: str, agent_name: str) -> str:
        """为特定智能体构建上下文信息"""
        session = self.get_session(session_id)
        if not session:
            return ""
        
        context_parts = []
        
        # 基础项目信息
        context_parts.append(f"项目描述: {session['project_description']}")
        
        if session.get("project_type"):
            context_parts.append(f"项目类型: {session['project_type']}")
        
        # 添加之前智能体的分析结果
        if session["agent_results"]:
            context_parts.append("\n=== 之前的分析结果 ===")
            
            for completed_agent, result in session["agent_results"].items():
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
                        if "formatted_content" in result_data:
                            content = result_data["formatted_content"]
                            if len(content) > 500:
                                content = content[:500] + "..."
                            context_parts.append(f"\n{completed_agent}分析结果:\n{content}")
        
        # 添加对话历史摘要
        if session.get("context_summary"):
            context_parts.append(f"\n=== 对话上下文 ===\n{session['context_summary']}")
        
        return "\n".join(context_parts)
    
    def get_relevant_context_for_agent(self, session_id: str, agent_name: str) -> Dict[str, Any]:
        """获取与特定智能体相关的上下文"""
        session = self.get_session(session_id)
        if not session:
            return {}
        
        relevant_context = {
            "project_info": session.get("project_description", ""),
            "project_type": session.get("project_type", ""),
            "previous_analyses": {},
            "conversation_context": session.get("context_summary", "")
        }
        
        # 根据智能体类型添加相关的前置分析结果
        if agent_name == "swot_analysis_agent":
            # SWOT分析需要需求分析的结果
            if "requirement_analysis_agent" in session["agent_results"]:
                relevant_context["previous_analyses"]["requirement_analysis"] = session["agent_results"]["requirement_analysis_agent"]
        
        elif agent_name == "business_canvas_agent":
            # 商业画布需要需求分析和SWOT分析的结果
            for dep_agent in ["requirement_analysis_agent", "swot_analysis_agent"]:
                if dep_agent in session["agent_results"]:
                    relevant_context["previous_analyses"][dep_agent.replace("_agent", "")] = session["agent_results"][dep_agent]
        
        return relevant_context
    
    def suggest_next_agent(self, session_id: str) -> Optional[str]:
        """根据当前上下文建议下一个智能体"""
        session = self.get_session(session_id)
        if not session:
            return None
        
        completed_agents = set(session["agent_results"].keys())
        last_agent = session.get("last_agent", "")
        
        # 智能体执行顺序建议
        agent_sequence = [
            "requirement_analysis_agent",
            "swot_analysis_agent", 
            "business_canvas_agent",
            "policy_matching_agent",
            "incubator_recommendation_agent"
        ]
        
        # 找到下一个未执行的智能体
        for agent in agent_sequence:
            if agent not in completed_agents:
                # 检查依赖关系
                if agent == "swot_analysis_agent":
                    if "requirement_analysis_agent" in completed_agents:
                        return agent
                elif agent == "business_canvas_agent":
                    if "requirement_analysis_agent" in completed_agents:
                        return agent
                else:
                    return agent
        
        return None
    
    def _update_context_summary(self, session_id: str, agent_name: str, result: Dict[str, Any]):
        """更新对话上下文摘要"""
        session = self._sessions[session_id]
        
        summary_parts = []
        
        # 保留现有摘要的关键部分
        if session.get("context_summary"):
            existing_summary = session["context_summary"]
            if len(existing_summary) > 200:
                existing_summary = existing_summary[:200] + "..."
            summary_parts.append(existing_summary)
        
        # 添加新的分析结果摘要
        if result.get("success"):
            if "content" in result:
                content = result["content"]
                summary_parts.append(f"{agent_name}: {content[:100]}...")
            elif "result" in result and isinstance(result["result"], dict):
                result_data = result["result"]
                if "formatted_content" in result_data:
                    content = result_data["formatted_content"]
                    summary_parts.append(f"{agent_name}: {content[:100]}...")
        
        # 更新状态
        session["context_summary"] = "\n".join(summary_parts)
    
    def clear_session(self, session_id: str) -> bool:
        """清除对话会话"""
        if session_id in self._sessions:
            del self._sessions[session_id]
            logger.info(f"清除对话会话: {session_id}")
            return True
        return False
    
    def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """获取会话摘要"""
        session = self.get_session(session_id)
        if not session:
            return {}
        
        return {
            "session_id": session_id,
            "project_description": session["project_description"],
            "project_type": session.get("project_type", ""),
            "completed_agents": list(session["agent_results"].keys()),
            "last_agent": session.get("last_agent", ""),
            "conversation_count": len(session["conversation_history"]),
            "created_at": session["created_at"],
            "updated_at": session["updated_at"]
        }


# 全局上下文管理器实例
conversation_context_manager = ConversationContextManager()