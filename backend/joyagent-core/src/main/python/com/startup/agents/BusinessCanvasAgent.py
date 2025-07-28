#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
商业模式画布智能体
创业星球专用智能体 - 集成LLM的真正AI对话
"""

import json
from typing import Dict, Any, Optional
from loguru import logger
from .base_agent import BaseAgent
from .prompts.StartupPrompts import StartupPrompts
from com.jd.genie.agent.llm.LLMService import llm_service


class BusinessCanvasAgent(BaseAgent):
    """商业模式画布智能体"""
    
    def __init__(self):
        super().__init__(
            name="business_canvas_agent",
            description="商业模式画布智能体，用于生成和分析商业模式画布"
        )
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行商业模式画布分析 - 使用LLM进行真正的AI分析"""
        try:
            business_idea = parameters.get("business_idea", "")
            
            if not business_idea:
                return {
                    "success": False,
                    "error": "business_idea parameter is required"
                }
            
            logger.info(f"开始LLM商业画布分析: {business_idea[:100]}...")
            
            # 使用LLM生成商业模式画布
            canvas = await self._generate_business_canvas_with_llm(business_idea)
            
            return {
                "success": True,
                "result": canvas,
                "tool": "business_canvas"
            }
            
        except Exception as e:
            logger.error(f"BusinessCanvasAgent execution error: {e}")
            return {
                "success": False,
                "error": str(e)
            }

    async def execute_stream(self, parameters: Dict[str, Any]):
        """执行商业模式画布分析 - 流式版本"""
        try:
            business_idea = parameters.get("business_idea", "")
            
            if not business_idea:
                yield {
                    "type": "error",
                    "error": "business_idea parameter is required"
                }
                return
            
            logger.info(f"开始流式LLM商业画布分析: {business_idea[:100]}...")
            
            # 发送开始事件
            yield {
                "type": "start",
                "message": "开始商业画布分析...",
                "agent": self.name
            }
            
            # 使用流式LLM进行商业画布分析
            async for chunk in self._generate_business_canvas_with_llm_stream(business_idea):
                yield chunk
            
        except Exception as e:
            logger.error(f"BusinessCanvasAgent stream execution error: {e}")
            yield {
                "type": "error",
                "error": str(e),
                "agent": self.name
            }
    
    async def _generate_business_canvas_with_llm(self, business_idea: str) -> Dict[str, Any]:
        """使用LLM生成商业模式画布"""
        try:
            # 构建Prompt
            system_prompt = StartupPrompts.BUSINESS_CANVAS_SYSTEM
            user_prompt = StartupPrompts.BUSINESS_CANVAS_USER.format(
                business_idea=business_idea
            )
            
            # 调用LLM
            response = await llm_service.generate_response(
                prompt=user_prompt,
                system_prompt=system_prompt,
                temperature=0.7,
                max_tokens=3000
            )
            
            logger.info(f"LLM商业画布响应: {response[:200]}...")
            
            # 由于提示词已改为直接输出格式化文本，直接返回响应
            return {"formatted_content": response}
                
        except Exception as e:
            logger.error(f"LLM商业画布分析失败: {e}, 使用备用分析方法")
            return self._fallback_canvas_analysis(business_idea)

    async def _generate_business_canvas_with_llm_stream(self, business_idea: str):
        """使用LLM进行流式商业画布分析"""
        try:
            # 构建Prompt
            system_prompt = StartupPrompts.BUSINESS_CANVAS_SYSTEM
            user_prompt = StartupPrompts.BUSINESS_CANVAS_USER.format(
                business_idea=business_idea
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
            
            logger.info(f"LLM商业画布流式响应完成，总共{chunk_count}个chunks，{len(full_response)}字符")
            
            # 发送流式完成事件
            yield {
                "type": "stream_complete",
                "message": f"商业画布分析完成，共生成 {len(full_response)} 字符",
                "total_chunks": chunk_count,
                "final_content": full_response
            }
            
            # 发送完成事件
            yield {
                "type": "complete",
                "message": "商业画布分析流程完成",
                "total_chunks": chunk_count,
                "response_length": len(full_response)
            }
                
        except Exception as e:
            logger.error(f"LLM流式商业画布分析失败: {e}")
            # 使用备用分析
            yield {
                "type": "progress",
                "message": "AI服务异常，使用备用分析方法...",
                "stage": "fallback"
            }
            
            fallback_result = self._fallback_canvas_analysis(business_idea)
            yield {
                "type": "result",
                "data": fallback_result,
                "message": "商业画布分析完成（使用备用方法）"
            }
            
            yield {
                "type": "complete",
                "message": "商业画布分析流程完成（备用模式）",
                "fallback": True
            }
    
    def _parse_canvas_response(self, response: str) -> Dict[str, Any]:
        """解析商业画布响应"""
        canvas_elements = [
            "key_partners", "key_activities", "key_resources", "value_propositions",
            "customer_relationships", "channels", "customer_segments", 
            "cost_structure", "revenue_streams"
        ]
        
        result = {}
        for element in canvas_elements:
            result[element] = self._extract_canvas_items(response, element)
        
        return result
    
    def _extract_canvas_items(self, response: str, element: str) -> list:
        """提取商业画布项目"""
        # 中英文关键词映射
        keywords_map = {
            "key_partners": ["关键合作伙伴", "合作伙伴", "Key Partners"],
            "key_activities": ["关键业务", "核心活动", "Key Activities"],
            "key_resources": ["核心资源", "关键资源", "Key Resources"],
            "value_propositions": ["价值主张", "Value Propositions"],
            "customer_relationships": ["客户关系", "Customer Relationships"],
            "channels": ["渠道通路", "销售渠道", "Channels"],
            "customer_segments": ["客户细分", "目标客户", "Customer Segments"],
            "cost_structure": ["成本结构", "Cost Structure"],
            "revenue_streams": ["收入来源", "Revenue Streams"]
        }
        
        keywords = keywords_map.get(element, [element])
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
                elif not line.strip() or any(kw in line for kw in ["关键", "核心", "价值", "客户", "渠道", "成本", "收入"]):
                    if items:
                        break
        
        return items[:5] if items else [f"基于{element}的分析要点"]
    
    def _fallback_canvas_analysis(self, business_idea: str) -> Dict[str, Any]:
        """备用商业画布分析"""
        return {
            "key_partners": [
                "技术供应商和服务提供商",
                "渠道合作伙伴和分销商",
                "战略联盟伙伴",
                "投资机构和金融合作伙伴"
            ],
            "key_activities": [
                "产品研发和技术创新",
                "市场营销和品牌推广",
                "客户服务和支持",
                "运营管理和质量控制"
            ],
            "key_resources": [
                "专业技术团队和人才",
                "核心技术和知识产权",
                "品牌资产和市场声誉",
                "资金资源和融资能力"
            ],
            "value_propositions": [
                "解决用户核心痛点和需求",
                "提供便利高效的服务体验",
                "降低用户成本和时间投入",
                "提升用户工作和生活效率"
            ],
            "customer_relationships": [
                "个性化服务和定制化体验",
                "用户社区建设和互动",
                "专业客户支持和咨询",
                "持续的用户反馈和改进"
            ],
            "channels": [
                "线上平台和官方网站",
                "移动应用和小程序",
                "社交媒体和内容营销",
                "合作渠道和第三方平台"
            ],
            "customer_segments": [
                "核心目标用户群体",
                "潜在扩展用户群体",
                "企业级客户",
                "个人消费者用户"
            ],
            "cost_structure": [
                "人力资源和团队成本",
                "技术开发和研发投入",
                "市场营销和推广费用",
                "运营维护和基础设施成本"
            ],
            "revenue_streams": [
                "产品销售和授权收入",
                "服务费和咨询收入",
                "广告和推广收入",
                "订阅费和会员收入"
            ]
        }