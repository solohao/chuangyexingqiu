#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
规划解决智能体响应处理器
对应原Java文件: com.jd.genie.handler.PlanSolveAgentResponseHandler
"""

import asyncio
import json
from typing import AsyncGenerator, Dict, Any, List
from loguru import logger

from com.jd.genie.handler.BaseAgentResponseHandler import BaseAgentResponseHandler
from com.jd.genie.agent.agent.AgentContext import AgentContext
from com.jd.genie.model.req.AgentRequest import AgentRequest


class PlanSolveAgentResponseHandler(BaseAgentResponseHandler):
    """规划解决智能体响应处理器"""
    
    def __init__(self):
        super().__init__()
        self.max_planning_steps = 5
        self.max_execution_steps = 20
    
    async def handle(self, agent_context: AgentContext, request: AgentRequest) -> AsyncGenerator[str, None]:
        """处理规划解决智能体请求"""
        request_id = agent_context.request_id
        query = agent_context.query
        
        logger.info(f"{request_id} Starting PlanSolve agent processing for query: {query}")
        
        try:
            # 发送开始事件
            yield await self.send_sse_event("start", {
                "type": "agent_start",
                "agent_type": "plan_solve",
                "query": query,
                "request_id": request_id
            })
            
            # 阶段1：规划阶段
            plan = await self._planning_phase(agent_context, request)
            async for event in plan:
                yield event
            
            # 阶段2：执行阶段
            execution = await self._execution_phase(agent_context, request)
            async for event in execution:
                yield event
            
            # 发送完成事件
            yield await self.send_sse_event("complete", {
                "type": "agent_complete",
                "request_id": request_id,
                "steps": agent_context.current_step
            })
            
        except Exception as e:
            logger.error(f"{request_id} PlanSolve agent error: {e}")
            yield await self.send_error(str(e), request_id)
    
    async def _planning_phase(self, agent_context: AgentContext, request: AgentRequest) -> AsyncGenerator[str, None]:
        """规划阶段"""
        request_id = agent_context.request_id
        query = agent_context.query
        
        # 发送规划开始事件
        yield await self.send_sse_event("planning_start", {
            "type": "planning_start",
            "request_id": request_id
        })
        
        # 生成规划思考
        planning_thinking = await self._generate_planning_thinking(query, agent_context)
        yield await self.send_thinking(planning_thinking, request_id)
        
        # 生成任务计划
        task_plan = await self._generate_task_plan(query, agent_context)
        
        # 发送规划结果
        yield await self.send_sse_event("planning_result", {
            "type": "planning_result",
            "plan": task_plan,
            "request_id": request_id
        })
        
        # 保存计划到上下文
        agent_context.metadata["task_plan"] = task_plan
        agent_context.add_execution_record("planning", "Task planning completed", task_plan)
        
        logger.info(f"{request_id} Planning phase completed with {len(task_plan)} tasks")
    
    async def _execution_phase(self, agent_context: AgentContext, request: AgentRequest) -> AsyncGenerator[str, None]:
        """执行阶段"""
        request_id = agent_context.request_id
        task_plan = agent_context.metadata.get("task_plan", [])
        
        if not task_plan:
            yield await self.send_error("No task plan available for execution", request_id)
            return
        
        # 发送执行开始事件
        yield await self.send_sse_event("execution_start", {
            "type": "execution_start",
            "total_tasks": len(task_plan),
            "request_id": request_id
        })
        
        # 逐个执行任务
        for i, task in enumerate(task_plan):
            task_id = i + 1
            
            # 发送任务开始事件
            yield await self.send_sse_event("task_start", {
                "type": "task_start",
                "task_id": task_id,
                "task": task,
                "request_id": request_id
            })
            
            # 执行任务
            task_result = await self._execute_task(task, agent_context, task_id)
            
            # 发送任务结果
            yield await self.send_sse_event("task_result", {
                "type": "task_result",
                "task_id": task_id,
                "task": task,
                "result": task_result,
                "request_id": request_id
            })
            
            # 更新上下文
            agent_context.add_execution_record("task_execution", f"Task {task_id}: {task}", task_result)
            agent_context.increment_step()
            
            # 检查是否应该停止
            if task_result.get("should_stop", False):
                break
        
        # 生成最终总结
        final_summary = await self._generate_final_summary(agent_context)
        yield await self.send_final_answer(final_summary, request_id)
        
        logger.info(f"{request_id} Execution phase completed")
    
    async def _generate_planning_thinking(self, query: str, agent_context: AgentContext) -> str:
        """生成规划思考"""
        return f"""我需要分析用户的问题：{query}

让我思考如何将这个复杂问题分解为可执行的子任务：

1. 首先理解问题的核心需求
2. 识别需要收集的信息和数据
3. 确定需要使用的工具和方法
4. 规划执行顺序和依赖关系
5. 考虑输出格式和用户期望

