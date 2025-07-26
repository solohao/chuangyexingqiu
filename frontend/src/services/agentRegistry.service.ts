/**
 * 智能体注册表服务
 * 管理智能体信息、状态、配置和推荐
 */

import type { 
  AgentRegistry as IAgentRegistry,
  AgentInfo as SharedAgentInfo,
  AgentCategory,
  AgentStatus,
  AgentType,
  AgentConfig,
  AgentMetrics,
  ProjectContext,
  UserPreferences
} from '../../../shared/types/agent.types';

import { AVAILABLE_AGENTS, AGENT_CATEGORIES, type AgentInfo } from '../types/agents';

/**
 * 智能体注册表实现类
 */
export class AgentRegistryService implements IAgentRegistry {
  private static instance: AgentRegistryService;
  
  public agents: Map<string, SharedAgentInfo>;
  public categories: AgentCategory[];
  public configs: Map<string, AgentConfig>;
  
  private userPreferences: UserPreferences | null = null;
  private projectContext: ProjectContext | null = null;

  private constructor() {
    this.agents = new Map();
    this.categories = [...AGENT_CATEGORIES];
    this.configs = new Map();
    
    // 初始化智能体数据
    this.initializeAgents();
    this.initializeConfigs();
  }

  public static getInstance(): AgentRegistryService {
    if (!AgentRegistryService.instance) {
      AgentRegistryService.instance = new AgentRegistryService();
    }
    return AgentRegistryService.instance;
  }

  /**
   * 初始化智能体数据
   */
  private initializeAgents(): void {
    AVAILABLE_AGENTS.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  /**
   * 初始化智能体配置
   */
  private initializeConfigs(): void {
    AVAILABLE_AGENTS.forEach(agent => {
      const config: AgentConfig = {
        id: agent.id,
        enabled: true,
        priority: agent.isRecommended ? 8 : 5,
        timeout: 30000, // 30秒
        retryCount: 3,
        parameters: {}
      };
      this.configs.set(agent.id, config);
    });
  }

  /**
   * 根据分类获取智能体
   */
  getAgentsByCategory(categoryId: string): SharedAgentInfo[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.category.id === categoryId)
      .sort((a, b) => {
        // 按推荐、热门、使用次数排序
        if (a.isRecommended !== b.isRecommended) {
          return a.isRecommended ? -1 : 1;
        }
        if (a.isPopular !== b.isPopular) {
          return a.isPopular ? -1 : 1;
        }
        return b.usageCount - a.usageCount;
      });
  }

  /**
   * 根据类型获取智能体
   */
  getAgentsByType(type: AgentType): SharedAgentInfo[] {
    return Array.from(this.agents.values())
      .filter(agent => agent.type === type);
  }

  /**
   * 获取可用智能体
   */
  getAvailableAgents(): SharedAgentInfo[] {
    return Array.from(this.agents.values())
      .filter(agent => {
        const config = this.configs.get(agent.id);
        return agent.status === 'available' && config?.enabled !== false;
      });
  }

  /**
   * 获取推荐智能体
   */
  getRecommendedAgents(context?: ProjectContext): SharedAgentInfo[] {
    if (context) {
      this.projectContext = context;
    }

    const availableAgents = this.getAvailableAgents();
    
    // 基于项目上下文的推荐逻辑
    if (this.projectContext) {
      return this.getContextBasedRecommendations(availableAgents);
    }

    // 默认推荐：推荐标记的智能体 + 热门智能体
    return availableAgents
      .filter(agent => agent.isRecommended || agent.isPopular)
      .sort((a, b) => {
        if (a.isRecommended !== b.isRecommended) {
          return a.isRecommended ? -1 : 1;
        }
        return b.userRating - a.userRating;
      })
      .slice(0, 6); // 最多返回6个推荐
  }

