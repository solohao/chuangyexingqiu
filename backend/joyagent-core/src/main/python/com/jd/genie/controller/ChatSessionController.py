#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
聊天会话控制器
提供会话相关的API接口
"""

import json
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Request, HTTPException, Path, Body
from pydantic import BaseModel
from loguru import logger

from com.jd.genie.service.ChatSessionService import chat_session_service

router = APIRouter()


class SessionResponse(BaseModel):
    """会话响应模型"""
    code: int = 0
    data: Any = None
    message: str = "success"
    requestId: str = ""


@router.get("/sessions")
async def get_all_sessions():
    """获取所有会话"""
    try:
        sessions = chat_session_service.get_all_sessions()
        return SessionResponse(data=sessions)
    except Exception as e:
        logger.error(f"获取所有会话失败: {e}")
        return SessionResponse(
            code=500,
            message="获取会话失败",
            data=[]
        )


@router.get("/sessions/{session_id}")
async def get_session(session_id: str = Path(...)):
    """获取指定会话"""
    try:
        session = chat_session_service.get_session(session_id)
        if session:
            return SessionResponse(data=session)
        else:
            return SessionResponse(
                code=404,
                message="会话不存在",
                data=None
            )
    except Exception as e:
        logger.error(f"获取会话失败: {session_id}, {e}")
        return SessionResponse(
            code=500,
            message=f"获取会话失败: {str(e)}",
            data=None
        )


@router.post("/sessions")
async def create_session(metadata: Dict[str, Any] = Body(...)):
    """创建新会话"""
    try:
        session = chat_session_service.create_session(metadata)
        return SessionResponse(
            data=session,
            message="会话创建成功"
        )
    except Exception as e:
        logger.error(f"创建会话失败: {e}")
        return SessionResponse(
            code=500,
            message=f"创建会话失败: {str(e)}",
            data=None
        )


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str = Path(...)):
    """删除会话"""
    try:
        deleted = chat_session_service.delete_session(session_id)
        if deleted:
            return SessionResponse(message="会话删除成功")
        else:
            return SessionResponse(
                code=404,
                message="会话不存在",
                data=None
            )
    except Exception as e:
        logger.error(f"删除会话失败: {session_id}, {e}")
        return SessionResponse(
            code=500,
            message=f"删除会话失败: {str(e)}",
            data=None
        )


@router.delete("/sessions")
async def clear_all_sessions():
    """清空所有会话"""
    try:
        chat_session_service.clear_all_sessions()
        return SessionResponse(message="所有会话已清空")
    except Exception as e:
        logger.error(f"清空所有会话失败: {e}")
        return SessionResponse(
            code=500,
            message=f"清空所有会话失败: {str(e)}",
            data=None
        )


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str = Path(...)):
    """获取会话消息"""
    try:
        messages = chat_session_service.get_session_messages(session_id)
        if messages is not None:
            return SessionResponse(
                data=messages,
                requestId=session_id
            )
        else:
            return SessionResponse(
                code=404,
                message="会话不存在或没有消息",
                data=[],
                requestId=session_id
            )
    except Exception as e:
        logger.error(f"获取会话消息失败: {session_id}, {e}")
        return SessionResponse(
            code=500,
            message=f"获取会话消息失败: {str(e)}",
            data=[],
            requestId=session_id
        )


class MessagePayload(BaseModel):
    """消息请求负载"""
    messages: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = None


@router.post("/sessions/{session_id}/messages")
async def save_session_messages(
    session_id: str = Path(...),
    payload: MessagePayload = Body(...)
):
    """保存会话消息"""
    try:
        saved = chat_session_service.save_session_messages(
            session_id,
            payload.messages,
            payload.metadata or {}
        )
        if saved:
            return SessionResponse(message="消息保存成功")
        else:
            return SessionResponse(
                code=400,
                message="消息保存失败",
                data=None
            )
    except Exception as e:
        logger.error(f"保存会话消息失败: {session_id}, {e}")
        return SessionResponse(
            code=500,
            message=f"保存会话消息失败: {str(e)}",
            data=None
        )


@router.post("/sessions/{session_id}/sync")
async def sync_session(
    session_id: str = Path(...),
    session: Dict[str, Any] = Body(...)
):
    """同步会话"""
    try:
        if session_id != session.get("id"):
            return SessionResponse(
                code=400,
                message="会话ID不匹配",
                data=None
            )
            
        synced = chat_session_service.sync_session(session_id, session)
        if synced:
            return SessionResponse(message="会话同步成功")
        else:
            return SessionResponse(
                code=400,
                message="会话同步失败",
                data=None
            )
    except Exception as e:
        logger.error(f"同步会话失败: {session_id}, {e}")
        return SessionResponse(
            code=500,
            message=f"同步会话失败: {str(e)}",
            data=None
        ) 