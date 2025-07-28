#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SSE发射器UTF8支持
对应原Java文件: com.jd.genie.util.SseEmitterUTF8
"""

import asyncio
import json
from typing import Any, Dict, Optional
from loguru import logger


class SseEmitterUTF8:
    """SSE发射器UTF8支持类"""
    
    def __init__(self):
        self.is_closed = False
        self.queue = asyncio.Queue()
        self._close_event = asyncio.Event()
    
    async def send_data(self, data: Any, event_type: str = "message"):
        """发送数据"""
        if self.is_closed:
            return
        
        try:
            # 确保数据是字符串格式
            if isinstance(data, dict):
                data_str = json.dumps(data, ensure_ascii=False)
            elif isinstance(data, str):
                data_str = data
            else:
                data_str = str(data)
            
            # 构造SSE格式
            sse_data = f"event: {event_type}\ndata: {data_str}\n\n"
            
            await self.queue.put(sse_data)
            
        except Exception as e:
            logger.error(f"SSE send data error: {e}")
    
    async def send_event(self, event_name: str, data: Any):
        """发送事件"""
        await self.send_data(data, event_name)
    
    async def send_json(self, data: Dict[str, Any], event_type: str = "message"):
        """发送JSON数据"""
        await self.send_data(data, event_type)
    
    async def send_text(self, text: str, event_type: str = "message"):
        """发送文本数据"""
        await self.send_data(text, event_type)
    
    async def send_heartbeat(self):
        """发送心跳"""
        await self.send_data("heartbeat", "heartbeat")
    
    async def send_error(self, error_message: str):
        """发送错误信息"""
        error_data = {
            "error": True,
            "message": error_message,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.send_data(error_data, "error")
    
    async def complete(self):
        """完成发送"""
        if not self.is_closed:
            self.is_closed = True
            await self.queue.put(None)  # 发送结束信号
            self._close_event.set()
    
    async def complete_with_error(self, error: Exception):
        """带错误完成"""
        await self.send_error(str(error))
        await self.complete()
    
    def __aiter__(self):
        """异步迭代器"""
        return self
    
    async def __anext__(self):
        """异步迭代器下一个元素"""
        if self.is_closed and self.queue.empty():
            raise StopAsyncIteration
        
        try:
            # 等待数据或关闭事件
            data_task = asyncio.create_task(self.queue.get())
            close_task = asyncio.create_task(self._close_event.wait())
            
            done, pending = await asyncio.wait(
                [data_task, close_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            # 取消未完成的任务
            for task in pending:
                task.cancel()
            
            if data_task in done:
                data = await data_task
                if data is None:  # 结束信号
                    raise StopAsyncIteration
                return data
            else:
                # 关闭事件触发
                raise StopAsyncIteration
                
        except asyncio.CancelledError:
            raise StopAsyncIteration
        except Exception as e:
            logger.error(f"SSE iterator error: {e}")
            raise StopAsyncIteration