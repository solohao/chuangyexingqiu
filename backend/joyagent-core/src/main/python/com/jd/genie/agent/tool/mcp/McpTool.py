#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MCP工具
对应原Java文件: com.jd.genie.agent.tool.mcp.McpTool
"""

import httpx
import json
from typing import Dict, Any, Optional
from loguru import logger

from com.jd.genie.config.GenieConfig import GenieConfig


class McpTool:
    """MCP工具类"""
    
    def __init__(self):
        self.name = "mcp_tool"
        self.description = "MCP工具，用于调用Model Context Protocol服务"
        self.agent_context: Optional[Any] = None
        self.config = GenieConfig()
        self.base_url = self.config.get_mcp_client_url()
    
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    async def list_tool(self, server_url: str) -> str:
        """列出MCP服务器的工具"""
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                payload = {
                    "server_url": server_url
                }
                
                response = await client.post(
                    f"{self.base_url}/v1/tool/list",
                    json=payload
                )
                
                if response.status_code == 200:
                    return response.text
                else:
                    logger.error(f"MCP list tools failed: HTTP {response.status_code}")
                    return ""
                    
        except Exception as e:
            logger.error(f"MCP list tools error: {e}")
            return ""
    
    async def call_tool(self, server_url: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        """调用MCP工具"""
        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                payload = {
                    "server_url": server_url,
                    "name": tool_name,
                    "arguments": arguments
                }
                
                response = await client.post(
                    f"{self.base_url}/v1/tool/call",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "result": result,
                        "tool": "mcp",
                        "tool_name": tool_name
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }
                    
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "MCP tool call timed out"
            }
        except Exception as e:
            logger.error(f"MCP tool call error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行MCP工具调用"""
        server_url = parameters.get("server_url", "")
        tool_name = parameters.get("tool_name", "")
        arguments = parameters.get("arguments", {})
        
        if not server_url or not tool_name:
            return {
                "success": False,
                "error": "server_url and tool_name parameters are required"
            }
        
        return await self.call_tool(server_url, tool_name, arguments)