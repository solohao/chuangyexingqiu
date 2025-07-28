#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
智能体工厂类
创业星球专用智能体工厂
"""

from typing import Dict, Type, Optional
from .base_agent import BaseAgent
from .RequirementAnalysisAgent import RequirementAnalysisAgent
from .PolicyMatchingAgent import PolicyMatchingAgent
from .IncubatorAgent import IncubatorAgent
from .SWOTAnalysisAgent import SWOTAnalysisAgent
from .BusinessCanvasAgent import BusinessCanvasAgent


class AgentFactory:
    """智能体工厂类"""
    
    # 注册的智能体类型
    _agents: Dict[str, Type[BaseAgent]] = {
        "requirement_analysis": RequirementAnalysisAgent,
        "policy_matching": PolicyMatchingAgent,
        "incubator_recommendation": IncubatorAgent,
        "swot_analysis": SWOTAnalysisAgent,
        "business_canvas": BusinessCanvasAgent,
    }
    
    @classmethod
    def create_agent(cls, agent_type: str) -> Optional[BaseAgent]:
        """创建智能体实例"""
        agent_class = cls._agents.get(agent_type)
        if agent_class:
            return agent_class()
        return None
    
    @classmethod
    def get_available_agents(cls) -> Dict[str, str]:
        """获取可用的智能体列表"""
        return {
            agent_type: agent_class().description 
            for agent_type, agent_class in cls._agents.items()
        }
    
    @classmethod
    def register_agent(cls, agent_type: str, agent_class: Type[BaseAgent]):
        """注册新的智能体类型"""
        cls._agents[agent_type] = agent_class