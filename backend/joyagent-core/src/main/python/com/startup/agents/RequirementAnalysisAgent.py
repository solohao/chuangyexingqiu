#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
需求分析智能体
基于LangGraph的重构版本，原生支持工作流和独立执行
"""

import json
from typing import Dict, Any, Optional
from loguru import logger

from .LangGraphAgent import LangGraphAgent

# 避免循环导入
from typing import TYPE_CHECKING
if TYPE_CHECKING:
    from .workflow.ConversationState import ConversationState
else:
    ConversationState = dict
from .prompts.StartupPrompts import StartupPrompts
from com.jd.genie.agent.llm.LLMService import llm_service


class RequirementAnalysisAgent(LangGraphAgent):
    """需求分析智能体"""
    
    def __init__(self):
        super().__init__(
            name="requirement_analysis_agent",
            description="需求分析智能体，专门用于分析创业项目的需求和可行性"
        )
    
    # ==================== LangGraph接口实现 ====================
    
    def extract_parameters_from_state(self, state: ConversationState) -> Dict[str, Any]:
        """从对话状态中提取参数"""
        # 基础项目描述
        project_description = state.get("project_description", "") or state.get("user_message", "")
        
        # 如果有项目类型，添加到描述中
        if state.get("project_type"):
            project_description += f"\n项目类型: {state['project_type']}"
        
        # 如果有用户查询，添加到描述中
        if state.get("user_query") and state.get("user_query") != project_description:
            project_description += f"\n用户需求: {state['user_query']}"
        
        # 检查是否有其他智能体的结果可以作为参考
        analysis_results = state.get("analysis_results", {})
        context_info = []
        
        if "swot_analysis" in analysis_results:
            context_info.append("参考SWOT分析结果进行更深入的需求分析")
        
        if "business_canvas" in analysis_results:
            context_info.append("参考商业模式画布进行需求细化")
        
        parameters = {
            "project_description": project_description,
            "analysis_type": "comprehensive"
        }
        
        if context_info:
            parameters["context_info"] = "\n".join(context_info)
        
        return parameters
    
    def update_state_with_result(self, state: ConversationState, result: Dict[str, Any]) -> ConversationState:
        """使用分析结果更新对话状态"""
        from .workflow.ConversationState import add_agent_result, add_to_conversation_history, update_context_summary
        
        if result.get("success"):
            # 更新智能体结果
            state = add_agent_result(state, self.name, result.get("result", {}))
            
            # 添加到对话历史
            content = "需求分析完成"
            if result.get("result") and isinstance(result["result"], dict):
                if "content" in result["result"]:
                    content = result["result"]["content"][:200] + "..."
                elif "project_overview" in result["result"]:
                    overview = result["result"]["project_overview"]
                    if isinstance(overview, dict):
                        content = f"需求分析完成 - {overview.get('description', '')[:100]}..."
            
            state = add_to_conversation_history(
                state, 
                "assistant", 
                content, 
                self.name,
                {"analysis_type": "requirement", "success": True}
            )
            
            # 更新上下文摘要
            state = update_context_summary(state, self.name, result)
            
            logger.info("需求分析结果已更新到对话状态")
        else:
            # 处理错误情况
            error_msg = f"需求分析失败: {result.get('error', '未知错误')}"
            
            state = add_to_conversation_history(
                state,
                "assistant", 
                error_msg,
                self.name,
                {"analysis_type": "requirement", "success": False, "error": True}
            )
            
            logger.error(error_msg)
        
        # 更新当前智能体和时间戳
        state["current_agent"] = self.name
        state["updated_at"] = self._get_current_timestamp()
        
        return state
    
    # ==================== 核心执行逻辑 ====================
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行需求分析"""
        self.log_execution_start("标准模式")
        
        try:
            project_description = parameters.get("project_description", "")
            analysis_type = parameters.get("analysis_type", "comprehensive")
            
            if not project_description:
                return self.create_error_result("project_description parameter is required")
            
            logger.info(f"开始LLM需求分析: {project_description[:100]}...")
            
            # 使用LLM进行需求分析
            analysis_result = await self._analyze_requirements_with_llm(project_description, analysis_type)
            
            self.log_execution_complete("标准模式", True)
            return self.create_success_result(analysis_result, "需求分析完成")
            
        except Exception as e:
            logger.error(f"RequirementAnalysisAgent execution error: {e}")
            self.log_execution_complete("标准模式", False)
            return self.create_error_result(str(e))
    
    async def execute_stream(self, parameters: Dict[str, Any]):
        """执行需求分析 - 流式版本"""
        self.log_execution_start("流式模式")
        
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
            
            # 构建提示词
            system_prompt = StartupPrompts.REQUIREMENT_ANALYSIS_SYSTEM
            user_prompt = StartupPrompts.REQUIREMENT_ANALYSIS_USER.format(
                project_description=project_description,
                analysis_type=analysis_type
            )
            
            # 使用通用流式组件
            async for chunk in self.execute_stream_with_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                agent_name="需求分析",
                temperature=0.7,
                max_tokens=3000,
                project_description=project_description,
                analysis_type=analysis_type
            ):
                yield chunk
            
            self.log_execution_complete("流式模式", True)
            
        except Exception as e:
            logger.error(f"RequirementAnalysisAgent stream execution error: {e}")
            self.log_execution_complete("流式模式", False)
            yield {
                "type": "error",
                "error": str(e),
                "agent": self.name
            }
    
    # ==================== 内部方法 ====================
    
    async def _get_fallback_result(self, **kwargs):
        """获取备用分析结果（供StreamingAgentMixin使用）"""
        project_description = kwargs.get("project_description", "")
        analysis_type = kwargs.get("analysis_type", "comprehensive")
        return await self._fallback_analysis(project_description, analysis_type)
    
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
    
    # ==================== 便捷方法 ====================
    
    def get_analysis_summary(self) -> str:
        """获取分析结果摘要"""
        if not self.has_context():
            return "无分析结果"
        
        analysis_results = self.get_previous_analysis_results()
        if "requirement_analysis" not in analysis_results:
            return "需求分析未完成"
        
        result = analysis_results["requirement_analysis"]
        if not isinstance(result, dict):
            return "需求分析结果格式错误"
        
        # 提取项目概览
        if "project_overview" in result:
            overview = result["project_overview"]
            if isinstance(overview, dict):
                description = overview.get("description", "")
                category = overview.get("category", "")
                complexity = overview.get("complexity", "")
                return f"项目: {description[:100]}... | 类别: {category} | 复杂度: {complexity}"
        
        return "需求分析已完成"