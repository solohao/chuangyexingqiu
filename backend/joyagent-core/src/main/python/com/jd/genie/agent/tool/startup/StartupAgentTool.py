#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创业智能体工具包装器
将Python版本的创业智能体集成到JoyAgent-Core工具系统中
"""

import json
import asyncio
from typing import Dict, Any, Optional
from loguru import logger

from com.jd.genie.agent.tool.BaseTool import BaseTool
from com.startup.agents.agent_factory import AgentFactory


class StartupAgentTool(BaseTool):
    """创业智能体工具包装器"""
    
    def __init__(self, agent_type: str, description: str):
        self.agent_type = agent_type
        self.agent_description = description
        
        # 根据智能体类型设置工具名称和描述
        tool_name_map = {
            "requirement_analysis": "requirement_analysis_agent",
            "policy_matching": "policy_matching_agent", 
            "incubator_recommendation": "incubator_agent",
            "swot_analysis": "swot_analysis_agent",
            "business_canvas": "business_canvas_agent"
        }
        
        super().__init__(
            name=tool_name_map.get(agent_type, agent_type),
            description=description
        )
        
        # 设置工具参数schema
        self.parameters = self._get_parameters_schema()
    
    def _get_parameters_schema(self) -> Dict[str, Any]:
        """获取工具参数schema"""
        base_schema = {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "用户查询内容"
                }
            },
            "required": ["query"]
        }
        
        # 根据不同智能体类型添加特定参数
        if self.agent_type == "requirement_analysis":
            base_schema["properties"]["project_description"] = {
                "type": "string",
                "description": "项目描述"
            }
            base_schema["properties"]["analysis_type"] = {
                "type": "string", 
                "description": "分析类型，如comprehensive",
                "default": "comprehensive"
            }
            base_schema["required"].extend(["project_description"])
            
        elif self.agent_type == "policy_matching":
            base_schema["properties"]["project_type"] = {
                "type": "string",
                "description": "项目类型"
            }
            base_schema["properties"]["location"] = {
                "type": "string",
                "description": "项目所在地区"
            }
            
        elif self.agent_type == "incubator_recommendation":
            base_schema["properties"]["project_stage"] = {
                "type": "string",
                "description": "项目阶段，如初创期、成长期"
            }
            base_schema["properties"]["industry"] = {
                "type": "string", 
                "description": "所属行业"
            }
            base_schema["properties"]["location"] = {
                "type": "string",
                "description": "项目所在地区"
            }
            
        elif self.agent_type == "swot_analysis":
            base_schema["properties"]["project_info"] = {
                "type": "string",
                "description": "项目信息"
            }
            base_schema["required"].extend(["project_info"])
            
        elif self.agent_type == "business_canvas":
            base_schema["properties"]["business_idea"] = {
                "type": "string",
                "description": "商业想法描述"
            }
            base_schema["required"].extend(["business_idea"])
        
        return base_schema
    
    async def execute(self, parameters: Dict[str, Any]) -> str:
        """执行智能体工具"""
        try:
            logger.info(f"{self.agent_context.request_id if self.agent_context else 'unknown'} "
                       f"executing startup agent: {self.agent_type} with parameters: {parameters}")
            
            # 创建智能体实例
            agent = AgentFactory.create_agent(self.agent_type)
            if not agent:
                return json.dumps({
                    "success": False,
                    "error": f"Unknown agent type: {self.agent_type}",
                    "agent_type": self.agent_type
                }, ensure_ascii=False)
            
            # 设置智能体上下文
            if self.agent_context:
                agent.set_agent_context(self.agent_context)
            
            # 提取查询内容
            query = parameters.get("query", "")
            
            # 准备智能体参数
            agent_params = {k: v for k, v in parameters.items() if k != "query"}
            
            # 执行智能体
            result = await agent.run(query, agent_params)
            
            # 格式化返回结果
            if result.get("success"):
                logger.info(f"{self.agent_context.request_id if self.agent_context else 'unknown'} "
                           f"startup agent {self.agent_type} executed successfully")
                
                # 美化输出结果
                formatted_result = self._format_result(result)
                return json.dumps(formatted_result, ensure_ascii=False, indent=2)
            else:
                logger.error(f"{self.agent_context.request_id if self.agent_context else 'unknown'} "
                            f"startup agent {self.agent_type} execution failed: {result.get('error')}")
                return json.dumps(result, ensure_ascii=False)
                
        except Exception as e:
            error_msg = f"Startup agent {self.agent_type} execution error: {str(e)}"
            logger.error(f"{self.agent_context.request_id if self.agent_context else 'unknown'} {error_msg}")
            return json.dumps({
                "success": False,
                "error": error_msg,
                "agent_type": self.agent_type
            }, ensure_ascii=False)
    
    def _format_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """格式化结果输出"""
        formatted = {
            "success": result["success"],
            "agent_type": self.agent_type,
            "agent_description": self.agent_description,
            "result": result["result"]
        }
        
        # 根据不同智能体类型添加特定的格式化
        if self.agent_type == "requirement_analysis":
            formatted["summary"] = "需求分析完成，包含项目概览、功能需求、非功能需求、利益相关者、成功标准、风险挑战和建议"
            
        elif self.agent_type == "swot_analysis":
            if "result" in result and isinstance(result["result"], dict):
                swot_data = result["result"]
                formatted["summary"] = f"SWOT分析完成：优势{len(swot_data.get('strengths', []))}项，" \
                                     f"劣势{len(swot_data.get('weaknesses', []))}项，" \
                                     f"机会{len(swot_data.get('opportunities', []))}项，" \
                                     f"威胁{len(swot_data.get('threats', []))}项"
                                     
        elif self.agent_type == "business_canvas":
            formatted["summary"] = "商业模式画布生成完成，包含9大核心模块的详细分析"
            
        elif self.agent_type == "policy_matching":
            if "result" in result and isinstance(result["result"], dict):
                policy_data = result["result"]
                national_count = len(policy_data.get('national_policies', []))
                local_count = len(policy_data.get('local_policies', []))
                industry_count = len(policy_data.get('industry_policies', []))
                formatted["summary"] = f"政策匹配完成：国家政策{national_count}项，" \
                                     f"地方政策{local_count}项，行业政策{industry_count}项"
                                     
        elif self.agent_type == "incubator_recommendation":
            if "result" in result and isinstance(result["result"], dict):
                incubator_data = result["result"]
                incubator_count = len(incubator_data.get('recommended_incubators', []))
                formatted["summary"] = f"孵化器推荐完成：推荐{incubator_count}家孵化器，" \
                                     f"包含申请建议和选择标准"
        
        return formatted
    
    def get_tool_description(self) -> str:
        """获取工具描述"""
        descriptions = {
            "requirement_analysis": "分析创业项目的需求和可行性，提供详细的需求分析报告",
            "policy_matching": "匹配适合的创业政策和扶持计划，帮助获得政府支持",
            "incubator_recommendation": "推荐合适的创业孵化器和加速器，提供申请建议",
            "swot_analysis": "进行SWOT分析，评估项目的优势、劣势、机会和威胁",
            "business_canvas": "生成商业模式画布，分析商业模式的9大核心要素"
        }
        return descriptions.get(self.agent_type, self.agent_description)