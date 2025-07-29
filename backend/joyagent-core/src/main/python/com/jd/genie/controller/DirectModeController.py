#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
直接模式控制器
处理直接模式下的智能体对话
"""

import json
import uuid
import time
from typing import Dict, Any
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from loguru import logger

from com.startup.agents.DirectModeRouter import direct_mode_router


router = APIRouter()


class DirectModeRequest(BaseModel):
    """直接模式请求模型"""
    query: str
    session_id: str = ""
    project_description: str = ""
    project_type: str = ""
    is_streaming: bool = True


class DirectModeResponse(BaseModel):
    """直接模式响应模型"""
    success: bool
    data: Dict[str, Any] = {}
    message: str = ""
    error: str = ""


@router.post("/direct/chat")
async def direct_mode_chat(request: DirectModeRequest):
    """直接模式对话"""
    try:
        # 如果没有提供session_id，生成一个
        session_id = request.session_id or f"direct_{int(time.time())}_{uuid.uuid4().hex[:8]}"
        
        logger.info(f"[{session_id}] 收到直接模式请求: {request.query}")
        
        if request.is_streaming:
            # 流式响应
            async def generate_stream():
                try:
                    async for event in direct_mode_router.handle_user_query(
                        user_query=request.query,
                        session_id=session_id,
                        project_description=request.project_description,
                        project_type=request.project_type,
                        is_streaming=True
                    ):
                        yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                    
                    yield "data: [DONE]\n\n"
                    
                except Exception as e:
                    logger.error(f"[{session_id}] 直接模式执行错误: {e}")
                    error_event = {
                        "type": "error",
                        "error": str(e),
                        "session_id": session_id
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
            async for event in direct_mode_router.handle_user_query(
                user_query=request.query,
                session_id=session_id,
                project_description=request.project_description,
                project_type=request.project_type,
                is_streaming=False
            ):
                results.append(event)
            
            return DirectModeResponse(
                success=True,
                data={
                    "session_id": session_id,
                    "results": results
                },
                message="直接模式执行完成"
            )
            
    except Exception as e:
        logger.error(f"直接模式执行失败: {e}")
        return DirectModeResponse(
            success=False,
            error=str(e),
            message="直接模式执行失败"
        )


@router.get("/direct/session/{session_id}")
async def get_session_info(session_id: str):
    """获取会话信息"""
    try:
        session_summary = direct_mode_router.get_session_summary(session_id)
        if not session_summary:
            raise HTTPException(status_code=404, detail="会话不存在")
        
        return DirectModeResponse(
            success=True,
            data=session_summary,
            message="获取会话信息成功"
        )
    except Exception as e:
        logger.error(f"获取会话信息失败: {e}")
        return DirectModeResponse(
            success=False,
            error=str(e),
            message="获取会话信息失败"
        )


@router.delete("/direct/session/{session_id}")
async def clear_session(session_id: str):
    """清除会话"""
    try:
        success = direct_mode_router.clear_session(session_id)
        if success:
            return DirectModeResponse(
                success=True,
                message="会话已清除"
            )
        else:
            return DirectModeResponse(
                success=False,
                message="会话不存在或清除失败"
            )
    except Exception as e:
        logger.error(f"清除会话失败: {e}")
        return DirectModeResponse(
            success=False,
            error=str(e),
            message="清除会话失败"
        )


@router.get("/direct/health")
async def direct_mode_health_check():
    """直接模式健康检查"""
    return DirectModeResponse(
        success=True,
        data={
            "status": "healthy",
            "available_agents": [
                "requirement_analysis_agent",
                "swot_analysis_agent",
                "business_canvas_agent",
                "policy_matching_agent",
                "incubator_recommendation_agent"
            ]
        },
        message="直接模式服务正常"
    )