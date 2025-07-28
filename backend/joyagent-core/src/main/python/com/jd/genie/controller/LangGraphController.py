#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LangGraph工作流控制器
提供基于LangGraph的智能体工作流API
"""

import json
import uuid
import time
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from loguru import logger

from com.startup.agents.workflow.StartupWorkflow import startup_workflow


router = APIRouter()


class WorkflowRequest(BaseModel):
    """工作流请求模型"""
    query: str
    session_id: str = ""
    project_description: str = ""
    project_type: str = ""
    is_streaming: bool = True
    metadata: Dict[str, Any] = {}


class WorkflowResponse(BaseModel):
    """工作流响应模型"""
    success: bool
    data: Dict[str, Any] = {}
    message: str = ""
    error: str = ""


@router.post("/workflow/execute")
async def execute_workflow(request: WorkflowRequest):
    """执行智能体工作流"""
    try:
        # 生成请求ID
        request_id = str(uuid.uuid4())
        
        # 如果没有提供session_id，生成一个
        session_id = request.session_id or f"session_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        
        logger.info(f"[{request_id}] 收到工作流执行请求: {request.query}")
        
        if request.is_streaming:
            # 流式响应
            async def generate_stream():
                try:
                    async for event in startup_workflow.execute_workflow(
                        user_query=request.query,
                        session_id=session_id,
                        request_id=request_id,
                        project_description=request.project_description,
                        project_type=request.project_type,
                        is_streaming=True
                    ):
                        yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                    
                    yield "data: [DONE]\n\n"
                    
                except Exception as e:
                    logger.error(f"[{request_id}] 工作流执行错误: {e}")
                    error_event = {
                        "type": "error",
                        "error": str(e),
                        "request_id": request_id
                    }
                    yield f"data: {json.dumps(error_event, ensure_ascii=False)}\n\n"
                    yield "data: [DONE]\n\n"
            
            return StreamingResponse(
                generate_stream(),
                media_type="text/event-stream",
                headers={
                    "Cache-Control": "no-cache",
                    "Connection": "keep-alive",
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                }
            )
        
        else:
            # 非流式响应 - 收集所有结果
            results = []
            async for event in startup_workflow.execute_workflow(
                user_query=request.query,
                session_id=session_id,
                request_id=request_id,
                project_description=request.project_description,
                project_type=request.project_type,
                is_streaming=False
            ):
                results.append(event)
            
            return WorkflowResponse(
                success=True,
                data={
                    "request_id": request_id,
                    "session_id": session_id,
                    "results": results
                },
                message="工作流执行完成"
            )
            
    except Exception as e:
        logger.error(f"执行工作流失败: {e}")
        return WorkflowResponse(
            success=False,
            error=str(e),
            message="工作流执行失败"
        )


@router.get("/workflow/state/{session_id}/{request_id}")
async def get_workflow_state(session_id: str, request_id: str):
    """获取工作流状态"""
    try:
        state = await startup_workflow.get_workflow_state(session_id, request_id)
        return WorkflowResponse(
            success=True,
            data=state,
            message="获取状态成功"
        )
    except Exception as e:
        logger.error(f"获取工作流状态失败: {e}")
        return WorkflowResponse(
            success=False,
            error=str(e),
            message="获取状态失败"
        )


@router.get("/workflow/history/{session_id}/{request_id}")
async def get_workflow_history(session_id: str, request_id: str):
    """获取工作流执行历史"""
    try:
        history = await startup_workflow.get_workflow_history(session_id, request_id)
        return WorkflowResponse(
            success=True,
            data={"history": history},
            message="获取历史成功"
        )
    except Exception as e:
        logger.error(f"获取工作流历史失败: {e}")
        return WorkflowResponse(
            success=False,
            error=str(e),
            message="获取历史失败"
        )


@router.get("/workflow/visualize")
async def visualize_workflow():
    """可视化工作流图"""
    try:
        mermaid_graph = startup_workflow.visualize_workflow()
        return WorkflowResponse(
            success=True,
            data={"mermaid": mermaid_graph},
            message="生成工作流图成功"
        )
    except Exception as e:
        logger.error(f"生成工作流图失败: {e}")
        return WorkflowResponse(
            success=False,
            error=str(e),
            message="生成工作流图失败"
        )


@router.post("/workflow/interrupt/{session_id}/{request_id}")
async def interrupt_workflow(session_id: str, request_id: str):
    """中断工作流执行"""
    try:
        success = await startup_workflow.interrupt_workflow(session_id, request_id)
        if success:
            return WorkflowResponse(
                success=True,
                message="工作流已中断"
            )
        else:
            return WorkflowResponse(
                success=False,
                message="中断工作流失败"
            )
    except Exception as e:
        logger.error(f"中断工作流失败: {e}")
        return WorkflowResponse(
            success=False,
            error=str(e),
            message="中断工作流失败"
        )


@router.get("/workflow/health")
async def workflow_health_check():
    """工作流健康检查"""
    return WorkflowResponse(
        success=True,
        data={
            "status": "healthy",
            "workflow_nodes": [
                "intent_analysis",
                "workflow_router", 
                "requirement_analysis",
                "swot_analysis",
                "business_canvas",
                "policy_matching",
                "incubator_recommendation"
            ]
        },
        message="工作流服务正常"
    )