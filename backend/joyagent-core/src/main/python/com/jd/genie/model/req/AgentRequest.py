#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能体请求模型
对应原Java文件: com.jd.genie.model.req.AgentRequest
"""

from typing import Optional, List, Any
from pydantic import BaseModel, Field
import uuid


class AgentRequest(BaseModel):
    """智能体请求模型"""
    
    request_id: str = Field(default_factory=lambda: str(uuid.uuid4()), description="请求ID")
    query: str = Field(..., description="用户查询内容")
    agent_type: str = Field(default="react", description="智能体类型")
    output_style: Optional[str] = Field(None, description="输出样式")
    sop_prompt: Optional[str] = Field(None, description="SOP提示")
    base_prompt: Optional[str] = Field(None, description="基础提示")
    is_stream: Optional[bool] = Field(False, description="是否流式输出")
    session_id: Optional[str] = Field(None, description="会话ID")
    user_id: Optional[str] = Field(None, description="用户ID")
    model_name: Optional[str] = Field(None, description="模型名称")
    temperature: Optional[float] = Field(0.7, description="温度参数")
    max_tokens: Optional[int] = Field(2000, description="最大token数")
    context_files: Optional[List[str]] = Field(default_factory=list, description="上下文文件列表")
    tools: Optional[List[str]] = Field(default_factory=list, description="可用工具列表")
    metadata: Optional[dict] = Field(default_factory=dict, description="元数据")
    
    class Config:
        """Pydantic配置"""
        json_encoders = {
            # 自定义JSON编码器
        }
        
    def __post_init__(self):
        """初始化后处理"""
        if not self.session_id:
            self.session_id = self.request_id