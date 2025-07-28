#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Genie控制器
对应原Java文件: com.jd.genie.controller.GenieController
"""

import asyncio
import json
import time
import uuid
from datetime import datetime
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sse_starlette import EventSourceResponse
import httpx
from loguru import logger

from com.jd.genie.config.GenieConfig import GenieConfig
from com.jd.genie.model.req.AgentRequest import AgentRequest
from com.jd.genie.model.req.GptQueryReq import GptQueryReq
from com.jd.genie.service.AgentHandlerService import AgentHandlerService
from com.jd.genie.service.IGptProcessService import IGptProcessService
from com.jd.genie.agent.tool.ToolCollection import ToolCollection
from com.jd.genie.agent.agent.AgentContext import AgentContext
from com.jd.genie.agent.printer.SSEPrinter import SSEPrinter
from com.jd.genie.agent.util.DateUtil import DateUtil
from com.jd.genie.util.SseEmitterUTF8 import SseEmitterUTF8


router = APIRouter()


class GenieController:
    """Genie控制器类"""
    
    def __init__(self):
        self.config = GenieConfig()
        self.agent_handler_service = AgentHandlerService()
        from com.jd.genie.service.IGptProcessService import GptProcessService
        self.gpt_process_service = GptProcessService()
        self.heartbeat_interval = 10.0  # 10秒心跳间隔
    
    async def start_heartbeat(self, emitter: SseEmitterUTF8, request_id: str):
        """开启SSE心跳"""
        try:
            while True:
                await asyncio.sleep(self.heartbeat_interval)
                try:
                    await emitter.send_data("heartbeat")
                    logger.info(f"{request_id} send heartbeat")
                except Exception as e:
                    logger.error(f"{request_id} heartbeat failed: {e}")
                    break
        except asyncio.CancelledError:
            logger.info(f"{request_id} heartbeat cancelled")
    
    def handle_output_style(self, request: AgentRequest) -> str:
        """处理输出样式"""
        query = request.query
        output_style_prompts = self.config.get_output_style_prompts()
        
        if request.output_style and request.output_style in output_style_prompts:
            query += output_style_prompts[request.output_style]
        
        return query
    
    async def build_tool_collection(self, agent_context: AgentContext, request: AgentRequest) -> ToolCollection:
        """构建工具集合"""
        tool_collection = ToolCollection()
        tool_collection.set_agent_context(agent_context)
        
        # 添加文件工具
        from com.jd.genie.agent.tool.common.FileTool import FileTool
        file_tool = FileTool()
        file_tool.set_agent_context(agent_context)
        tool_collection.add_tool(file_tool)
        
        # 添加创业智能体工具
        try:
            # 导入创业智能体工厂
            from com.startup.agents.agent_factory import AgentFactory
            from com.jd.genie.agent.tool.startup.StartupAgentTool import StartupAgentTool
            
            # 获取所有可用的智能体类型
            available_agents = AgentFactory.get_available_agents()
            
            for agent_type, description in available_agents.items():
                try:
                    # 创建智能体工具包装器
                    startup_tool = StartupAgentTool(agent_type, description)
                    startup_tool.set_agent_context(agent_context)
                    tool_collection.add_tool(startup_tool)
                    logger.info(f"{agent_context.request_id} added startup agent tool: {agent_type}")
                except Exception as e:
                    logger.error(f"{agent_context.request_id} add startup agent {agent_type} failed: {e}")
            
        except Exception as e:
            logger.error(f"{agent_context.request_id} add startup agents failed: {e}")
        
        # 添加默认工具
        tool_list_map = self.config.get_multi_agent_tool_list_map()
        default_tools = tool_list_map.get('default', 'search,code,report').split(',')
        
        if 'code' in default_tools:
            from com.jd.genie.agent.tool.common.CodeInterpreterTool import CodeInterpreterTool
            code_tool = CodeInterpreterTool()
            code_tool.set_agent_context(agent_context)
            tool_collection.add_tool(code_tool)
        
        if 'report' in default_tools:
            from com.jd.genie.agent.tool.common.ReportTool import ReportTool
            report_tool = ReportTool()
            report_tool.set_agent_context(agent_context)
            tool_collection.add_tool(report_tool)
        
        if 'search' in default_tools:
            from com.jd.genie.agent.tool.common.DeepSearchTool import DeepSearchTool
            search_tool = DeepSearchTool()
            search_tool.set_agent_context(agent_context)
            tool_collection.add_tool(search_tool)
        
        # 添加MCP工具
        try:
            from com.jd.genie.agent.tool.mcp.McpTool import McpTool
            mcp_tool = McpTool()
            mcp_tool.set_agent_context(agent_context)
            
            mcp_servers = self.config.get_mcp_server_url_arr()
            for mcp_server in mcp_servers:
                try:
                    list_tool_result = await mcp_tool.list_tool(mcp_server)
                    if not list_tool_result:
                        logger.error(f"{agent_context.request_id} mcp server {mcp_server} invalid")
                        continue
                    
                    resp = json.loads(list_tool_result)
                    if resp.get('code') != 200:
                        logger.error(f"{agent_context.request_id} mcp server {mcp_server} error: {resp}")
                        continue
                    
                    data = resp.get('data', [])
                    for tool_info in data:
                        method = tool_info.get('name')
                        description = tool_info.get('description')
                        input_schema = tool_info.get('inputSchema')
                        tool_collection.add_mcp_tool(method, description, input_schema, mcp_server)
                        
                except Exception as e:
                    logger.error(f"{agent_context.request_id} process mcp server {mcp_server} failed: {e}")
                    continue
                    
        except Exception as e:
            logger.error(f"{agent_context.request_id} add mcp tool failed: {e}")
        
        return tool_collection


# 创建控制器实例
controller = GenieController()


@router.post("/AutoAgent")
async def auto_agent(request: AgentRequest):
    """执行智能体调度"""
    logger.info(f"{request.request_id} auto agent request: {request.dict()}")
    
    # 处理输出样式
    request.query = controller.handle_output_style(request)
    
    async def event_generator():
        """SSE事件生成器"""
        try:
            # 创建SSE发射器
            emitter = SseEmitterUTF8()
            
            # 创建智能体上下文
            agent_context = AgentContext(
                request_id=request.request_id,
                session_id=request.request_id,
                printer=SSEPrinter(emitter, request, request.agent_type),
                query=request.query,
                task="",
                date_info=DateUtil.current_date_info(),
                product_files=[],
                task_product_files=[],
                sop_prompt=request.sop_prompt or "",
                base_prompt=request.base_prompt or "",
                agent_type=request.agent_type,
                is_stream=request.is_stream or False
            )
            
            # 构建工具集合
            agent_context.tool_collection = await controller.build_tool_collection(agent_context, request)
            
            # 获取处理器并执行
            handler = controller.agent_handler_service.get_handler(agent_context, request)
            
            # 启动心跳任务
            heartbeat_task = asyncio.create_task(
                controller.start_heartbeat(emitter, request.request_id)
            )
            
            try:
                # 执行处理逻辑
                async for event in handler.handle(agent_context, request):
                    yield event
                    
            finally:
                # 取消心跳任务
                heartbeat_task.cancel()
                try:
                    await heartbeat_task
                except asyncio.CancelledError:
                    pass
            
        except Exception as e:
            logger.error(f"{request.request_id} auto agent error: {e}")
            yield f"data: {json.dumps({'error': str(e)})}\n\n"
    
    return EventSourceResponse(event_generator())


@router.get("/web/health")
async def health():
    """健康检查接口"""
    return {"status": "ok", "timestamp": datetime.now().isoformat()}


@router.post("/web/api/v1/gpt/queryAgentStreamIncr")
async def query_agent_stream_incr(params: GptQueryReq):
    """处理Agent流式增量查询请求"""
    return await controller.gpt_process_service.query_multi_agent_incr_stream(params)