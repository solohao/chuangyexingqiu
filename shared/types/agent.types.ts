/**
 * 智能体相关类型定义
 */

// 基础智能体通信接口
export interface AgentRequest {
  agentName: string;
  params: Record<string, any>;
  sessionId?: string;
}

export interface AgentResponse {
  success: boolean;
  data: any;
  message?: string;
  sessionId?: string;
}

// 智能体状态枚举
export type AgentStatus = 'available' | 'busy' | 'offline' | 'error';

// 智能体类型枚举 - 基于后端实际智能体
export type AgentType = 
  | 'business_canvas_agent'
  | 'swot_analysis_agent'
  | 'policy_matching_agent'
  | 'incubator_agent'
  | 'market_research_agent'
  | 'tech_stack_agent'
  | 'financial_model_agent'
  | 'react'
  | 'plan_executor';

// 智能体分类
export interface AgentCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

// 智能体信息
export interface AgentInfo {
  id: string;
  name: string;
  type: AgentType;
  category: AgentCategory;
  description: string;
  capabilities: string[];
  status: AgentStatus;
  averageResponseTime: number; // 毫秒
  successRate: number; // 0-1
  userRating: number; // 0-5
  usageCount: number;
  lastUsed?: Date;
  isRecommended: boolean;
  isPopular: boolean;
  tags: string[];
  examples: string[];
}

// 智能体配置
export interface AgentConfig {
  id: string;
  enabled: boolean;
  priority: number; // 1-10, 10最高
  timeout: number; // 毫秒
  retryCount: number;
  parameters: Record<string, any>;
}

// 智能体注册表接口
export interface AgentRegistry {
  agents: Map<string, AgentInfo>;
  categories: AgentCategory[];
  configs: Map<string, AgentConfig>;
  getAgentsByCategory(categoryId: string): AgentInfo[];
  getAgentsByType(type: AgentType): AgentInfo[];
  getAvailableAgents(): AgentInfo[];
  getRecommendedAgents(context?: ProjectContext): AgentInfo[];
  updateAgentStatus(agentId: string, status: AgentStatus): void;
  updateAgentMetrics(agentId: string, metrics: Partial<AgentMetrics>): void;
}

// 智能体性能指标
export interface AgentMetrics {
  responseTime: number;
  successRate: number;
  userRating: number;
  usageCount: number;
  lastUsed: Date;
}

// 项目上下文（用于推荐）
export interface ProjectContext {
  projectId: string;
  projectType: string;
  industry: string;
  stage: string;
  userPreferences: UserPreferences;
  recentAgentUsage: string[];
}

// 用户偏好
export interface UserPreferences {
  preferredAgents: string[];
  agentPriorities: Record<string, number>;
  workflowPreferences: Record<string, any>;
  notificationSettings: NotificationSettings;
}

// 通知设置
export interface NotificationSettings {
  enableAgentStatusUpdates: boolean;
  enableWorkflowProgress: boolean;
  enableRecommendations: boolean;
}

export interface BusinessCanvasData {
  customerSegments?: string;
  valuePropositions?: string;
  channels?: string;
  customerRelationships?: string;
  revenueStreams?: string;
  keyResources?: string;
  keyActivities?: string;
  keyPartnerships?: string;
  costStructure?: string;
}

export interface SWOTAnalysisData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface PolicyMatchingRequest {
  projectType: string;
  industry: string;
  location: string;
  teamSize: number;
  fundingStage: string;
}

export interface PolicyRecommendation {
  policyName: string;
  description: string;
  eligibility: string[];
  benefits: string;
  applicationDeadline?: string;
  matchScore: number;
}