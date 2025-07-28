#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSE工具类
对应原Java文件: com.jd.genie.util.SseUtil
"""

from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from typing import AsyncGenerator, Any
import json
import asyncio
from loguru import logger


def setup_sse(app: FastAPI):
    """设置SSE支持"""
    
    @app.middleware("http")
    async def sse_middleware(request, call_next):
        """SSE中间件"""
        response = await call_next(request)
        
        # 为SSE响应添加必要的头部
        if hasattr(response, 'media_type') and response.media_type == 'text/event-stream':
            response.headers["Cache-Control"] = "no-cache"
            response.headers["Connection"] = "keep-alive"
            response.headers["Access-Control-Allow-Origin"] = "*"
            response.headers["Access-Control-Allow-Headers"] = "Cache-Control"
        
        return response


class SseUtil:
    """SSE工具类"""
    
    @staticmethod
    async def create_sse_response(generator: AsyncGenerator[str, None]) -> StreamingResponse:
        """创建SSE响应"""
        
        async def event_stream():
            """事件流生成器"""
            try:
                async for data in generator:
                    if data:
                        yield data
                    await asyncio.sleep(0.01)  # 小延迟避免过快发送
            except Exception as e:
                logger.error(f"SSE stream error: {e}")
                error_data = json.dumps({
                    "error": True,
                    "message": str(e)
                })
                yield f"data: {error_data}\n\n"
            finally:
                # 发送结束事件
                yield "event: close\ndata: stream_ended\n\n"
        
        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Cache-Control",
            }
        )
    
    @staticmethod
    def format_sse_data(data: Any, event_type: str = "message") -> str:
        """格式化SSE数据"""
        if isinstance(data, dict):
            data_str = json.dumps(data, ensure_ascii=False)
        elif isinstance(data, str):
            data_str = data
        else:
            data_str = str(data)
        
        return f"event: {event_type}\ndata: {data_str}\n\n"
    
    @staticmethod
    def format_sse_json(data: dict, event_type: str = "message") -> str:
        """格式化SSE JSON数据"""
        return SseUtil.format_sse_data(data, event_type)
    
    @staticmethod
    def format_sse_text(text: str, event_type: str = "message") -> str:
        """格式化SSE文本数据"""
        return SseUtil.format_sse_data(text, event_type)
    
    @staticmethod
    def format_sse_heartbeat() -> str:
        """格式化SSE心跳"""
        return SseUtil.format_sse_data("heartbeat", "heartbeat")
    
    @staticmethod
    def format_sse_error(error_message: str) -> str:
        """格式化SSE错误"""
        error_data = {
            "error": True,
            "message": error_message,
            "timestamp": asyncio.get_event_loop().time()
        }
        return SseUtil.format_sse_data(error_data, "error")
    
    @staticmethod
    def format_sse_close() -> str:
        """格式化SSE关闭"""
        return "event: close\ndata: stream_ended\n\n"