#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
流式智能体混入类
提供通用的流式处理能力，避免代码重复
"""

import asyncio
from typing import Dict, Any, Optional, AsyncGenerator
from loguru import logger
from com.jd.genie.agent.llm.LLMService import llm_service


class StreamingAgentMixin:
    """流式智能体混入类"""
    
    async def execute_stream_with_llm(
        self,
        system_prompt: str,
        user_prompt: str,
        agent_name: str,
        temperature: float = 0.7,
        max_tokens: int = 3000,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        通用的LLM流式执行方法
        
        Args:
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            agent_name: 智能体名称（用于显示）
            temperature: 温度参数
            max_tokens: 最大token数
            **kwargs: 其他参数
        
        Yields:
            Dict[str, Any]: 流式事件数据
        """
        try:
            # 发送开始事件
            yield {
                "type": "start",
                "message": f"开始{agent_name}...",
                "agent": getattr(self, 'name', agent_name)
            }
            
            # 发送进度事件
            yield {
                "type": "progress",
                "message": "正在调用AI分析服务...",
                "stage": "llm_call"
            }
            
            # 使用流式LLM调用 - 真正的边接收边显示
            full_response = ""
            chunk_count = 0
            
            async for chunk in llm_service.generate_response_stream(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens
            ):
                chunk_count += 1
                full_response += chunk
                
                # 每个chunk都实时发送，实现真正的流式显示
                yield {
                    "type": "stream",
                    "content": chunk,  # 发送当前chunk内容
                    "accumulated_content": full_response,  # 发送累积内容
                    "chunk_index": chunk_count,
                    "stage": "streaming"
                }
            
            logger.info(f"LLM {agent_name}流式响应完成，总共{chunk_count}个chunks，{len(full_response)}字符")
            
            # 发送流式完成事件
            yield {
                "type": "stream_complete",
                "message": f"{agent_name}完成，共生成 {len(full_response)} 字符",
                "total_chunks": chunk_count,
                "final_content": full_response
            }
            
            # 发送完成事件
            yield {
                "type": "complete",
                "message": f"{agent_name}流程完成",
                "total_chunks": chunk_count,
                "response_length": len(full_response)
            }
                
        except Exception as e:
            logger.error(f"LLM流式{agent_name}失败: {e}")
            # 使用备用分析
            yield {
                "type": "progress",
                "message": "AI服务异常，使用备用分析方法...",
                "stage": "fallback"
            }
            
            # 如果有备用方法，调用它
            if hasattr(self, '_get_fallback_result'):
                fallback_result = await self._get_fallback_result(**kwargs)
                yield {
                    "type": "result",
                    "data": fallback_result,
                    "message": f"{agent_name}完成（使用备用方法）"
                }
            else:
                yield {
                    "type": "error",
                    "error": str(e),
                    "agent": getattr(self, 'name', agent_name)
                }
            
            yield {
                "type": "complete",
                "message": f"{agent_name}流程完成（备用模式）",
                "fallback": True
            }
    
    async def execute_stream_with_custom_processing(
        self,
        system_prompt: str,
        user_prompt: str,
        agent_name: str,
        custom_processor: Optional[callable] = None,
        temperature: float = 0.7,
        max_tokens: int = 3000,
        **kwargs
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """
        带自定义处理的流式执行方法
        
        Args:
            system_prompt: 系统提示词
            user_prompt: 用户提示词
            agent_name: 智能体名称
            custom_processor: 自定义处理函数，用于处理每个chunk
            temperature: 温度参数
            max_tokens: 最大token数
            **kwargs: 其他参数
        
        Yields:
            Dict[str, Any]: 流式事件数据
        """
        try:
            # 发送开始事件
            yield {
                "type": "start",
                "message": f"开始{agent_name}...",
                "agent": getattr(self, 'name', agent_name)
            }
            
            # 发送进度事件
            yield {
                "type": "progress",
                "message": "正在调用AI分析服务...",
                "stage": "llm_call"
            }
            
            # 使用流式LLM调用
            full_response = ""
            chunk_count = 0
            
            async for chunk in llm_service.generate_response_stream(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=temperature,
                max_tokens=max_tokens
            ):
                chunk_count += 1
                full_response += chunk
                
                # 如果有自定义处理器，使用它处理chunk
                processed_chunk = chunk
                if custom_processor:
                    try:
                        processed_chunk = custom_processor(chunk, full_response, chunk_count)
                    except Exception as e:
                        logger.warning(f"Custom processor error: {e}, using original chunk")
                
                # 发送处理后的chunk
                yield {
                    "type": "stream",
                    "content": processed_chunk,
                    "accumulated_content": full_response,
                    "chunk_index": chunk_count,
                    "stage": "streaming"
                }
            
            logger.info(f"LLM {agent_name}流式响应完成，总共{chunk_count}个chunks，{len(full_response)}字符")
            
            # 发送流式完成事件
            yield {
                "type": "stream_complete",
                "message": f"{agent_name}完成，共生成 {len(full_response)} 字符",
                "total_chunks": chunk_count,
                "final_content": full_response
            }
            
            # 发送完成事件
            yield {
                "type": "complete",
                "message": f"{agent_name}流程完成",
                "total_chunks": chunk_count,
                "response_length": len(full_response)
            }
                
        except Exception as e:
            logger.error(f"LLM流式{agent_name}失败: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "agent": getattr(self, 'name', agent_name)
            }
            
            yield {
                "type": "complete",
                "message": f"{agent_name}流程完成（出错）",
                "error": True
            }
    
    def _create_stream_event(
        self,
        event_type: str,
        message: str = "",
        **additional_data
    ) -> Dict[str, Any]:
        """
        创建标准化的流式事件
        
        Args:
            event_type: 事件类型
            message: 消息内容
            **additional_data: 额外数据
        
        Returns:
            Dict[str, Any]: 标准化的事件数据
        """
        event = {
            "type": event_type,
            "message": message,
            "agent": getattr(self, 'name', 'unknown_agent'),
            "timestamp": asyncio.get_event_loop().time()
        }
        
        # 添加额外数据
        event.update(additional_data)
        
        return event