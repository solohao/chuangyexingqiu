#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
React智能体响应处理器
对应原Java文件: com.jd.genie.handler.ReactAgentResponseHandler
"""

import asyncio
import json
from typing import AsyncGenerator, Dict, Any, List
from loguru import logger

from com.jd.genie.handler.BaseAgentResponseHandler import BaseAgentResponseHandler
from com.jd.genie.agent.agent.AgentContext import AgentContext
from com.jd.genie.model.req.AgentRequest import AgentRequest


class ReactAgentResponseHandler(BaseAgentResponseHandler):
    """React智能体响应处理器"""
    
    def __init__(self):
        super().__init__()
        self.max_steps = 10
    
    async def handle(self, agent_context: AgentContext, request: AgentRequest) -> AsyncGenerator[str, None]:
        """处理React智能体请求"""
        request_id = agent_context.request_id
        query = agent_context.query
        
        logger.info(f"{request_id} Starting React agent processing for query: {query}")
        
        try:
            # 发送开始事件
            yield await self.send_sse_event("start", {
                "type": "agent_start",
                "agent_type": "react",
                "query": query,
                "request_id": request_id
            })
            
            # React循环：思考 -> 行动 -> 观察
            for step in range(self.max_steps):
                agent_context.current_step = step + 1
                
                # 思考阶段
                thinking = await self._generate_thinking(query, agent_context, step)
                yield await self.send_thinking(thinking, request_id)
                
                # 判断是否需要行动
                action_needed = await self._should_take_action(thinking, agent_context)
                
                if not action_needed:
                    # 生成最终答案
                    final_answer = await self._generate_final_answer(query, agent_context)
                    yield await self.send_final_answer(final_answer, request_id)
                    break
                
                # 行动阶段
                action_result = await self._take_action(thinking, agent_context)
                yield await self.send_action(
                    action_result.get("action", "unknown"),
                    action_result.get("parameters", {}),
                    request_id
                )
                
                # 观察阶段
                observation = action_result.get("result", "No result")
                yield await self.send_observation(observation, request_id)
                
                # 更新上下文
                agent_context.add_execution_record("react_step", f"Step {step + 1}", action_result)
                
                # 检查是否完成
                if action_result.get("finished", False):
                    final_answer = action_result.get("final_answer", observation)
                    yield await self.send_final_answer(final_answer, request_id)
                    break
            
            else:
                # 达到最大步数
                yield await self.send_error(f"Reached maximum steps ({self.max_steps})", request_id)
            
            # 发送完成事件
            yield await self.send_sse_event("complete", {
                "type": "agent_complete",
                "request_id": request_id,
                "steps": agent_context.current_step
            })
            
        except Exception as e:
            logger.error(f"{request_id} React agent error: {e}")
            yield await self.send_error(str(e), request_id)
    
    async def _generate_thinking(self, query: str, agent_context: AgentContext, step: int) -> str:
        """生成思考过程"""
        # 这里可以调用LLM生成思考过程
        # 暂时返回一个简单的思考
        
        if step == 0:
            return f"我需要分析用户的问题：{query}。让我思考一下如何最好地回答这个问题。"
        else:
            history = agent_context.execution_history[-3:] if agent_context.execution_history else []
            return f"基于之前的执行结果，我需要继续分析。当前是第{step + 1}步。"
    
    async def _should_take_action(self, thinking: str, agent_context: AgentContext) -> bool:
        """判断是否需要采取行动"""
        # 简单的启发式规则
        # 在实际实现中，这里可以使用LLM来判断
        
        if agent_context.current_step >= self.max_steps:
            return False
        
        # 如果思考中包含某些关键词，则需要行动
        action_keywords = ["搜索", "查询", "分析", "计算", "生成", "需要"]
        return any(keyword in thinking for keyword in action_keywords)
    
    async def _take_action(self, thinking: str, agent_context: AgentContext) -> Dict[str, Any]:
        """采取行动"""
        try:
            # 根据思考内容决定采取什么行动
            action_type = await self._determine_action_type(thinking, agent_context)
            
            if action_type == "search":
                return await self._perform_search_action(thinking, agent_context)
            elif action_type == "code":
                return await self._perform_code_action(thinking, agent_context)
            elif action_type == "report":
                return await self._perform_report_action(thinking, agent_context)
            else:
                return await self._perform_default_action(thinking, agent_context)
                
        except Exception as e:
            logger.error(f"Action error: {e}")
            return {
                "action": "error",
                "parameters": {},
                "result": f"Action failed: {str(e)}",
                "finished": False
            }
    
    async def _determine_action_type(self, thinking: str, agent_context: AgentContext) -> str:
        """确定行动类型"""
        # 简单的关键词匹配
        if any(word in thinking for word in ["搜索", "查找", "查询"]):
            return "search"
        elif any(word in thinking for word in ["计算", "代码", "编程"]):
            return "code"
        elif any(word in thinking for word in ["报告", "总结", "生成"]):
            return "report"
        else:
            return "default"
    
    async def _perform_search_action(self, thinking: str, agent_context: AgentContext) -> Dict[str, Any]:
        """执行搜索行动"""
        # 提取搜索关键词
        query = agent_context.query
        
        parameters = {
            "query": query,
            "max_results": 5
        }
        
        result = await self.call_external_tool("search", parameters, agent_context)
        
        return {
            "action": "search",
            "parameters": parameters,
            "result": json.dumps(result, ensure_ascii=False),
            "finished": False
        }
    
    async def _perform_code_action(self, thinking: str, agent_context: AgentContext) -> Dict[str, Any]:
        """执行代码行动"""
        parameters = {
            "task": thinking,
            "language": "python"
        }
        
        result = await self.call_external_tool("code", parameters, agent_context)
        
        return {
            "action": "code_execution",
            "parameters": parameters,
            "result": json.dumps(result, ensure_ascii=False),
            "finished": False
        }
    
    async def _perform_report_action(self, thinking: str, agent_context: AgentContext) -> Dict[str, Any]:
        """执行报告行动"""
        parameters = {
            "task": agent_context.query,
            "file_type": "html",
            "context": thinking
        }
        
        result = await self.call_external_tool("report", parameters, agent_context)
        
        return {
            "action": "generate_report",
            "parameters": parameters,
            "result": json.dumps(result, ensure_ascii=False),
            "finished": True,  # 报告生成通常是最后一步
            "final_answer": "报告已生成完成"
        }
    
    async def _perform_default_action(self, thinking: str, agent_context: AgentContext) -> Dict[str, Any]:
        """执行默认行动"""
        # 直接基于思考生成答案
        answer = f"基于分析，针对问题'{agent_context.query}'的回答是：{thinking}"
        
        return {
            "action": "direct_answer",
            "parameters": {"thinking": thinking},
            "result": answer,
            "finished": True,
            "final_answer": answer
        }
    
    async def _generate_final_answer(self, query: str, agent_context: AgentContext) -> str:
        """生成最终答案"""
        # 基于执行历史生成最终答案
        if agent_context.execution_history:
            last_result = agent_context.execution_history[-1]
            return f"根据分析和执行结果，对于问题'{query}'的答案是：{last_result.get('result', '无法确定答案')}"
        else:
            return f"对于问题'{query}'，我需要更多信息才能给出准确答案。"