  /**
   * 基于上下文的推荐
   */
  private getContextBasedRecommendations(agents: AgentInfo[]): AgentInfo[] {
    if (!this.projectContext) return agents.slice(0, 6);

    const { projectType, industry, stage, recentAgentUsage } = this.projectContext;
    
    // 评分系统
    const scoredAgents = agents.map(agent => {
      let score = agent.userRating; // 基础评分

      // 项目类型匹配
      if (projectType === 'saas' && agent.type === 'tech-development') score += 2;
      if (projectType === 'ecommerce' && agent.type === 'market-analysis') score += 2;
      if (projectType === 'fintech' && agent.type === 'finance-analysis') score += 2;

      // 行业匹配
      if (industry === 'technology' && agent.type === 'tech-development') score += 1.5;
      if (industry === 'finance' && agent.type === 'finance-analysis') score += 1.5;

      // 项目阶段匹配
      if (stage === 'idea' && agent.id === 'business_canvas_agent') score += 2;
      if (stage === 'mvp' && agent.type === 'tech-development') score += 1.5;
      if (stage === 'growth' && agent.type === 'market-analysis') score += 1.5;

      // 最近使用历史
      if (recentAgentUsage.includes(agent.id)) score += 1;

      // 推荐和热门加分
      if (agent.isRecommended) score += 1;
      if (agent.isPopular) score += 0.5;

      return { agent, score };
    });

    return scoredAgents
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.agent);
  }

  /**
   * 更新智能体状态
   */
  updateAgentStatus(agentId: string, status: AgentStatus): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.isAvailable = status === 'available';
    }
  }

  /**
   * 更新智能体指标
   */
  updateAgentMetrics(agentId: string, metrics: Partial<AgentMetrics>): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      if (metrics.responseTime !== undefined) {
        // 使用移动平均更新响应时间
        agent.averageResponseTime = (agent.averageResponseTime * 0.8) + (metrics.responseTime * 0.2);
      }
      if (metrics.successRate !== undefined) {
        agent.successRate = metrics.successRate;
      }
      if (metrics.userRating !== undefined) {
        agent.userRating = metrics.userRating;
      }
      if (metrics.usageCount !== undefined) {
        agent.usageCount = metrics.usageCount;
      }
      if (metrics.lastUsed !== undefined) {
        agent.lastUsed = metrics.lastUsed;
      }
    }
  }

  /**
   * 搜索智能体
   */
  searchAgents(query: string): AgentInfo[] {
    const searchTerm = query.toLowerCase();
    return Array.from(this.agents.values())
      .filter(agent => {
        return agent.name.toLowerCase().includes(searchTerm) ||
               agent.description.toLowerCase().includes(searchTerm) ||
               agent.capabilities.some(cap => cap.toLowerCase().includes(searchTerm)) ||
               agent.tags.some(tag => tag.toLowerCase().includes(searchTerm));
      })
      .sort((a, b) => {
        // 优先显示名称匹配的结果
        const aNameMatch = a.name.toLowerCase().includes(searchTerm);
        const bNameMatch = b.name.toLowerCase().includes(searchTerm);
        if (aNameMatch !== bNameMatch) {
          return aNameMatch ? -1 : 1;
        }
        return b.userRating - a.userRating;
      });
  }

  /**
   * 获取智能体详细信息
   */
  getAgentById(agentId: string): AgentInfo | undefined {
    return this.agents.get(agentId);
  }

  /**
   * 获取智能体配置
   */
  getAgentConfig(agentId: string): AgentConfig | undefined {
    return this.configs.get(agentId);
  }

  /**
   * 更新智能体配置
   */
  updateAgentConfig(agentId: string, config: Partial<AgentConfig>): void {
    const existingConfig = this.configs.get(agentId);
    if (existingConfig) {
      this.configs.set(agentId, { ...existingConfig, ...config });
    }
  }

  /**
   * 设置用户偏好
   */
  setUserPreferences(preferences: UserPreferences): void {
    this.userPreferences = preferences;
  }

  /**
   * 设置项目上下文
   */
  setProjectContext(context: ProjectContext): void {
    this.projectContext = context;
  }

  /**
   * 获取智能体统计信息
   */
  getAgentStats(): {
    totalAgents: number;
    availableAgents: number;
    categoryCounts: Record<string, number>;
    averageResponseTime: number;
    averageSuccessRate: number;
  } {
    const agents = Array.from(this.agents.values());
    const availableAgents = this.getAvailableAgents();
    
    const categoryCounts: Record<string, number> = {};
    agents.forEach(agent => {
      const categoryId = agent.category.id;
      categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
    });

    const totalResponseTime = agents.reduce((sum, agent) => sum + agent.averageResponseTime, 0);
    const totalSuccessRate = agents.reduce((sum, agent) => sum + agent.successRate, 0);

    return {
      totalAgents: agents.length,
      availableAgents: availableAgents.length,
      categoryCounts,
      averageResponseTime: totalResponseTime / agents.length,
      averageSuccessRate: totalSuccessRate / agents.length
    };
  }

  /**
   * 记录智能体使用
   */
  recordAgentUsage(agentId: string, responseTime: number, success: boolean): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      // 更新使用次数
      agent.usageCount += 1;
      agent.lastUsed = new Date();

      // 更新响应时间（移动平均）
      agent.averageResponseTime = (agent.averageResponseTime * 0.9) + (responseTime * 0.1);

      // 更新成功率（移动平均）
      const currentSuccessRate = success ? 1 : 0;
      agent.successRate = (agent.successRate * 0.9) + (currentSuccessRate * 0.1);

      // 更新热门状态（基于使用次数）
      const avgUsage = Array.from(this.agents.values())
        .reduce((sum, a) => sum + a.usageCount, 0) / this.agents.size;
      agent.isPopular = agent.usageCount > avgUsage * 1.5;
    }
  }
}

// 导出单例实例
export const agentRegistry = AgentRegistryService.getInstance();