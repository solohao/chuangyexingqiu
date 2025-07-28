#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
需求分析智能体
创业星球专用智能体 - 集成LLM的真正AI对话
"""

import json
from typing import Dict, Any, Optional
from loguru import logger
from .base_agent import BaseAgent
from .prompts.StartupPrompts import StartupPrompts
from com.jd.genie.agent.llm.LLMService import llm_service


class RequirementAnalysisAgent(BaseAgent):
    """需求分析智能体"""
    
    def __init__(self):
        super().__init__(
            name="requirement_analysis_agent",
            description="需求分析智能体，专门用于分析创业项目的需求和可行性"
        )
    

    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行需求分析 - 使用LLM进行真正的AI分析"""
        try:
            project_description = parameters.get("project_description", "")
            analysis_type = parameters.get("analysis_type", "comprehensive")
            
            if not project_description:
                return {
                    "success": False,
                    "error": "project_description parameter is required"
                }
            
            logger.info(f"开始LLM需求分析: {project_description[:100]}...")
            
            # 使用LLM进行需求分析
            analysis_result = await self._analyze_requirements_with_llm(project_description, analysis_type)
            
            return {
                "success": True,
                "result": analysis_result,
                "tool": "requirement_analysis",
                "analysis_type": analysis_type
            }
            
        except Exception as e:
            logger.error(f"RequirementAnalysisAgent execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }
    
    async def execute_stream(self, parameters: Dict[str, Any]):
        """执行需求分析 - 流式版本"""
        try:
            project_description = parameters.get("project_description", "")
            analysis_type = parameters.get("analysis_type", "comprehensive")
            
            if not project_description:
                yield {
                    "type": "error",
                    "error": "project_description parameter is required"
                }
                return
            
            logger.info(f"开始流式LLM需求分析: {project_description[:100]}...")
            
            # 发送开始事件
            yield {
                "type": "start",
                "message": "开始需求分析...",
                "agent": self.name
            }
            
            # 使用流式LLM进行需求分析
            async for chunk in self._analyze_requirements_with_llm_stream(project_description, analysis_type):
                yield chunk
            
        except Exception as e:
            logger.error(f"RequirementAnalysisAgent stream execution error: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "agent": self.name
            }
    
    async def _analyze_requirements_with_llm(self, project_description: str, analysis_type: str) -> Dict[str, Any]:
        """使用LLM进行需求分析"""
        try:
            # 构建Prompt
            system_prompt = StartupPrompts.REQUIREMENT_ANALYSIS_SYSTEM
            user_prompt = StartupPrompts.REQUIREMENT_ANALYSIS_USER.format(
                project_description=project_description,
                analysis_type=analysis_type
            )
            
            # 调用LLM
            response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=3000
            )
            
            logger.info(f"LLM响应: {response[:200]}...")
            
            # 尝试解析JSON响应
            try:
                # 提取JSON部分（如果LLM返回了额外的文本）
                json_start = response.find('{')
                json_end = response.rfind('}') + 1
                
                if json_start != -1 and json_end > json_start:
                    json_str = response[json_start:json_end]
                    analysis_result = json.loads(json_str)
                    return analysis_result
                else:
                    # 如果没有找到JSON，使用备用解析方法
                    return self._parse_llm_response(response, project_description)
                    
            except json.JSONDecodeError as e:
                logger.warning(f"JSON解析失败: {e}, 使用备用解析方法")
                return self._parse_llm_response(response, project_description)
                
        except Exception as e:
            logger.error(f"LLM需求分析失败: {e}, 使用备用分析方法")
            # 如果LLM调用失败，使用备用的规则分析
            return await self._fallback_analysis(project_description, analysis_type)
    
    def _parse_llm_response(self, response: str, project_description: str) -> Dict[str, Any]:
        """解析LLM响应（当JSON解析失败时的备用方法）"""
        # 基于LLM响应内容进行智能解析
        return {
            "project_overview": {
                "description": project_description,
                "category": self._extract_category_from_response(response),
                "complexity": self._extract_complexity_from_response(response)
            },
            "functional_requirements": self._extract_list_from_response(response, "功能需求"),
            "non_functional_requirements": self._extract_list_from_response(response, "非功能需求"),
            "stakeholders": self._extract_list_from_response(response, "利益相关者"),
            "success_criteria": self._extract_list_from_response(response, "成功标准"),
            "risks_and_challenges": self._extract_list_from_response(response, "风险"),
            "recommendations": self._extract_list_from_response(response, "建议")
        }
    
    def _extract_category_from_response(self, response: str) -> str:
        """从响应中提取项目分类"""
        categories = ["软件/应用开发", "电子商务", "教育培训", "健康医疗", "金融科技", "人工智能"]
        for category in categories:
            if category in response:
                return category
        return "其他"
    
    def _extract_complexity_from_response(self, response: str) -> str:
        """从响应中提取复杂度"""
        if "复杂度：高" in response or "高复杂度" in response:
            return "高"
        elif "复杂度：中" in response or "中等复杂度" in response:
            return "中"
        else:
            return "低"
    
    def _extract_list_from_response(self, response: str, keyword: str) -> list:
        """从响应中提取列表项"""
        # 简单的文本解析逻辑
        lines = response.split('\n')
        items = []
        in_section = False
        
        for line in lines:
            if keyword in line:
                in_section = True
                continue
            
            if in_section:
                if line.strip().startswith('-') or line.strip().startswith('•'):
                    items.append(line.strip()[1:].strip())
                elif line.strip().startswith(('1.', '2.', '3.', '4.', '5.')):
                    items.append(line.strip()[2:].strip())
                elif not line.strip():
                    break
        
        return items[:5] if items else [f"基于{keyword}的分析结果"]
    
    async def _analyze_requirements_with_llm_stream(self, project_description: str, analysis_type: str):
        """使用LLM进行流式需求分析"""
        try:
            # 构建Prompt
            system_prompt = StartupPrompts.REQUIREMENT_ANALYSIS_SYSTEM
            user_prompt = StartupPrompts.REQUIREMENT_ANALYSIS_USER.format(
                project_description=project_description,
                analysis_type=analysis_type
            )
            
            # 发送进度事件
            yield {
                "type": "progress",
                "message": "正在调用AI分析服务...",
                "stage": "llm_call"
            }
            
            # 使用流式LLM调用 - 真正的边接收边显示
            full_response = ""
            chunk_count = 0
            
            async for chunk in llm_service.generate_response_stream(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=3000
            ):
                chunk_count += 1
                full_response += chunk
                
                # 每个chunk都实时发送，实现真正的流式显示
                yield {
                    "type": "stream",
                    "content": chunk,  # 发送当前chunk内容
                    "accumulated_content": full_response,  # 发送累积内容
                    "chunk_index": chunk_count,
                    "stage": "streaming"
                }
            
            logger.info(f"LLM流式响应完成，总共{chunk_count}个chunks，{len(full_response)}字符")
            
            # 发送流式完成事件
            yield {
                "type": "stream_complete",
                "message": f"需求分析完成，共生成 {len(full_response)} 字符",
                "total_chunks": chunk_count,
                "final_content": full_response
            }
            
            # 发送完成事件
            yield {
                "type": "complete",
                "message": "需求分析流程完成",
                "total_chunks": chunk_count,
                "response_length": len(full_response)
            }
                
        except Exception as e:
            logger.error(f"LLM流式需求分析失败: {e}")
            # 使用备用分析
            yield {
                "type": "progress",
                "message": "AI服务异常，使用备用分析方法...",
                "stage": "fallback"
            }
            
            fallback_result = await self._fallback_analysis(project_description, analysis_type)
            yield {
                "type": "result",
                "data": fallback_result,
                "message": "需求分析完成（使用备用方法）"
            }
            
            yield {
                "type": "complete",
                "message": "需求分析流程完成（备用模式）",
                "fallback": True
            }

    async def _fallback_analysis(self, project_description: str, analysis_type: str) -> Dict[str, Any]:
        """备用分析方法（当LLM不可用时）"""
        logger.info("使用备用分析方法")
        
        return {
            "project_overview": {
                "description": project_description,
                "category": self._categorize_project_simple(project_description),
                "complexity": self._assess_complexity_simple(project_description)
            },
            "functional_requirements": [
                "用户注册和登录功能",
                "核心业务功能实现", 
                "数据管理和存储",
                "用户界面设计",
                "系统集成和API接口"
            ],
            "non_functional_requirements": [
                "系统性能和响应时间",
                "安全性和数据保护",
                "可扩展性和可维护性",
                "用户体验和界面友好性",
                "跨平台兼容性"
            ],
            "stakeholders": [
                "最终用户/客户",
                "项目团队成员",
                "投资者/股东",
                "合作伙伴",
                "监管机构（如适用）"
            ],
            "success_criteria": [
                "用户满意度达到预期目标",
                "市场份额和用户增长",
                "收入和盈利能力",
                "技术指标达成",
                "项目按时按预算完成"
            ],
            "risks_and_challenges": [
                "技术实现风险",
                "市场竞争风险", 
                "资金和资源风险",
                "法律法规风险",
                "团队和人才风险"
            ],
            "recommendations": [
                "进行详细的市场调研",
                "制定详细的技术方案",
                "建立强有力的团队",
                "制定风险管理计划",
                "寻求专业指导和支持"
            ]
        }
    
    def _categorize_project_simple(self, description: str) -> str:
        """简单项目分类"""
        desc_lower = description.lower()
        if any(word in desc_lower for word in ["app", "应用", "软件", "平台", "系统"]):
            return "软件/应用开发"
        elif any(word in desc_lower for word in ["电商", "商城", "购物", "零售", "电子商务"]):
            return "电子商务"
        elif any(word in desc_lower for word in ["教育", "培训", "学习", "课程"]):
            return "教育培训"
        elif any(word in desc_lower for word in ["健康", "医疗", "养生", "医院"]):
            return "健康医疗"
        elif any(word in desc_lower for word in ["金融", "支付", "银行", "投资"]):
            return "金融科技"
        elif any(word in desc_lower for word in ["ai", "人工智能", "机器学习", "算法"]):
            return "人工智能"
        else:
            return "其他"
    
    def _assess_complexity_simple(self, description: str) -> str:
        """简单复杂度评估"""
        word_count = len(description.split())
        complex_keywords = ["集成", "算法", "AI", "人工智能", "大数据", "区块链", "物联网", "机器学习"]
        
        if word_count > 100 or any(word in description for word in complex_keywords):
            return "高"
        elif word_count > 50:
            return "中"
        else:
            return "低"