#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件工具
对应原Java文件: com.jd.genie.agent.tool.common.FileTool
"""

import os
import json
from typing import Dict, Any, Optional
from loguru import logger


class FileTool:
    """文件工具类"""
    
    def __init__(self):
        self.name = "file_tool"
        self.description = "文件读写工具，支持文件的读取、写入和管理操作"
        self.agent_context: Optional[Any] = None
    
    def set_agent_context(self, agent_context: Any):
        """设置智能体上下文"""
        self.agent_context = agent_context
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行文件操作"""
        try:
            operation = parameters.get("operation", "read")
            
            if operation == "read":
                return await self._read_file(parameters)
            elif operation == "write":
                return await self._write_file(parameters)
            elif operation == "list":
                return await self._list_files(parameters)
            elif operation == "delete":
                return await self._delete_file(parameters)
            else:
                return {
                    "success": False,
                    "error": f"Unknown operation: {operation}"
                }
                
        except Exception as e:
            logger.error(f"FileTool execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _read_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """读取文件"""
        file_path = parameters.get("file_path")
        if not file_path:
            return {
                "success": False,
                "error": "file_path parameter is required"
            }
        
        try:
            if not os.path.exists(file_path):
                return {
                    "success": False,
                    "error": f"File not found: {file_path}"
                }
            
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            return {
                "success": True,
                "content": content,
                "file_path": file_path,
                "size": len(content)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to read file: {str(e)}"
            }
    
    async def _write_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """写入文件"""
        file_path = parameters.get("file_path")
        content = parameters.get("content", "")
        
        if not file_path:
            return {
                "success": False,
                "error": "file_path parameter is required"
            }
        
        try:
            # 确保目录存在
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            
            return {
                "success": True,
                "file_path": file_path,
                "size": len(content),
                "message": "File written successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to write file: {str(e)}"
            }
    
    async def _list_files(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """列出文件"""
        directory = parameters.get("directory", ".")
        
        try:
            if not os.path.exists(directory):
                return {
                    "success": False,
                    "error": f"Directory not found: {directory}"
                }
            
            files = []
            for item in os.listdir(directory):
                item_path = os.path.join(directory, item)
                files.append({
                    "name": item,
                    "path": item_path,
                    "is_file": os.path.isfile(item_path),
                    "is_directory": os.path.isdir(item_path),
                    "size": os.path.getsize(item_path) if os.path.isfile(item_path) else 0
                })
            
            return {
                "success": True,
                "directory": directory,
                "files": files,
                "count": len(files)
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to list files: {str(e)}"
            }
    
    async def _delete_file(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """删除文件"""
        file_path = parameters.get("file_path")
        
        if not file_path:
            return {
                "success": False,
                "error": "file_path parameter is required"
            }
        
        try:
            if not os.path.exists(file_path):
                return {
                    "success": False,
                    "error": f"File not found: {file_path}"
                }
            
            os.remove(file_path)
            
            return {
                "success": True,
                "file_path": file_path,
                "message": "File deleted successfully"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to delete file: {str(e)}"
            }