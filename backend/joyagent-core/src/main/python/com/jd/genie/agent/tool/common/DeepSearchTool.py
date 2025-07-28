#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
深度搜索工具
对应原Java文件: com.jd.genie.agent.tool.common.DeepSearchTool
"""

import httpx
import json
from typing import Dict, Any, Optional
from loguru import logger

from com.jd.genie.config.GenieConfig import GenieConfig


class DeepSearchTool:
    """深度搜索工具类"""
    
    def __init__(self):
        self.name = "deep_search"
        self.description = "深度搜索工具，可以搜索互联网信息并返回相关结果"
        self.agent_context: Optional[Any] = None
        self.config = GenieConfig()
        self.base_url = self.config.get_deep_search_url()
    
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行深度搜索"""
        try:
            query = parameters.get("query", "")
            max_results = parameters.get("max_results", 5)
            
            if not query:
                return {
                    "success": False,
                    "error": "query parameter is required"
                }
            
            # 调用Genie-Tool的深度搜索接口
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "query": query,
                    "max_results": max_results,
                    "request_id": self.agent_context.request_id if self.agent_context else ""
                }
                
                response = await client.post(
                    f"{self.base_url}/deep_search",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "result": result,
                        "tool": "deep_search",
                        "query": query
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }
                    
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "Deep search request timed out"
            }
        except Exception as e:
            logger.error(f"DeepSearchTool execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def search(self, query: str, max_results: int = 5) -> Dict[str, Any]:
        """搜索信息"""
        parameters = {
            "query": query,
            "max_results": max_results
        }
        return await self.execute(parameters)
    
    async def search_news(self, topic: str, max_results: int = 5) -> Dict[str, Any]:
        """搜索新闻"""
        query = f"{topic} 最新新闻"
        return await self.search(query, max_results)
    
    async def search_academic(self, topic: str, max_results: int = 5) -> Dict[str, Any]:
        """搜索学术信息"""
        query = f"{topic} 学术研究 论文"
        return await self.search(query, max_results)
    
    async def search_market_data(self, topic: str, max_results: int = 5) -> Dict[str, Any]:
        """搜索市场数据"""
        query = f"{topic} 市场数据 统计"
        return await self.search(query, max_results)