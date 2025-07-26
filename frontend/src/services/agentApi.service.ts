/**
 * 智能体API服务
 * 处理与后端智能体系统的通信
 */

import type { 
  AgentRequest,
  AgentResponse,
  BusinessCanvasData,
  SWOTAnalysisData,
  PolicyMatchingRequest,
  PolicyRecommendation
} from '../../../shared/types/agent.types';

import type { AgentInfo } from '../types/agents';

/**
 * 智能体API服务类
 */
export class AgentApiService {
  private static instance: AgentApiService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_SUPABASE_URL || 'http://localhost:8000';
  }

  public static getInstance(): AgentApiService {
    if (!AgentApiService.instance) {
      AgentApiService.instance = new AgentApiService();
    }
    return AgentApiService.instance;
  }

  /**
   * 调用智能体
   */
  async callAgent(request: AgentRequest): Promise<AgentResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/call`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('智能体调用失败:', error);
      throw error;
    }
  }

  /**
   * 获取智能体状态
   */
  async getAgentStatus(agentId: string): Promise<{ status: string; load: number }> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/${agentId}/status`);
      
      if (!response.ok) {
        throw new Error(`获取智能体状态失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取智能体状态失败:', error);
      // 返回默认状态
      return { status: 'available', load: 0 };
    }
  }

  /**
   * 批量获取智能体状态
   */
  async getBatchAgentStatus(agentIds: string[]): Promise<Record<string, { status: string; load: number }>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/batch-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentIds })
      });

      if (!response.ok) {
        throw new Error(`批量获取智能体状态失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('批量获取智能体状态失败:', error);
      // 返回默认状态
      const result: Record<string, { status: string; load: number }> = {};
      agentIds.forEach(id => {
        result[id] = { status: 'available', load: 0 };
      });
      return result;
    }
  }

  /**
   * 商业模式画布智能体调用
   */
  async callBusinessCanvasAgent(params: {
    projectDescription: string;
    industry?: string;
    targetMarket?: string;
  }): Promise<BusinessCanvasData> {
    const request: AgentRequest = {
      agentName: 'business_canvas_agent',
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || '商业模式画布分析失败');
    }

    return response.data as BusinessCanvasData;
  }

  /**
   * SWOT分析智能体调用
   */
  async callSWOTAnalysisAgent(params: {
    projectDescription: string;
    industry?: string;
    competitorInfo?: string;
  }): Promise<SWOTAnalysisData> {
    const request: AgentRequest = {
      agentName: 'swot_analysis_agent',
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || 'SWOT分析失败');
    }

    return response.data as SWOTAnalysisData;
  }

  /**
   * 政策匹配智能体调用
   */
  async callPolicyMatchingAgent(params: PolicyMatchingRequest): Promise<PolicyRecommendation[]> {
    const request: AgentRequest = {
      agentName: 'policy_matching_agent',
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || '政策匹配失败');
    }

    return response.data as PolicyRecommendation[];
  }

  /**
   * 孵化器推荐智能体调用
   */
  async callIncubatorAgent(params: {
    projectType: string;
    industry: string;
    location: string;
    fundingStage: string;
    teamSize: number;
  }): Promise<any[]> {
    const request: AgentRequest = {
      agentName: 'incubator_agent',
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || '孵化器推荐失败');
    }

    return response.data;
  }

  /**
   * 市场研究智能体调用
   */
  async callMarketResearchAgent(params: {
    industry: string;
    targetMarket: string;
    competitorAnalysis?: boolean;
    marketSize?: boolean;
  }): Promise<any> {
    const request: AgentRequest = {
      agentName: 'market_research_agent',
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || '市场研究失败');
    }

    return response.data;
  }

  /**
   * 技术栈推荐智能体调用
   */
  async callTechStackAgent(params: {
    projectType: string;
    requirements: string[];
    scalability?: string;
    budget?: string;
  }): Promise<any> {
    const request: AgentRequest = {
      agentName: 'tech_stack_agent',
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || '技术栈推荐失败');
    }

    return response.data;
  }

  /**
   * 财务建模智能体调用
   */
  async callFinancialModelAgent(params: {
    businessModel: string;
    revenueStreams: string[];
    costs: string[];
    timeframe: number;
  }): Promise<any> {
    const request: AgentRequest = {
      agentName: 'financial_model_agent',
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || '财务建模失败');
    }

    return response.data;
  }

  /**
   * 通用智能体调用
   */
  async callGenericAgent(agentId: string, params: Record<string, any>): Promise<any> {
    const request: AgentRequest = {
      agentName: agentId,
      params,
      sessionId: this.generateSessionId()
    };

    const response = await this.callAgent(request);
    
    if (!response.success) {
      throw new Error(response.message || `智能体 ${agentId} 调用失败`);
    }

    return response.data;
  }

  /**
   * 生成会话ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      return response.ok;
    } catch (error) {
      console.error('健康检查失败:', error);
      return false;
    }
  }

  /**
   * 获取智能体配置
   */
  async getAgentConfigs(): Promise<Record<string, any>> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/configs`);
      
      if (!response.ok) {
        throw new Error(`获取智能体配置失败: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取智能体配置失败:', error);
      return {};
    }
  }

  /**
   * 更新智能体配置
   */
  async updateAgentConfig(agentId: string, config: Record<string, any>): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/agents/${agentId}/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      return response.ok;
    } catch (error) {
      console.error('更新智能体配置失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const agentApiService = AgentApiService.getInstance();