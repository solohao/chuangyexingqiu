#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LangGraph智能体基类
统一的智能体基类，原生支持LangGraph工作流和独立执行
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, AsyncGenerator, Optional
from loguru import logger

from .base_agent import BaseAgent
from .streaming.StreamingAgentMixin import StreamingAgentMixin

# 避免循环导入，使用类型注解
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .workflow.ConversationState import ConversationState
else:
    ConversationState = dict


class LangGraphAgent(BaseAgent, StreamingAgentMixin, ABC):
    """LangGraph智能体基类"""
    
    def __init__(self, name: str, description: str):
        super().__init__(name, description)
        self._current_state: Optional[ConversationState] = None
    
    # ==================== 抽象方法 ====================
    
    @abstractmethod
    def extract_parameters_from_state(self, state: ConversationState) -> Dict[str, Any]:
        """从对话状态中提取智能体执行所需的参数"""
        pass
    
    @abstractmethod
    def update_state_with_result(self, state: ConversationState, result: Dict[str, Any]) -> ConversationState:
        """使用执行结果更新对话状态"""
        pass
    
    # ==================== LangGraph节点执行 ====================
    
    async def execute_node(self, state: ConversationState) -> ConversationState:
        """作为LangGraph节点执行"""
        logger.info(f"[{self.name}] 开始执行LangGraph节点")
        
        # 保存当前状态
        self._current_state = state
        
        # 更新状态信息
        state["current_agent"] = self.name
        state["workflow_stage"] = "analyzing"
        
        try:
            # 从状态中提取参数
            parameters = self.extract_parameters_from_state(state)
            
            # 根据是否流式执行选择不同的执行方式
            if state.get("is_streaming", False):
                # 流式执行
                result = await self._execute_streaming_for_node(parameters)
            else:
                # 非流式执行
                result = await self.execute(parameters)
            
            # 更新状态
            updated_state = self.update_state_with_result(state, result)
            
            logger.info(f"[{self.name}] LangGraph节点执行完成")
            return updated_state
            
        except Exception as e:
            logger.error(f"[{self.name}] LangGraph节点执行失败: {e}")
            
            # 创建错误结果
            error_result = {
                "success": False,
                "error": str(e),
                "agent": self.name
            }
            
            # 更新状态
            return self.update_state_with_result(state, error_result)
    
    async def _execute_streaming_for_node(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """为节点执行收集流式结果"""
        full_content = ""
        final_result = None
        stream_complete_content = ""
        
        try:
            async for chunk in self.execute_stream(parameters):
                # 将流式事件添加到状态中
                if self._current_state:
                    self._add_stream_event_to_state(chunk)
                
                # 收集内容 - 修复内容收集逻辑
                chunk_type = chunk.get("type", "")
                
                if chunk_type == "stream":
                    # 优先使用accumulated_content，它包含完整的累积内容
                    if chunk.get("accumulated_content"):
                        full_content = chunk["accumulated_content"]
                    elif chunk.get("content"):
                        # 只有在没有accumulated_content时才累加
                        if not full_content:
                            full_content = chunk["content"]
                        else:
                            full_content += chunk["content"]
                
                elif chunk_type == "stream_complete":
                    # stream_complete事件包含最终的完整内容
                    if chunk.get("final_content"):
                        stream_complete_content = chunk["final_content"]
                        logger.info(f"[{self.name}] 收到stream_complete，内容长度: {len(stream_complete_content)}")
                
                elif chunk_type == "result":
                    final_result = chunk.get("data")
                
                elif chunk_type == "complete":
                    # complete事件标志着流式处理结束
                    logger.info(f"[{self.name}] 流式处理完成")
                    break
            
            # 确定最终内容 - 优先使用stream_complete中的final_content
            final_content = stream_complete_content or full_content
            
            logger.info(f"[{self.name}] 最终内容长度: {len(final_content)}")
            
            # 返回最终结果
            if final_result:
                return final_result
            else:
                return {
                    "success": True,
                    "content": final_content,
                    "result": {"formatted_content": final_content},  # 为SWOT等智能体提供结构化结果
                    "agent": self.name
                }
            
        except Exception as e:
            logger.error(f"[{self.name}] 流式执行失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": self.name
            }
    
    def _add_stream_event_to_state(self, event: Dict[str, Any]):
        """将流式事件添加到状态中"""
        if not self._current_state:
            return
        
        # 确保stream_events存在
        if "stream_events" not in self._current_state:
            self._current_state["stream_events"] = []
        
        # 添加事件
        event_with_agent = event.copy()
        event_with_agent["agent"] = self.name
        event_with_agent["timestamp"] = event_with_agent.get("timestamp") or self._get_current_timestamp()
        
        self._current_state["stream_events"].append(event_with_agent)
    
    def _get_current_timestamp(self) -> str:
        """获取当前时间戳"""
        from datetime import datetime
        return datetime.now().isoformat()
    
    # ==================== 独立执行模式 ====================
    
    async def execute_direct(self, session_id: str = None, **kwargs) -> Dict[str, Any]:
        """直接执行模式（支持会话上下文）"""
        logger.info(f"[{self.name}] 开始直接执行")
        
        try:
            # 如果提供了session_id，尝试使用上下文
            if session_id:
                from .context.ConversationContextManager import conversation_context_manager
                
                # 构建带上下文的参数
                context_info = conversation_context_manager.build_context_for_agent(session_id, self.name)
                relevant_context = conversation_context_manager.get_relevant_context_for_agent(session_id, self.name)
                
                if context_info:
                    # 为不同智能体设置合适的参数名
                    if self.name == "requirement_analysis_agent":
                        kwargs["project_description"] = relevant_context.get("project_info", context_info)
                        kwargs["analysis_type"] = "comprehensive"
                    else:
                        kwargs["project_info"] = context_info
                        kwargs["relevant_context"] = relevant_context
                    logger.info(f"[{self.name}] 使用会话上下文: {session_id}")
            
            # 调用原有的execute方法
            result = await self.execute(kwargs)
            
            # 如果有session_id，保存结果到上下文
            if session_id and result.get("success"):
                from .context.ConversationContextManager import conversation_context_manager
                conversation_context_manager.add_agent_result(session_id, self.name, result)
                
                # 添加到对话历史
                content = "分析完成"
                if result.get("content"):
                    content = result["content"]
                elif result.get("result") and isinstance(result["result"], dict):
                    if "formatted_content" in result["result"]:
                        content = result["result"]["formatted_content"]
                
                conversation_context_manager.add_conversation_entry(
                    session_id, "assistant", content, self.name
                )
            
            logger.info(f"[{self.name}] 直接执行完成")
            return result
            
        except Exception as e:
            logger.error(f"[{self.name}] 直接执行失败: {e}")
            return {
                "success": False,
                "error": str(e),
                "agent": self.name
            }
    
    async def execute_direct_stream(self, session_id: str = None, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        """直接流式执行模式（支持会话上下文）"""
        logger.info(f"[{self.name}] 开始直接流式执行")
        
        try:
            # 如果提供了session_id，尝试使用上下文
            if session_id:
                from .context.ConversationContextManager import conversation_context_manager
                
                # 构建带上下文的参数
                context_info = conversation_context_manager.build_context_for_agent(session_id, self.name)
                relevant_context = conversation_context_manager.get_relevant_context_for_agent(session_id, self.name)
                
                if context_info:
                    # 为不同智能体设置合适的参数名
                    if self.name == "requirement_analysis_agent":
                        kwargs["project_description"] = relevant_context.get("project_info", context_info)
                        kwargs["analysis_type"] = "comprehensive"
                    else:
                        kwargs["project_info"] = context_info
                        kwargs["relevant_context"] = relevant_context
                    logger.info(f"[{self.name}] 使用会话上下文: {session_id}")
            
            # 收集流式结果
            full_content = ""
            final_result = None
            
            async for chunk in self.execute_stream(kwargs):
                yield chunk
                
                # 收集内容用于保存到上下文
                if chunk.get("type") == "stream" and chunk.get("accumulated_content"):
                    full_content = chunk["accumulated_content"]
                elif chunk.get("type") == "stream_complete" and chunk.get("final_content"):
                    full_content = chunk["final_content"]
                elif chunk.get("type") == "result":
                    final_result = chunk.get("data")
            
            # 如果有session_id，保存结果到上下文
            if session_id and (full_content or final_result):
                from .context.ConversationContextManager import conversation_context_manager
                
                result = final_result or {
                    "success": True,
                    "content": full_content,
                    "result": {"formatted_content": full_content}
                }
                
                conversation_context_manager.add_agent_result(session_id, self.name, result)
                
                # 添加到对话历史
                conversation_context_manager.add_conversation_entry(
                    session_id, "assistant", full_content, self.name
                )
                
        except Exception as e:
            logger.error(f"[{self.name}] 直接流式执行失败: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "agent": self.name
            }
    
    # ==================== 上下文管理 ====================
    
    def get_current_state(self) -> Optional[ConversationState]:
        """获取当前对话状态"""
        return self._current_state
    
    def has_context(self) -> bool:
        """检查是否有上下文状态"""
        return self._current_state is not None
    
    def get_context_info(self) -> str:
        """获取上下文信息摘要"""
        if not self._current_state:
            return "无上下文信息"
        
        info_parts = []
        
        # 基础信息
        if self._current_state.get("project_description"):
            info_parts.append(f"项目: {self._current_state['project_description'][:100]}...")
        
        if self._current_state.get("project_type"):
            info_parts.append(f"类型: {self._current_state['project_type']}")
        
        # 其他智能体结果
        analysis_results = self._current_state.get("analysis_results", {})
        if analysis_results:
            completed_agents = list(analysis_results.keys())
            info_parts.append(f"已完成分析: {', '.join(completed_agents)}")
        
        return " | ".join(info_parts) if info_parts else "基础上下文"
    
    def get_previous_analysis_results(self) -> Dict[str, Any]:
        """获取之前的分析结果"""
        if not self._current_state:
            return {}
        
        return self._current_state.get("analysis_results", {})
    
    # ==================== 工具方法 ====================
    
    def create_success_result(self, data: Any, message: str = "") -> Dict[str, Any]:
        """创建成功结果"""
        return {
            "success": True,
            "result": data,
            "agent": self.name,
            "message": message
        }
    
    def create_error_result(self, error: str) -> Dict[str, Any]:
        """创建错误结果"""
        return {
            "success": False,
            "error": error,
            "agent": self.name
        }
    
    def log_execution_start(self, mode: str = ""):
        """记录执行开始"""
        context_info = self.get_context_info() if self.has_context() else "无上下文"
        logger.info(f"[{self.name}] 开始执行 {mode} | 上下文: {context_info}")
    
    def log_execution_complete(self, mode: str = "", success: bool = True):
        """记录执行完成"""
        status = "成功" if success else "失败"
        logger.info(f"[{self.name}] 执行{status} {mode}")