// 智能体服务 - 基于现有后端API的封装

import '../types/message';
import { agentRegistry } from './agentRegistry.service';
import type { AgentInfo, AgentCategory } from '../types/agents';
import type { ProjectContext } from '../../../shared/types/agent.types';

/**
 * 智能体服务类
 * 提供与后端API交互的接口，使用AgentRegistry管理智能体信息
 */
export class AgentService {
  private static instance: AgentService;

  private constructor() {}

  public static getInstance(): AgentService {
    if (!AgentService.instance) {
      AgentService.instance = new AgentService();
    }
    return AgentService.instance;
  }

  /**
   * 获取所有可用智能体
   */
  getAllAgents(): AgentInfo[] {
    return agentRegistry.getAvailableAgents();
  }

  /**
   * 获取所有智能体分类
   */
  getCategories(): AgentCategory[] {
    return agentRegistry.categories;
  }

  /**
   * 根据分类获取智能体
   */
  getAgentsByCategory(categoryId: string): AgentInfo[] {
    return agentRegistry.getAgentsByCategory(categoryId);
  }

  /**
   * 根据ID获取智能体
   */
  getAgentById(agentId: string): AgentInfo | undefined {
    return agentRegistry.getAgentById(agentId);
  }

  /**
   * 根据能力搜索智能体
   */
  searchAgentsByCapability(capability: string): AgentInfo[] {
    return agentRegistry.searchAgents(capability);
  }

  /**
   * 获取推荐智能体（基于项目上下文）
   */
  getRecommendedAgents(context?: ProjectContext): AgentInfo[] {
    return agentRegistry.getRecommendedAgents(context);
  }

  /**
   * 创建智能体请求
   */
  createAgentRequest(
    query: string,
    options: {
      agentId?: string;
      sessionId: string;
      projectId?: string;
      mode: 'orchestrated' | 'direct';
    }
  ): MESSAGE.AgentRequest {
    return {
      query,
      agentId: options.agentId ? parseInt(options.agentId) : 0,
      sessionId: options.sessionId,
      requestId: this.generateRequestId(),
      file: {} as MESSAGE.FileInfo,
      files: [],
      erp: '',
      reAnswer: false,
      token: '',
      extParams: {
        isMultiAgent: options.mode === 'orchestrated'
      },
      type: 'chat',
      commandCode: '',
      multiAgentReAnswer: false,
      traceId: this.generateTraceId(),
      nextMessageKey: '',
      isStream: 'true',
      outputStyle: 'markdown',
      callbackUrl: ''
    };
  }

  /**
   * 分析用户意图并推荐智能体
   */
  analyzeIntentAndRecommendAgents(query: string, context?: ProjectContext): {
    intent: string;
    confidence: number;
    recommendedAgents: AgentInfo[];
    reasoning: string;
  } {
    const queryLower = query.toLowerCase();
    
    // 商业模式相关
    if (queryLower.includes('商业模式') || queryLower.includes('画布') || queryLower.includes('盈利模式')) {
      return {
        intent: 'business_model_analysis',
        confidence: 0.9,
        recommendedAgents: [this.getAgentById('business_canvas_agent')!].filter(Boolean),
        reasoning: '检测到商业模式相关关键词，推荐使用商业模式画布智能体'
      };
    }
    
    // SWOT分析相关
    if (queryLower.includes('swot') || queryLower.includes('优势') || queryLower.includes('劣势') || queryLower.includes('威胁') || queryLower.includes('机会')) {
      return {
        intent: 'swot_analysis',
        confidence: 0.85,
        recommendedAgents: [this.getAgentById('swot_analysis_agent')!].filter(Boolean),
        reasoning: '检测到SWOT分析相关关键词，推荐使用SWOT分析智能体'
      };
    }
    
    // 市场分析相关
    if (queryLower.includes('市场') || queryLower.includes('竞争') || queryLower.includes('调研') || queryLower.includes('用户研究')) {
      return {
        intent: 'market_research',
        confidence: 0.8,
        recommendedAgents: [this.getAgentById('market_research_agent')!].filter(Boolean),
        reasoning: '检测到市场研究相关关键词，推荐使用市场研究智能体'
      };
    }
    
    // 技术相关
    if (queryLower.includes('技术') || queryLower.includes('架构') || queryLower.includes('开发') || queryLower.includes('技术栈')) {
      return {
        intent: 'tech_development',
        confidence: 0.85,
        recommendedAgents: [this.getAgentById('tech_stack_agent')!].filter(Boolean),
        reasoning: '检测到技术开发相关关键词，推荐使用技术栈推荐智能体'
      };
    }
    
    // 财务相关
    if (queryLower.includes('财务') || queryLower.includes('融资') || queryLower.includes('投资') || queryLower.includes('成本')) {
      return {
        intent: 'financial_analysis',
        confidence: 0.8,
        recommendedAgents: [this.getAgentById('financial_model_agent')!].filter(Boolean),
        reasoning: '检测到财务分析相关关键词，推荐使用财务建模智能体'
      };
    }
    
    // 政策相关
    if (queryLower.includes('政策') || queryLower.includes('补贴') || queryLower.includes('扶持') || queryLower.includes('合规')) {
      return {
        intent: 'policy_matching',
        confidence: 0.8,
        recommendedAgents: [this.getAgentById('policy_matching_agent')!].filter(Boolean),
        reasoning: '检测到政策相关关键词，推荐使用政策匹配智能体'
      };
    }
    
    // 孵化器相关
    if (queryLower.includes('孵化器') || queryLower.includes('加速器') || queryLower.includes('孵化')) {
      return {
        intent: 'incubator_recommendation',
        confidence: 0.8,
        recommendedAgents: [this.getAgentById('incubator_agent')!].filter(Boolean),
        reasoning: '检测到孵化器相关关键词，推荐使用孵化器推荐智能体'
      };
    }
    
    // 默认推荐基于上下文的智能体
    return {
      intent: 'general_startup_consultation',
      confidence: 0.6,
      recommendedAgents: this.getRecommendedAgents(context),
      reasoning: '未检测到特定意图，基于项目上下文推荐相关智能体'
    };
  }

  /**
   * 生成请求ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成追踪ID
   */
  private generateTraceId(): string {
    return `trace_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取智能体统计信息
   */
  getAgentStats() {
    return agentRegistry.getAgentStats();
  }

  /**
   * 记录智能体使用情况
   */
  recordAgentUsage(agentId: string, responseTime: number, success: boolean): void {
    agentRegistry.recordAgentUsage(agentId, responseTime, success);
  }

  /**
   * 更新智能体状态
   */
  updateAgentStatus(agentId: string, status: 'available' | 'busy' | 'offline' | 'error'): void {
    agentRegistry.updateAgentStatus(agentId, status);
  }

  /**
   * 设置项目上下文
   */
  setProjectContext(context: ProjectContext): void {
    agentRegistry.setProjectContext(context);
  }
}

// 导出单例实例
export const agentService = AgentService.getInstance();