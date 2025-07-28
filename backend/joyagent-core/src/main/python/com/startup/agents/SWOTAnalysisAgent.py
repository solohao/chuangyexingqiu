#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SWOT分析智能体
创业星球专用智能体 - 集成LLM的真正AI对话
"""

import json
from typing import Dict, Any, Optional
from loguru import logger
from .base_agent import BaseAgent
from .prompts.StartupPrompts import StartupPrompts
from com.jd.genie.agent.llm.LLMService import llm_service


class SWOTAnalysisAgent(BaseAgent):
    """SWOT分析智能体"""
    
    def __init__(self):
        super().__init__(
            name="swot_analysis_agent",
            description="SWOT分析智能体，用于进行优势、劣势、机会、威胁分析"
        )
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行SWOT分析 - 使用LLM进行真正的AI分析"""
        try:
            project_info = parameters.get("project_info", "")
            
            if not project_info:
                return {
                    "success": False,
                    "error": "project_info parameter is required"
                }
            
            logger.info(f"开始LLM SWOT分析: {project_info[:100]}...")
            
            # 使用LLM进行SWOT分析
            swot_analysis = await self._perform_swot_analysis_with_llm(project_info)
            
            return {
                "success": True,
                "result": swot_analysis,
                "tool": "swot_analysis"
            }
            
        except Exception as e:
            logger.error(f"SWOTAnalysisAgent execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def _perform_swot_analysis_with_llm(self, project_info: str) -> Dict[str, Any]:
        """使用LLM进行SWOT分析"""
        try:
            # 构建Prompt
            system_prompt = StartupPrompts.SWOT_ANALYSIS_SYSTEM
            user_prompt = StartupPrompts.SWOT_ANALYSIS_USER.format(
                project_info=project_info
            )
            
            # 调用LLM
            response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=2000
            )
            
            logger.info(f"LLM SWOT响应: {response[:200]}...")
            
            # 尝试解析JSON响应
            try:
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    swot_result = json.loads(json_str)
                    return swot_result
                else:
                    return self._parse_swot_response(response)
                    
            except json.JSONDecodeError as e:
                logger.warning(f"SWOT JSON解析失败: {e}, 使用备用解析方法")
                return self._parse_swot_response(response)
                
        except Exception as e:
            logger.error(f"LLM SWOT分析失败: {e}, 使用备用分析方法")
            return self._fallback_swot_analysis(project_info)
    
    def _parse_swot_response(self, response: str) -> Dict[str, Any]:
        """解析SWOT响应"""
        return {
            "strengths": self._extract_swot_items(response, ["优势", "Strengths", "strengths"]),
            "weaknesses": self._extract_swot_items(response, ["劣势", "Weaknesses", "weaknesses"]),
            "opportunities": self._extract_swot_items(response, ["机会", "Opportunities", "opportunities"]),
            "threats": self._extract_swot_items(response, ["威胁", "Threats", "threats"])
        }
    
    def _extract_swot_items(self, response: str, keywords: list) -> list:
        """提取SWOT项目"""
        lines = response.split('\n')
        items = []
        in_section = False
        
        for line in lines:
            if any(keyword in line for keyword in keywords):
                in_section = True
                continue
            
            if in_section:
                if line.strip().startswith('-') or line.strip().startswith('•'):
                    items.append(line.strip()[1:].strip())
                elif line.strip().startswith(('1.', '2.', '3.', '4.', '5.')):
                    items.append(line.strip()[2:].strip())
                elif not line.strip() or any(kw in line for kw in ["劣势", "机会", "威胁", "Weaknesses", "Opportunities", "Threats"]):
                    if items:  # 如果已经收集到项目，则结束当前部分
                        break
        
        return items[:5] if items else ["基于项目分析的相关要点"]
    
    def _fallback_swot_analysis(self, project_info: str) -> Dict[str, Any]:
        """备用SWOT分析"""
        return {
            "strengths": [
                "项目创新性和独特价值",
                "团队专业能力和经验",
                "技术优势和核心竞争力",
                "市场定位和目标明确"
            ],
            "weaknesses": [
                "初期资金和资源限制",
                "品牌知名度和市场认知度低",
                "团队规模和经验相对不足",
                "产品完善度和市场验证待提升"
            ],
            "opportunities": [
                "市场需求增长和发展趋势",
                "政策支持和行业扶持",
                "技术发展和创新机会",
                "合作伙伴和渠道拓展机会"
            ],
            "threats": [
                "市场竞争激烈和同质化风险",
                "技术变化和行业标准演进",
                "法规政策变化和合规风险",
                "经济环境和市场波动影响"
            ]
        }