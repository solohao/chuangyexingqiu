#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
报告工具
对应原Java文件: com.jd.genie.agent.tool.common.ReportTool
"""

import httpx
import json
from typing import Dict, Any, Optional
from loguru import logger

from com.jd.genie.config.GenieConfig import GenieConfig


class ReportTool:
    """报告工具类"""
    
    def __init__(self):
        self.name = "report_tool"
        self.description = "报告生成工具，可以生成HTML、Markdown、PPT等格式的报告"
        self.agent_context: Optional[Any] = None
        self.config = GenieConfig()
        self.base_url = self.config.get_code_interpreter_url()  # 使用同一个服务
    
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行报告生成"""
        try:
            task = parameters.get("task", "")
            file_type = parameters.get("file_type", "html")
            file_names = parameters.get("file_names", [])
            
            if not task:
                return {
                    "success": False,
                    "error": "task parameter is required"
                }
            
            # 调用Genie-Tool的报告生成接口
            async with httpx.AsyncClient(timeout=60.0) as client:
                payload = {
                    "task": task,
                    "file_type": file_type,
                    "file_names": file_names,
                    "request_id": self.agent_context.request_id if self.agent_context else ""
                }
                
                response = await client.post(
                    f"{self.base_url}/report",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "result": result,
                        "tool": "report",
                        "file_type": file_type
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }
                    
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "Report generation request timed out"
            }
        except Exception as e:
            logger.error(f"ReportTool execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def generate_html_report(self, task: str, file_names: list = None) -> Dict[str, Any]:
        """生成HTML报告"""
        parameters = {
            "task": task,
            "file_type": "html",
            "file_names": file_names or []
        }
        return await self.execute(parameters)
    
    async def generate_markdown_report(self, task: str, file_names: list = None) -> Dict[str, Any]:
        """生成Markdown报告"""
        parameters = {
            "task": task,
            "file_type": "markdown",
            "file_names": file_names or []
        }
        return await self.execute(parameters)
    
    async def generate_ppt_report(self, task: str, file_names: list = None) -> Dict[str, Any]:
        """生成PPT报告"""
        parameters = {
            "task": task,
            "file_type": "ppt",
            "file_names": file_names or []
        }
        return await self.execute(parameters)