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
      console.log('开始需求分析:', { query, analysisType });
      
      const response = await backendApiService.analyzeRequirement({
        query,
        project_description: query,
        analysisType: analysisType === 'full' ? 'comprehensive' : analysisType,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      });

      console.log('需求分析原始响应:', response);

      // 检查响应格式
      if (!response.success && response.error) {
        throw new Error(response.error);
      }

      let analysisData = response.data;
      
      // 如果data是字符串，尝试解析JSON
      if (typeof analysisData === 'string') {
        try {
          analysisData = JSON.parse(analysisData);
        } catch (e) {
          console.warn('JSON解析失败，使用原始字符串:', e);
          // 如果解析失败，创建一个基本的分析结果
          analysisData = {
            query,
            intent: {
              mainGoal: query,
              businessDomain: '创业项目',
              urgency: '中等',
              expectedOutput: '需求分析报告',
              confidence: 0.8
            },
            complexity: {
              level: 'medium' as const,
              taskCount: '3-5个',
              expertiseRequired: '中等',
              agentCount: '2-3个',
              estimatedTime: '30-60分钟',
              reasoning: '基于用户输入的复杂度评估'
            },
            clarity: {
              score: 75,
              level: '良好',
              clearAspects: ['基本需求明确'],
              unclearAspects: ['具体实现细节'],
              needsClarification: false
            },
            recommendedAgents: ['business_canvas_agent', 'swot_analysis_agent'],
            nextSteps: [
              '进行商业模式分析',
              '执行SWOT分析',
              '制定实施计划'
            ]
          };
        }
      }

      // 转换后端数据格式为前端期望的格式
      const result: RequirementAnalysisResult = {
        query,
        // 如果后端返回的是标准格式，直接使用
        ...(analysisData.intent ? analysisData : this.convertBackendFormat(analysisData))
      };

      console.log('处理后的需求分析结果:', result);
      return result;
      
    } catch (error) {
      console.error('需求分析失败:', error);
      throw new Error(`需求分析失败: ${error instanceof Error ? error.message : '未知错误'}`);
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

  /**
   * 转换后端数据格式为前端期望的格式
   */
  private convertBackendFormat(backendData: any): Partial<RequirementAnalysisResult> {
    console.log('转换后端数据格式:', backendData);
    
    // 从project_overview提取基本信息
    const projectOverview = backendData.project_overview || {};
    
    return {
      // 构造意图分析
      intent: {
        mainGoal: projectOverview.description || backendData.query || '创业项目分析',
        businessDomain: projectOverview.category || '创业服务',
        urgency: '中等',
        expectedOutput: '需求分析报告',
        confidence: 0.85
      },
      
      // 构造复杂度评估
      complexity: {
        level: this.mapComplexityLevel(projectOverview.complexity),
        taskCount: this.estimateTaskCount(backendData),
        expertiseRequired: projectOverview.complexity === '高' ? '高级' : 
                          projectOverview.complexity === '中' ? '中等' : '初级',
        agentCount: this.estimateAgentCount(backendData),
        estimatedTime: this.estimateTime(projectOverview.complexity),
        reasoning: `基于项目复杂度"${projectOverview.complexity}"和功能需求数量的评估`
      },
      
      // 构造明确度检测
      clarity: {
        score: this.calculateClarityScore(backendData),
        level: '良好',
        clearAspects: this.extractClearAspects(backendData),
        unclearAspects: this.extractUnclearAspects(backendData),
        needsClarification: false
      },
      
      // 推荐智能体（基于项目类型推断）
      recommendedAgents: this.inferRecommendedAgents(projectOverview.category),
      
      // 下一步建议（使用recommendations字段）
      nextSteps: backendData.recommendations?.slice(0, 5) || [
        '进行详细需求分析',
        '制定项目计划',
        '组建团队',
        '开始原型开发',
        '市场验证'
      ]
    };
  }

  private mapComplexityLevel(complexity: string): 'simple' | 'medium' | 'complex' {
    switch (complexity) {
      case '低': return 'simple';
      case '高': return 'complex';
      case '中':
      default: return 'medium';
    }
  }

  private estimateTaskCount(data: any): string {
    const functionalReqs = data.functional_requirements?.length || 0;
    const nonFunctionalReqs = data.non_functional_requirements?.length || 0;
    const total = functionalReqs + nonFunctionalReqs;
    
    if (total > 15) return '10+个';
    if (total > 10) return '6-10个';
    if (total > 5) return '3-5个';
    return '1-3个';
  }

  private estimateAgentCount(data: any): string {
    const stakeholders = data.stakeholders?.length || 0;
    if (stakeholders > 6) return '4-5个';
    if (stakeholders > 4) return '3-4个';
    return '2-3个';
  }

  private estimateTime(complexity: string): string {
    switch (complexity) {
      case '高': return '2-4小时';
      case '中': return '1-2小时';
      case '低':
      default: return '30-60分钟';
    }
  }

  private calculateClarityScore(data: any): number {
    let score = 60; // 基础分数
    
    // 有项目描述加分
    if (data.project_overview?.description) score += 15;
    
    // 有功能需求加分
    if (data.functional_requirements?.length > 0) score += 10;
    
    // 有利益相关者加分
    if (data.stakeholders?.length > 0) score += 10;
    
    // 有成功标准加分
    if (data.success_criteria?.length > 0) score += 5;
    
    return Math.min(score, 100);
  }

  private extractClearAspects(data: any): string[] {
    const aspects = [];
    
    if (data.project_overview?.description) aspects.push('项目目标明确');
    if (data.functional_requirements?.length > 0) aspects.push('功能需求清晰');
    if (data.stakeholders?.length > 0) aspects.push('利益相关者识别');
    if (data.success_criteria?.length > 0) aspects.push('成功标准定义');
    
    return aspects.length > 0 ? aspects : ['基本需求明确'];
  }

  private extractUnclearAspects(data: any): string[] {
    const aspects = [];
    
    if (!data.project_overview?.description) aspects.push('项目描述不够详细');
    if (!data.functional_requirements?.length) aspects.push('功能需求待细化');
    if (!data.success_criteria?.length) aspects.push('成功标准需明确');
    
    return aspects.length > 0 ? aspects : ['实施细节'];
  }

  private inferRecommendedAgents(category: string): string[] {
    const categoryMap: Record<string, string[]> = {
      '教育与咨询服务': ['business_canvas_agent', 'swot_analysis_agent', 'policy_matching_agent'],
      '教育与培训': ['business_canvas_agent', 'market_research_agent'],
      '软件/应用开发': ['tech_stack_agent', 'business_canvas_agent'],
      '电子商务': ['market_research_agent', 'business_canvas_agent', 'financial_model_agent'],
      '金融科技': ['business_canvas_agent', 'policy_matching_agent', 'financial_model_agent'],
      '人工智能': ['tech_stack_agent', 'business_canvas_agent', 'market_research_agent']
    };
    
    return categoryMap[category] || ['business_canvas_agent', 'swot_analysis_agent'];
  }
}

// 导出单例实例
export const requirementAnalysisService = new RequirementAnalysisService();