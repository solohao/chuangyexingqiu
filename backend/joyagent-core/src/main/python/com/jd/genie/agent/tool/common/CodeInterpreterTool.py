#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
代码解释器工具
对应原Java文件: com.jd.genie.agent.tool.common.CodeInterpreterTool
"""

import httpx
import json
from typing import Dict, Any, Optional
from loguru import logger

from com.jd.genie.config.GenieConfig import GenieConfig


class CodeInterpreterTool:
    """代码解释器工具类"""
    
    def __init__(self):
        self.name = "code_interpreter"
        self.description = "代码解释器工具，可以执行Python代码并返回结果"
        self.agent_context: Optional[Any] = None
        self.config = GenieConfig()
        self.base_url = self.config.get_code_interpreter_url()
    
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行代码解释器"""
        try:
            task = parameters.get("task", "")
            file_names = parameters.get("file_names", [])
            
            if not task:
                return {
                    "success": False,
                    "error": "task parameter is required"
                }
            
            # 调用Genie-Tool的代码解释器接口
            async with httpx.AsyncClient(timeout=60.0) as client:
                payload = {
                    "task": task,
                    "file_names": file_names,
                    "request_id": self.agent_context.request_id if self.agent_context else "",
                    "stream": False
                }
                
                response = await client.post(
                    f"{self.base_url}/code_interpreter",
                    json=payload
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "result": result,
                        "tool": "code_interpreter"
                    }
                else:
                    return {
                        "success": False,
                        "error": f"HTTP {response.status_code}: {response.text}"
                    }
                    
        except httpx.TimeoutException:
            return {
                "success": False,
                "error": "Code interpreter request timed out"
            }
        except Exception as e:
            logger.error(f"CodeInterpreterTool execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def execute_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """直接执行代码"""
        parameters = {
            "task": f"执行以下{language}代码：\n```{language}\n{code}\n```",
            "file_names": []
        }
        return await self.execute(parameters)
    
    async def analyze_data(self, data_description: str, file_names: list = None) -> Dict[str, Any]:
        """分析数据"""
        parameters = {
            "task": f"请分析以下数据：{data_description}",
            "file_names": file_names or []
        }
        return await self.execute(parameters)
    
    async def create_visualization(self, data_description: str, chart_type: str = "auto") -> Dict[str, Any]:
        """创建可视化图表"""
        parameters = {
            "task": f"请为以下数据创建{chart_type}图表：{data_description}",
            "file_names": []
        }
        return await self.execute(parameters)