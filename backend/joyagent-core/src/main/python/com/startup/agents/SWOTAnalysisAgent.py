#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SWOT分析智能体
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


class SWOTAnalysisAgent(LangGraphAgent):
    """SWOT分析智能体"""
    
    def __init__(self):
        super().__init__(
            name="swot_analysis_agent",
            description="SWOT分析智能体，用于进行优势、劣势、机会、威胁分析"
        )
    
    # ==================== LangGraph接口实现 ====================
    
    def extract_parameters_from_state(self, state: ConversationState) -> Dict[str, Any]:
        """从对话状态中提取参数"""
        from .workflow.ConversationState import build_context_for_agent, get_relevant_context_for_agent
        
        # 使用增强的上下文构建方法
        project_info = build_context_for_agent(state, self.name)
        
        # 获取相关上下文
        relevant_context = get_relevant_context_for_agent(state, self.name)
        
        return {
            "project_info": project_info,
            "relevant_context": relevant_context
        }
    
    def update_state_with_result(self, state: ConversationState, result: Dict[str, Any]) -> ConversationState:
        """使用分析结果更新对话状态"""
        from .workflow.ConversationState import add_agent_result, add_to_conversation_history, update_context_summary
        
        if result.get("success"):
            # 更新智能体结果
            state = add_agent_result(state, self.name, result.get("result", {}))
            
            # 添加到对话历史 - 修复内容截断问题
            content = "SWOT分析完成"
            
            # 优先使用完整的分析内容，而不是截断的摘要
            if result.get("content"):
                # 直接使用完整内容
                content = result["content"]
            elif result.get("result") and isinstance(result["result"], dict):
                if "formatted_content" in result["result"]:
                    # 使用完整的格式化内容，不要截断
                    content = result["result"]["formatted_content"]
                elif "content" in result["result"]:
                    content = result["result"]["content"]
            
            logger.info(f"[{self.name}] 准备添加到对话历史的内容长度: {len(content)}")
            
            state = add_to_conversation_history(
                state, 
                "assistant", 
                content, 
                self.name,
                {"analysis_type": "swot", "success": True}
            )
            
            # 更新上下文摘要
            state = update_context_summary(state, self.name, result)
            
            logger.info("SWOT分析结果已更新到对话状态")
        else:
            # 处理错误情况
            error_msg = f"SWOT分析失败: {result.get('error', '未知错误')}"
            
            state = add_to_conversation_history(
                state,
                "assistant", 
                error_msg,
                self.name,
                {"analysis_type": "swot", "success": False, "error": True}
            )
            
            logger.error(error_msg)
        
        # 更新当前智能体和时间戳
        state["current_agent"] = self.name
        state["updated_at"] = self._get_current_timestamp()
        
        return state
    
    # ==================== 核心执行逻辑 ====================
    
    async def execute(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """执行SWOT分析"""
        self.log_execution_start("标准模式")
        
        try:
            project_info = parameters.get("project_info", "")
            
            if not project_info:
                return self.create_error_result("project_info parameter is required")
            
            logger.info(f"开始LLM SWOT分析: {project_info[:100]}...")
            
            # 使用LLM进行SWOT分析
            swot_analysis = await self._perform_swot_analysis_with_llm(project_info)
            
            self.log_execution_complete("标准模式", True)
            return self.create_success_result(swot_analysis, "SWOT分析完成")
            
        except Exception as e:
            logger.error(f"SWOTAnalysisAgent execution error: {e}")
            self.log_execution_complete("标准模式", False)
            return self.create_error_result(str(e))

    async def execute_stream(self, parameters: Dict[str, Any]):
        """执行SWOT分析 - 流式版本"""
        self.log_execution_start("流式模式")
        
        try:
            project_info = parameters.get("project_info", "")
            relevant_context = parameters.get("relevant_context", {})
            
            if not project_info:
                yield {
                    "type": "error",
                    "error": "project_info parameter is required"
                }
                return
            
            logger.info(f"开始流式LLM SWOT分析: {project_info[:100]}...")
            logger.info(f"相关上下文: {relevant_context}")
            
            # 构建增强的提示词
            system_prompt = StartupPrompts.SWOT_ANALYSIS_SYSTEM
            user_prompt = StartupPrompts.SWOT_ANALYSIS_USER.format(
                project_info=project_info
            )
            
            # 使用通用流式组件
            async for chunk in self.execute_stream_with_llm(
                system_prompt=system_prompt,
                user_prompt=user_prompt,
                agent_name="SWOT分析",
                temperature=0.7,
                max_tokens=2000,
                project_info=project_info,
                relevant_context=relevant_context
            ):
                yield chunk
            
            self.log_execution_complete("流式模式", True)
            
        except Exception as e:
            logger.error(f"SWOTAnalysisAgent stream execution error: {e}")
            self.log_execution_complete("流式模式", False)
            yield {
                "type": "error",
                "error": str(e),
                "agent": self.name
            }
    
    # ==================== 内部方法 ====================
    
    async def _get_fallback_result(self, **kwargs):
        """获取备用分析结果（供StreamingAgentMixin使用）"""
        project_info = kwargs.get("project_info", "")
        return self._fallback_swot_analysis(project_info)
    
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
            
            # 由于提示词已改为直接输出格式化文本，直接返回响应
            return {"formatted_content": response}
                
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
    
    # ==================== 便捷方法 ====================
    
    def get_analysis_summary(self) -> str:
        """获取SWOT分析摘要"""
        if not self.has_context():
            return "无SWOT分析结果"
        
        analysis_results = self.get_previous_analysis_results()
        if "swot_analysis" not in analysis_results:
            return "SWOT分析未完成"
        
        swot_result = analysis_results["swot_analysis"]
        
        # 如果是格式化内容，直接返回前200字符
        if "formatted_content" in swot_result:
            content = swot_result["formatted_content"]
            return content[:200] + "..." if len(content) > 200 else content
        
        # 如果是结构化数据，格式化输出摘要
        summary_parts = []
        
        if "strengths" in swot_result and swot_result["strengths"]:
            summary_parts.append(f"优势: {', '.join(swot_result['strengths'][:2])}")
        
        if "opportunities" in swot_result and swot_result["opportunities"]:
            summary_parts.append(f"机会: {', '.join(swot_result['opportunities'][:2])}")
        
        return " | ".join(summary_parts) if summary_parts else "SWOT分析已完成"