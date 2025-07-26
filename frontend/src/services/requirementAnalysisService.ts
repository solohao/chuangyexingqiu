import { backendApiService } from './backendApi.service';

/**
 * 需求分析结果接口
 */
export interface RequirementAnalysisResult {
  query: string;
  intent?: {
    mainGoal: string;
    businessDomain: string;
    urgency: string;
    expectedOutput: string;
    confidence: number;
  };
  complexity?: {
    level: 'simple' | 'medium' | 'complex';
    taskCount: string;
    expertiseRequired: string;
    agentCount: string;
    estimatedTime: string;
    reasoning: string;
  };
  clarity?: {
    score: number;
    level: string;
    clearAspects: string[];
    unclearAspects: string[];
    needsClarification: boolean;
  };
  suggestions?: {
    questions: Array<{
      category: string;
      question: string;
      purpose: string;
    }>;
    priority: string;
  };
  recommendedAgents?: string[];
  nextSteps?: string[];
}

/**
 * 分析类型
 */
export type AnalysisType = 'intent' | 'complexity' | 'clarity' | 'suggestion' | 'full';

/**
 * 需求分析服务
 */
export class RequirementAnalysisService {
  
  /**
   * 分析用户需求
   */
  async analyzeRequirement(
    query: string, 
    analysisType: AnalysisType = 'full'
  ): Promise<RequirementAnalysisResult> {
    try {
      const response = await backendApiService.callAgent({
        agentName: 'requirement_analysis_agent',
        parameters: {
          query,
          analysisType
        }
      });

      // 解析返回的JSON结果
      if (typeof response.result === 'string') {
        return JSON.parse(response.result);
      }
      
      return response.result as RequirementAnalysisResult;
    } catch (error) {
      console.error('需求分析失败:', error);
      throw new Error('需求分析服务暂时不可用，请稍后重试');
    }
  }

  /**
   * 意图识别
   */
  async analyzeIntent(query: string) {
    const result = await this.analyzeRequirement(query, 'intent');
    return result.intent;
  }

  /**
   * 复杂度评估
   */
  async analyzeComplexity(query: string) {
    const result = await this.analyzeRequirement(query, 'complexity');
    return result.complexity;
  }

  /**
   * 明确度检测
   */
  async analyzeClarity(query: string) {
    const result = await this.analyzeRequirement(query, 'clarity');
    return result.clarity;
  }

  /**
   * 生成澄清建议
   */
  async generateClarificationSuggestions(query: string) {
    const result = await this.analyzeRequirement(query, 'suggestion');
    return result.suggestions;
  }

  /**
   * 基于需求推荐智能体
   */
  async recommendAgents(query: string): Promise<string[]> {
    const result = await this.analyzeRequirement(query, 'full');
    return result.recommendedAgents || [];
  }

  /**
   * 检查需求是否需要澄清
   */
  async needsClarification(query: string): Promise<boolean> {
    const clarity = await this.analyzeClarity(query);
    return clarity?.needsClarification || false;
  }

  /**
   * 获取需求复杂度等级
   */
  async getComplexityLevel(query: string): Promise<'simple' | 'medium' | 'complex'> {
    const complexity = await this.analyzeComplexity(query);
    return complexity?.level || 'medium';
  }
}

// 导出单例实例
export const requirementAnalysisService = new RequirementAnalysisService();