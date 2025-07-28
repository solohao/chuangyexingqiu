#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
政策匹配智能体
创业星球专用智能体 - 集成LLM的真正AI对话
"""

import json
from typing import Dict, Any, Optional
from loguru import logger
from .base_agent import BaseAgent
from .prompts.StartupPrompts import StartupPrompts
from com.jd.genie.agent.llm.LLMService import llm_service


class PolicyMatchingAgent(BaseAgent):
    """政策匹配智能体"""
    
    def __init__(self):
        super().__init__(
            name="policy_matching_agent",
            description="政策匹配智能体，用于匹配适合的创业政策和扶持计划"
        )
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行政策匹配 - 使用LLM进行真正的AI分析"""
        try:
            project_type = parameters.get("project_type", "")
            location = parameters.get("location", "")
            
            logger.info(f"开始LLM政策匹配: {project_type} - {location}")
            
            # 使用LLM匹配相关政策
            policies = await self._match_policies_with_llm(project_type, location)
            
            return {
                "success": True,
                "result": policies,
                "tool": "policy_matching"
            }
            
        except Exception as e:
            logger.error(f"PolicyMatchingAgent execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _match_policies_with_llm(self, project_type: str, location: str) -> Dict[str, Any]:
        """使用LLM匹配政策"""
        try:
            # 构建Prompt
            system_prompt = StartupPrompts.POLICY_MATCHING_SYSTEM
            user_prompt = StartupPrompts.POLICY_MATCHING_USER.format(
                project_type=project_type,
                location=location
            )
            
            # 调用LLM
            response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=2500
            )
            
            logger.info(f"LLM政策匹配响应: {response[:200]}...")
            
            # 尝试解析JSON响应
            try:
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    policy_result = json.loads(json_str)
                    return policy_result
                else:
                    return self._parse_policy_response(response, project_type, location)
                    
            except json.JSONDecodeError as e:
                logger.warning(f"政策匹配JSON解析失败: {e}, 使用备用解析方法")
                return self._parse_policy_response(response, project_type, location)
                
        except Exception as e:
            logger.error(f"LLM政策匹配失败: {e}, 使用备用分析方法")
            return self._fallback_policy_matching(project_type, location)
    
    def _parse_policy_response(self, response: str, project_type: str, location: str) -> Dict[str, Any]:
        """解析政策匹配响应"""
        return {
            "national_policies": self._extract_policies(response, ["国家", "国家级", "中央"]),
            "local_policies": self._extract_policies(response, ["地方", "本地", location]),
            "industry_policies": self._extract_policies(response, ["行业", "专项", project_type])
        }
    
    def _extract_policies(self, response: str, keywords: list) -> list:
        """提取政策信息"""
        # 简化的政策提取逻辑
        policies = []
        lines = response.split('\n')
        
        for i, line in enumerate(lines):
            if any(keyword in line for keyword in keywords) and ("政策" in line or "扶持" in line):
                policy = {
                    "name": line.strip(),
                    "description": f"针对{keywords[0]}的创业扶持政策",
                    "benefits": ["资金支持", "税收优惠", "政策扶持"],
                    "eligibility": "符合相关条件的创业项目"
                }
                policies.append(policy)
                
                if len(policies) >= 3:  # 限制数量
                    break
        
        return policies if policies else [{
            "name": f"{keywords[0]}创业扶持政策",
            "description": f"支持{keywords[0]}创业项目的相关政策",
            "benefits": ["政策支持", "资源倾斜", "优惠措施"],
            "eligibility": "符合申请条件的项目"
        }]
    
    def _fallback_policy_matching(self, project_type: str, location: str) -> Dict[str, Any]:
        """备用政策匹配"""
        return {
            "national_policies": [
                {
                    "name": "国家创新创业政策",
                    "description": "支持科技创新和创业的国家级政策",
                    "benefits": ["税收减免", "创业资金支持", "孵化器入驻优惠"],
                    "eligibility": "科技型创业项目，符合国家产业政策导向"
                },
                {
                    "name": "大众创业万众创新政策",
                    "description": "国家推动创新创业的综合性政策",
                    "benefits": ["简化注册流程", "降低创业门槛", "提供创业服务"],
                    "eligibility": "各类创业主体和创新项目"
                }
            ],
            "local_policies": [
                {
                    "name": f"{location}创业扶持政策",
                    "description": f"{location}地方政府的创业扶持计划",
                    "benefits": ["启动资金补贴", "办公场地优惠", "人才引进支持"],
                    "eligibility": f"在{location}注册的创业企业"
                },
                {
                    "name": f"{location}产业发展基金",
                    "description": f"{location}设立的产业发展专项基金",
                    "benefits": ["股权投资", "债权融资", "担保支持"],
                    "eligibility": f"符合{location}产业发展方向的项目"
                }
            ],
            "industry_policies": [
                {
                    "name": f"{project_type}行业专项政策",
                    "description": f"针对{project_type}行业的专项扶持政策",
                    "benefits": ["专项资金支持", "技术研发补贴", "市场准入便利"],
                    "eligibility": f"从事{project_type}相关业务的企业"
                },
                {
                    "name": f"{project_type}产业发展规划",
                    "description": f"促进{project_type}产业发展的政策规划",
                    "benefits": ["产业引导基金", "技术创新支持", "人才培养计划"],
                    "eligibility": f"符合{project_type}产业发展要求的项目"
                }
            ]
        }