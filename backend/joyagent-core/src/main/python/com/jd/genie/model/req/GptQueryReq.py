#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
GPT查询请求模型
对应原Java文件: com.jd.genie.model.req.GptQueryReq
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
import uuid


class GptQueryReq(BaseModel):
    """GPT查询请求模型"""
    
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="请求ID")
    query: str = Field(..., description="查询内容")
    session_id: Optional[str] = Field(None, description="会话ID")
    user_id: Optional[str] = Field(None, description="用户ID")
    model_name: Optional[str] = Field("gpt-4.1", description="模型名称")
    temperature: Optional[float] = Field(0.7, description="温度参数")
    max_tokens: Optional[int] = Field(2000, description="最大token数")
    stream: Optional[bool] = Field(True, description="是否流式输出")
    
    # 多智能体相关参数
    agent_type: Optional[str] = Field("react", description="智能体类型")
    enable_planning: Optional[bool] = Field(True, description="是否启用规划")
    max_iterations: Optional[int] = Field(10, description="最大迭代次数")
    
    # 工具相关参数
    tools: Optional[List[str]] = Field(default_factory=list, description="可用工具列表")
    tool_config: Optional[Dict[str, Any]] = Field(default_factory=dict, description="工具配置")
    
    # 上下文相关参数
    context_files: Optional[List[str]] = Field(default_factory=list, description="上下文文件")
    history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="对话历史")
    
    # 输出相关参数
    output_format: Optional[str] = Field("text", description="输出格式")
    language: Optional[str] = Field("zh", description="输出语言")
    
    # 其他参数
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict, description="元数据")
    timeout: Optional[int] = Field(300, description="超时时间(秒)")
    
    class Config:
        """Pydantic配置"""
        json_encoders = {
            # 自定义JSON编码器
        }
        
    def __post_init__(self):
        """初始化后处理"""
        if not self.session_id:
            self.session_id = self.request_id