// 智能体交互的React Hook

import { useState, useCallback, useEffect } from 'react';
import '../types/message';
import type { AgentInteractionState, AgentInfo, AgentMode } from '../types/agents';
import { agentService } from '../services/agentService';

/**
 * 智能体交互状态管理Hook
 */
export const useAgentInteraction = (initialSessionId?: string) => {
  const [state, setState] = useState<AgentInteractionState>({
    mode: 'orchestrated',
    selectedAgentId: undefined,
    showAgentMenu: false,
    showWorkflowVisualization: false,
    expandedWorkflowView: false
  });

  const [sessionId] = useState(() => 
    initialSessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // 切换智能体交互模式
  const switchMode = useCallback((mode: AgentMode) => {
    setState(prev => ({
      ...prev,
      mode,
      selectedAgentId: mode === 'orchestrated' ? undefined : prev.selectedAgentId
    }));
  }, []);

  // 选择智能体（直接模式）
  const selectAgent = useCallback((agentId: string) => {
    setState(prev => ({
      ...prev,
      selectedAgentId: agentId,
      mode: 'direct',
      showAgentMenu: false
    }));
  }, []);

  // 返回编排模式
  const returnToOrchestrator = useCallback(() => {
    setState(prev => ({
      ...prev,
      mode: 'orchestrated',
      selectedAgentId: undefined
    }));
  }, []);

  // 切换智能体菜单显示
  const toggleAgentMenu = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAgentMenu: !prev.showAgentMenu
    }));
  }, []);

  // 切换工作流可视化
  const toggleWorkflowVisualization = useCallback(() => {
    setState(prev => ({
      ...prev,
      showWorkflowVisualization: !prev.showWorkflowVisualization
    }));
  }, []);

  // 切换工作流详细视图
  const toggleExpandedWorkflowView = useCallback(() => {
    setState(prev => ({
      ...prev,
      expandedWorkflowView: !prev.expandedWorkflowView
    }));
  }, []);

  // 创建智能体请求
  const createRequest = useCallback((query: string, projectId?: string): MESSAGE.AgentRequest => {
    return agentService.createAgentRequest(query, {
      agentId: state.selectedAgentId,
      sessionId,
      projectId,
      mode: state.mode
    });
  }, [state.mode, state.selectedAgentId, sessionId]);

  // 分析意图并获取推荐
  const analyzeIntent = useCallback((query: string) => {
    return agentService.analyzeIntentAndRecommendAgents(query);
  }, []);

  // 获取当前选中的智能体信息
  const selectedAgent = state.selectedAgentId 
    ? agentService.getAgentById(state.selectedAgentId)
    : undefined;

  // 获取所有智能体
  const allAgents = agentService.getAllAgents();
  
  // 获取智能体分类
  const categories = agentService.getCategories();

  // 获取推荐智能体
  const recommendedAgents = agentService.getRecommendedAgents();

  return {
    // 状态
    state,
    sessionId,
    selectedAgent,
    allAgents,
    categories,
    recommendedAgents,

    // 操作方法
    switchMode,
    selectAgent,
    returnToOrchestrator,
    toggleAgentMenu,
    toggleWorkflowVisualization,
    toggleExpandedWorkflowView,
    createRequest,
    analyzeIntent,

    // 便捷方法
    isOrchestratedMode: state.mode === 'orchestrated',
    isDirectMode: state.mode === 'direct',
    hasSelectedAgent: !!state.selectedAgentId,
    isAgentMenuVisible: state.showAgentMenu,
    isWorkflowVisible: state.showWorkflowVisualization,
    isExpandedView: state.expandedWorkflowView
  };
};