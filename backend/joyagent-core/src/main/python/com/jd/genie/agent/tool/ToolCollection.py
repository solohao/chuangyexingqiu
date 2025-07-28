#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
工具集合
对应原Java文件: com.jd.genie.agent.tool.ToolCollection
"""

from typing import Dict, List, Any, Optional
from loguru import logger


class ToolCollection:
    """工具集合类"""
    
    def __init__(self):
        self.tools: Dict[str, Any] = {}
        self.mcp_tools: Dict[str, Dict[str, Any]] = {}
        self.agent_context: Optional[Any] = None
    
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    def add_tool(self, tool: Any):
        """添加工具"""
        try:
            tool_name = getattr(tool, 'name', tool.__class__.__name__)
            self.tools[tool_name] = tool
            logger.debug(f"Added tool: {tool_name}")
        except Exception as e:
            logger.error(f"Failed to add tool: {e}")
    
    def add_mcp_tool(self, method: str, description: str, input_schema: str, server_url: str):
        """添加MCP工具"""
        try:
            self.mcp_tools[method] = {
                "method": method,
                "description": description,
                "input_schema": input_schema,
                "server_url": server_url
            }
            logger.debug(f"Added MCP tool: {method}")
        except Exception as e:
            logger.error(f"Failed to add MCP tool {method}: {e}")
    
    def get_tool(self, tool_name: str) -> Optional[Any]:
        """获取工具"""
        return self.tools.get(tool_name)
    
    def get_mcp_tool(self, method: str) -> Optional[Dict[str, Any]]:
        """获取MCP工具"""
        return self.mcp_tools.get(method)
    
    def list_tools(self) -> List[str]:
        """列出所有工具名称"""
        return list(self.tools.keys())
    
    def list_mcp_tools(self) -> List[str]:
        """列出所有MCP工具名称"""
        return list(self.mcp_tools.keys())
    
    def get_all_tools(self) -> Dict[str, Any]:
        """获取所有工具"""
        return self.tools.copy()
    
    def get_all_mcp_tools(self) -> Dict[str, Dict[str, Any]]:
        """获取所有MCP工具"""
        return self.mcp_tools.copy()
    
    def has_tool(self, tool_name: str) -> bool:
        """检查是否有指定工具"""
        return tool_name in self.tools
    
    def has_mcp_tool(self, method: str) -> bool:
        """检查是否有指定MCP工具"""
        return method in self.mcp_tools
    
    def remove_tool(self, tool_name: str) -> bool:
        """移除工具"""
        if tool_name in self.tools:
            del self.tools[tool_name]
            logger.debug(f"Removed tool: {tool_name}")
            return True
        return False
    
    def remove_mcp_tool(self, method: str) -> bool:
        """移除MCP工具"""
        if method in self.mcp_tools:
            del self.mcp_tools[method]
            logger.debug(f"Removed MCP tool: {method}")
            return True
        return False
    
    def clear_tools(self):
        """清空所有工具"""
        self.tools.clear()
        logger.debug("Cleared all tools")
    
    def clear_mcp_tools(self):
        """清空所有MCP工具"""
        self.mcp_tools.clear()
        logger.debug("Cleared all MCP tools")
    
    def get_tool_count(self) -> int:
        """获取工具数量"""
        return len(self.tools)
    
    def get_mcp_tool_count(self) -> int:
        """获取MCP工具数量"""
        return len(self.mcp_tools)
    
    def get_total_tool_count(self) -> int:
        """获取总工具数量"""
        return len(self.tools) + len(self.mcp_tools)
    
    def get_tool_info(self) -> Dict[str, Any]:
        """获取工具信息摘要"""
        return {
            "total_tools": self.get_total_tool_count(),
            "regular_tools": self.get_tool_count(),
            "mcp_tools": self.get_mcp_tool_count(),
            "tool_names": self.list_tools(),
            "mcp_tool_names": self.list_mcp_tools()
        }