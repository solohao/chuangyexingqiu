// 智能体服务 - 基于现有后端API的封装

import '../types/message';
import { agentRegistry } from './agentRegistry.service';
import { backendApiService } from './backendApi.service';
import type { AgentInfo, AgentCategory, AgentType } from '../types/agents';
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
    // 使用后端API进行意图分析
    const analysis = backendApiService.analyzeIntentAndRecommendAgents(query, context);
    
    // 将AgentType转换为AgentInfo
    const recommendedAgents = analysis.recommendedAgents
      .map(agentType => this.getAgentById(agentType))
      .filter((agent): agent is AgentInfo => agent !== undefined);

    return {
      intent: analysis.intent,
      confidence: analysis.confidence,
      recommendedAgents,
      reasoning: analysis.reasoning
    };
  }

  /**
   * 执行多智能体工作流
   */
  async executeWorkflow(
    task: string,
    agentTypes: string[],
    context?: ProjectContext
  ) {
    const requestId = this.generateRequestId();
    
    return await backendApiService.executeWorkflow({
      task,
      agentTypes: agentTypes as any[],
      projectContext: context,
      requestId,
      stream: false
    });
  }

  /**
   * 调用单个智能体
   */
  async callAgent(
    agentId: string,
    task: string,
    context?: ProjectContext
  ) {
    const requestId = this.generateRequestId();
    const analysisRequest = {
      task,
      projectContext: context,
      requestId
    };

    switch (agentId) {
      case 'business_canvas_agent':
        return await backendApiService.analyzeBusinessCanvas(analysisRequest);
      case 'swot_analysis_agent':
        return await backendApiService.performSWOTAnalysis(analysisRequest);
      case 'policy_matching_agent':
        return await backendApiService.matchPolicies(analysisRequest);
      case 'incubator_agent':
        return await backendApiService.recommendIncubators(analysisRequest);
      default:
        throw new Error(`不支持的智能体: ${agentId}`);
    }
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