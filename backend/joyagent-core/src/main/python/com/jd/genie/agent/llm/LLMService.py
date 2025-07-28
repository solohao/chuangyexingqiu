#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LLM服务 - 集成魔搭平台API
使用OpenAI客户端调用ModelScope API
"""

import os
import json
import asyncio
from typing import Dict, Any, List, Optional, AsyncGenerator
from loguru import logger
from openai import OpenAI


class LLMService:
    """LLM服务类"""
    
    def __init__(self):
        # 从环境变量获取配置
        self.api_key = os.getenv("MODELSCOPE_ACCESS_TOKEN")
        self.base_url = os.getenv("MODELSCOPE_API_INFERENCE_URL", "https://api-inference.modelscope.cn/v1")
        self.default_model = os.getenv("DEFAULT_MODEL", "Qwen/Qwen2.5-7B-Instruct")
        
        if not self.api_key:
            logger.warning("MODELSCOPE_ACCESS_TOKEN not found in environment variables, LLM service will be disabled")
            self.client = None
        else:
            # 创建OpenAI客户端
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
            logger.info(f"LLM服务初始化成功 - Base URL: {self.base_url}, Model: {self.default_model}")
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
        stream: bool = False
    ) -> Dict[str, Any]:
        """聊天完成接口"""
        try:
            if not self.client:
                return {
                    "error": "LLM service not available: API key not configured"
                }
            
            model = model or self.default_model
            
            # 使用OpenAI客户端调用
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=stream
            )
            
            if stream:
                # 流式响应处理
                return {"stream": response}
            else:
                # 非流式响应
                return {
                    "choices": [{
                        "message": {
                            "content": response.choices[0].message.content,
                            "role": "assistant"
                        }
                    }]
                }
                    
        except Exception as e:
            logger.error(f"LLM service error: {e}")
            return {
                "error": str(e)
            }
    
    async def chat_completion_stream(
        self,
        messages: List[Dict[str, str]],
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> AsyncGenerator[str, None]:
        """流式聊天完成接口"""
        try:
            if not self.client:
                yield "Error: LLM service not available: API key not configured"
                return
            
            model = model or self.default_model
            
            # 使用OpenAI客户端进行流式调用
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                                
        except Exception as e:
            logger.error(f"LLM stream service error: {e}")
            yield f"Error: {str(e)}"
    
    async def generate_response(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> str:
        """生成响应（简化接口）"""
        if not self.client:
            return "Error: LLM service not available: API key not configured"
        
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            model = model or self.default_model
            
            # 直接使用OpenAI客户端
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=False
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Generate response error: {e}")
            return f"Error: {str(e)}"
    
    async def generate_response_stream(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 2000
    ) -> AsyncGenerator[str, None]:
        """生成流式响应（简化接口）"""
        if not self.client:
            yield "Error: LLM service not available: API key not configured"
            return
        
        messages = []
        
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        messages.append({"role": "user", "content": prompt})
        
        try:
            model = model or self.default_model
            
            # 直接使用OpenAI客户端进行流式调用
            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                stream=True
            )
            
            for chunk in response:
                if chunk.choices[0].delta.content:
                    yield chunk.choices[0].delta.content
                    
        except Exception as e:
            logger.error(f"Generate stream response error: {e}")
            yield f"Error: {str(e)}"


# 全局LLM服务实例
llm_service = LLMService()