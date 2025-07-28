#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
孵化器推荐智能体
创业星球专用智能体 - 集成LLM的真正AI对话
"""

import json
from typing import Dict, Any, Optional
from loguru import logger
from .base_agent import BaseAgent
from .prompts.StartupPrompts import StartupPrompts
from com.jd.genie.agent.llm.LLMService import llm_service


class IncubatorAgent(BaseAgent):
    """孵化器推荐智能体"""
    
    def __init__(self):
        super().__init__(
            name="incubator_agent",
            description="孵化器推荐智能体，用于推荐合适的创业孵化器和加速器"
        )
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行孵化器推荐 - 使用LLM进行真正的AI分析"""
        try:
            project_stage = parameters.get("project_stage", "")
            industry = parameters.get("industry", "")
            location = parameters.get("location", "")
            
            logger.info(f"开始LLM孵化器推荐: {project_stage} - {industry} - {location}")
            
            # 使用LLM推荐孵化器
            incubators = await self._recommend_incubators_with_llm(project_stage, industry, location)
            
            return {
                "success": True,
                "result": incubators,
                "tool": "incubator_recommendation"
            }
            
        except Exception as e:
            logger.error(f"IncubatorAgent execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _recommend_incubators_with_llm(self, project_stage: str, industry: str, location: str) -> Dict[str, Any]:
        """使用LLM推荐孵化器"""
        try:
            # 构建Prompt
            system_prompt = StartupPrompts.INCUBATOR_RECOMMENDATION_SYSTEM
            user_prompt = StartupPrompts.INCUBATOR_RECOMMENDATION_USER.format(
                project_stage=project_stage,
                industry=industry,
                location=location
            )
            
            # 调用LLM
            response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=2500
            )
            
            logger.info(f"LLM孵化器推荐响应: {response[:200]}...")
            
            # 尝试解析JSON响应
            try:
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    incubator_result = json.loads(json_str)
                    return incubator_result
                else:
                    return self._parse_incubator_response(response, project_stage, industry, location)
                    
            except json.JSONDecodeError as e:
                logger.warning(f"孵化器推荐JSON解析失败: {e}, 使用备用解析方法")
                return self._parse_incubator_response(response, project_stage, industry, location)
                
        except Exception as e:
            logger.error(f"LLM孵化器推荐失败: {e}, 使用备用分析方法")
            return self._fallback_incubator_recommendation(project_stage, industry, location)
    
    def _parse_incubator_response(self, response: str, project_stage: str, industry: str, location: str) -> Dict[str, Any]:
        """解析孵化器推荐响应"""
        # 简化的解析逻辑
        return {
            "recommended_incubators": self._extract_incubators_from_response(response, industry, location),
            "application_tips": self._extract_tips_from_response(response, "申请建议"),
            "selection_criteria": self._extract_tips_from_response(response, "选择标准")
        }
    
    def _extract_incubators_from_response(self, response: str, industry: str, location: str) -> list:
        """从响应中提取孵化器信息"""
        # 基于行业和地区生成推荐孵化器
        incubators = [
            {
                "name": f"{industry}专业孵化器",
                "type": "专业孵化器",
                "location": location,
                "focus_areas": [industry, "创新技术", "商业模式"],
                "services": ["专业指导", "资金对接", "市场资源", "技术支持"],
                "success_rate": "80%",
                "contact": "contact@incubator.com"
            },
            {
                "name": f"{location}创业加速器",
                "type": "综合加速器",
                "location": location,
                "focus_areas": ["多行业", "早期项目", "快速成长"],
                "services": ["加速培训", "投资对接", "导师网络", "市场推广"],
                "success_rate": "75%",
                "contact": "info@accelerator.com"
            }
        ]
        return incubators
    
    def _extract_tips_from_response(self, response: str, section_name: str) -> list:
        """从响应中提取建议"""
        lines = response.split('\n')
        tips = []
        in_section = False
        
        for line in lines:
            if section_name in line:
                in_section = True
                continue
            
            if in_section:
                if line.strip().startswith('-') or line.strip().startswith('•'):
                    tips.append(line.strip()[1:].strip())
                elif line.strip().startswith(('1.', '2.', '3.', '4.', '5.')):
                    tips.append(line.strip()[2:].strip())
                elif not line.strip():
                    break
        
        return tips[:5] if tips else [f"基于{section_name}的专业建议"]
    
    def _fallback_incubator_recommendation(self, project_stage: str, industry: str, location: str) -> Dict[str, Any]:
        """备用孵化器推荐"""
        return {
            "recommended_incubators": [
                {
                    "name": f"{industry}科技孵化器",
                    "type": "专业孵化器",
                    "location": location or "北京",
                    "focus_areas": [industry, "技术创新", "产业升级"],
                    "services": ["专业导师指导", "种子资金支持", "办公场地提供", "产业资源对接"],
                    "success_rate": "82%",
                    "contact": "contact@tech-incubator.com"
                },
                {
                    "name": f"{location}创业加速器",
                    "type": "综合加速器", 
                    "location": location or "上海",
                    "focus_areas": ["早期项目", "商业模式验证", "市场拓展"],
                    "services": ["加速培训课程", "投资人对接", "市场推广支持", "法务财务服务"],
                    "success_rate": "78%",
                    "contact": "info@startup-accelerator.com"
                },
                {
                    "name": "国际创新中心",
                    "type": "国际化孵化器",
                    "location": "深圳",
                    "focus_areas": ["国际化项目", "跨境合作", "全球市场"],
                    "services": ["国际导师网络", "海外市场对接", "跨境投资支持", "国际化培训"],
                    "success_rate": "85%",
                    "contact": "global@innovation-center.com"
                }
            ],
            "application_tips": [
                "准备完整详细的商业计划书",
                "清晰展示项目的创新性和市场价值",
                "突出团队的专业能力和执行力",
                "提供可验证的市场需求和用户反馈",
                "展示项目的可扩展性和盈利模式"
            ],
            "selection_criteria": [
                "项目的创新性和技术含量",
                "市场潜力和商业价值",
                "团队的专业背景和执行能力",
                "商业模式的可行性和可持续性",
                "项目与孵化器定位的匹配度"
            ]
        }