基于以上分析，我将制定一个详细的执行计划。"""
    
    async def _generate_task_plan(self, query: str, agent_context: AgentContext) -> List[Dict[str, Any]]:
        """生成任务计划"""
        # 这里可以调用LLM来生成更智能的任务规划
        # 暂时使用简单的启发式规则
        
        tasks = []
        
        # 根据查询类型生成不同的任务计划
        if any(word in query for word in ["分析", "研究", "调查"]):
            tasks = [
                {
                    "id": 1,
                    "title": "信息收集",
                    "description": f"收集关于'{query}'的相关信息和数据",
                    "tool": "search",
                    "priority": "high"
                },
                {
                    "id": 2,
                    "title": "数据分析",
                    "description": "对收集的信息进行分析和处理",
                    "tool": "code",
                    "priority": "medium"
                },
                {
                    "id": 3,
                    "title": "结果整理",
                    "description": "整理分析结果并生成报告",
                    "tool": "report",
                    "priority": "high"
                }
            ]
        elif any(word in query for word in ["计算", "编程", "代码"]):
            tasks = [
                {
                    "id": 1,
                    "title": "需求分析",
                    "description": f"分析'{query}'的具体需求",
                    "tool": "analysis",
                    "priority": "high"
                },
                {
                    "id": 2,
                    "title": "代码实现",
                    "description": "编写代码实现功能",
                    "tool": "code",
                    "priority": "high"
                }
            ]
        else:
            # 默认任务计划
            tasks = [
                {
                    "id": 1,
                    "title": "问题理解",
                    "description": f"深入理解问题：{query}",
                    "tool": "analysis",
                    "priority": "high"
                },
                {
                    "id": 2,
                    "title": "信息搜索",
                    "description": "搜索相关信息",
                    "tool": "search",
                    "priority": "medium"
                },
                {
                    "id": 3,
                    "title": "答案生成",
                    "description": "基于收集的信息生成答案",
                    "tool": "synthesis",
                    "priority": "high"
                }
            ]
        
        return tasks
    
    async def _execute_task(self, task: Dict[str, Any], agent_context: AgentContext, task_id: int) -> Dict[str, Any]:
        """执行单个任务"""
        try:
            tool = task.get("tool", "default")
            description = task.get("description", "")
            
            # 根据工具类型执行不同的操作
            if tool == "search":
                return await self._execute_search_task(task, agent_context)
            elif tool == "code":
                return await self._execute_code_task(task, agent_context)
            elif tool == "report":
                return await self._execute_report_task(task, agent_context)
            elif tool == "analysis":
                return await self._execute_analysis_task(task, agent_context)
            else:
                return await self._execute_default_task(task, agent_context)
                
        except Exception as e:
            logger.error(f"Task {task_id} execution error: {e}")
            return {
                "success": False,
                "error": str(e),
                "result": f"任务执行失败: {str(e)}"
            }
    
    async def _execute_search_task(self, task: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """执行搜索任务"""
        parameters = {
            "query": agent_context.query,
            "max_results": 5
        }
        
        result = await self.call_external_tool("search", parameters, agent_context)
        
        return {
            "success": True,
            "tool": "search",
            "result": result,
            "summary": "搜索任务完成，获取了相关信息"
        }
    
    async def _execute_code_task(self, task: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """执行代码任务"""
        parameters = {
            "task": task.get("description", ""),
            "language": "python"
        }
        
        result = await self.call_external_tool("code", parameters, agent_context)
        
        return {
            "success": True,
            "tool": "code",
            "result": result,
            "summary": "代码执行任务完成"
        }
    
    async def _execute_report_task(self, task: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """执行报告任务"""
        parameters = {
            "task": agent_context.query,
            "file_type": "html",
            "context": task.get("description", "")
        }
        
        result = await self.call_external_tool("report", parameters, agent_context)
        
        return {
            "success": True,
            "tool": "report",
            "result": result,
            "summary": "报告生成任务完成",
            "should_stop": True  # 报告生成通常是最后一步
        }
    
    async def _execute_analysis_task(self, task: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """执行分析任务"""
        # 简单的分析逻辑
        analysis_result = f"对问题'{agent_context.query}'的分析：{task.get('description', '')}"
        
        return {
            "success": True,
            "tool": "analysis",
            "result": analysis_result,
            "summary": "分析任务完成"
        }
    
    async def _execute_default_task(self, task: Dict[str, Any], agent_context: AgentContext) -> Dict[str, Any]:
        """执行默认任务"""
        result = f"执行任务：{task.get('title', 'Unknown')} - {task.get('description', '')}"
        
        return {
            "success": True,
            "tool": "default",
            "result": result,
            "summary": "默认任务完成"
        }
    
    async def _generate_final_summary(self, agent_context: AgentContext) -> str:
        """生成最终总结"""
        execution_history = agent_context.execution_history
        
        if not execution_history:
            return f"对于问题'{agent_context.query}'，未能获得有效的执行结果。"
        
        # 提取关键结果
        key_results = []
        for record in execution_history:
            if record.get("type") == "task_execution":
                result = record.get("result", {})
                if result.get("success"):
                    key_results.append(result.get("summary", "任务完成"))
        
        summary = f"""基于规划和执行的结果，对于问题'{agent_context.query}'的回答如下：

执行了 {len(key_results)} 个主要任务：
{chr(10).join(f"- {result}" for result in key_results)}

通过系统性的规划和执行，我已经完成了对您问题的全面分析和处理。"""
        
        return summary