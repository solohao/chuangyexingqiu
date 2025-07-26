/**
 * 后端API调用服务
 * 负责与后端智能体框架进行通信
 */

import type { AgentInfo, AgentType } from '../types/agents';
import type { ProjectContext } from '../../../shared/types/agent.types';

// API响应接口
export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
  requestId?: string;
}

// 工作流执行请求
export interface WorkflowRequest {
  task: string;
  agentTypes: AgentType[];
  projectContext?: ProjectContext;
  requestId: string;
  stream?: boolean;
}

// 工作流执行结果
export interface WorkflowResult {
  id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  results: Record<string, any>;
  progress: number;
  steps: WorkflowStep[];
  startTime: string;
  endTime?: string;
  error?: string;
}

// 工作流步骤
export interface WorkflowStep {
  id: string;
  agentId: string;
  agentType: AgentType;
  status: 'waiting' | 'in-progress' | 'completed' | 'failed';
  description: string;
  startTime?: string;
  endTime?: string;
  duration?: number;
  result?: any;
  error?: string;
}

// 智能体分析请求
export interface AgentAnalysisRequest {
  task: string;
  projectContext?: ProjectContext;
  requestId: string;
}

/**
 * 后端API服务类
 */
export class BackendApiService {
  private baseUrl: string;
  private joyagentUrl: string;
  private genieToolUrl: string;

  constructor() {
    // 根据环境配置API地址
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://api.yourapp.com' 
      : 'http://localhost:8080';
    
    this.joyagentUrl = `${this.baseUrl}/api/startup-agents`;
    this.genieToolUrl = process.env.NODE_ENV === 'production'
      ? 'https://genie.yourapp.com'
      : 'http://localhost:1601';
  }

  /**
   * 商业模式画布分析
   */
  async analyzeBusinessCanvas(request: AgentAnalysisRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.joyagentUrl}/business-canvas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('商业模式画布分析失败:', error);
      throw error;
    }
  }

  /**
   * SWOT分析
   */
  async performSWOTAnalysis(request: AgentAnalysisRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.joyagentUrl}/swot-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('SWOT分析失败:', error);
      throw error;
    }
  }

  /**
   * 政策匹配
   */
  async matchPolicies(request: AgentAnalysisRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.joyagentUrl}/policy-matching`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('政策匹配失败:', error);
      throw error;
    }
  }

  /**
   * 孵化器推荐
   */
  async recommendIncubators(request: AgentAnalysisRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.joyagentUrl}/incubator-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('孵化器推荐失败:', error);
      throw error;
    }
  }

  /**
   * 需求分析
   */
  async analyzeRequirement(request: AgentAnalysisRequest & { analysisType?: string }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.joyagentUrl}/requirement-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('需求分析失败:', error);
      throw error;
    }
  }

  /**
   * 通用智能体调用方法
   */
  async callAgent(request: {
    agentName: string;
    parameters: Record<string, any>;
    requestId?: string;
  }): Promise<ApiResponse> {
    const requestId = request.requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 根据智能体名称路由到对应的API
    switch (request.agentName) {
      case 'requirement_analysis_agent':
        return this.analyzeRequirement({
          task: request.parameters.query || '',
          requestId,
          ...request.parameters
        });
      
      case 'business_canvas_agent':
        return this.analyzeBusinessCanvas({
          task: request.parameters.query || request.parameters.task || '',
          requestId,
          projectContext: request.parameters.projectContext
        });
      
      case 'swot_analysis_agent':
        return this.performSWOTAnalysis({
          task: request.parameters.query || request.parameters.task || '',
          requestId,
          projectContext: request.parameters.projectContext
        });
      
      case 'policy_matching_agent':
        return this.matchPolicies({
          task: request.parameters.query || request.parameters.task || '',
          requestId,
          projectContext: request.parameters.projectContext
        });
      
      case 'incubator_agent':
        return this.recommendIncubators({
          task: request.parameters.query || request.parameters.task || '',
          requestId,
          projectContext: request.parameters.projectContext
        });
      
      default:
        throw new Error(`不支持的智能体: ${request.agentName}`);
    }
  }

  /**
   * 使用Genie工具进行代码解释
   */
  async runCodeInterpreter(request: {
    task: string;
    fileNames?: string[];
    requestId: string;
    stream?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.genieToolUrl}/v1/tool/code_interpreter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('代码解释器调用失败:', error);
      throw error;
    }
  }

  /**
   * 使用Genie工具生成报告
   */
  async generateReport(request: {
    task: string;
    fileNames?: string[];
    fileName: string;
    fileType: string;
    requestId: string;
    stream?: boolean;
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.genieToolUrl}/v1/tool/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('报告生成失败:', error);
      throw error;
    }
  }

  /**
   * 深度搜索
   */
  async deepSearch(request: {
    query: string;
    requestId: string;
    maxLoop?: number;
    searchEngines?: string[];
  }): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.genieToolUrl}/v1/tool/deepsearch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('深度搜索失败:', error);
      throw error;
    }
  }

  /**
   * 执行多智能体工作流 - 调用后端/AutoAgent接口
   */
  async executeWorkflow(request: WorkflowRequest): Promise<WorkflowResult> {
    const workflowId = this.generateWorkflowId();
    
    try {
      // 构建后端AgentRequest
      const agentRequest = {
        requestId: request.requestId,
        query: request.task,
        agentType: 'react', // 使用react模式进行多智能体编排
        isStream: request.stream || false,
        outputStyle: 'html', // 默认输出HTML格式
        sopPrompt: '',
        basePrompt: ''
      };

      const response = await fetch(`${this.baseUrl}/AutoAgent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(agentRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 处理SSE流式响应
      if (request.stream) {
        return this.handleSSEWorkflowResponse(response, workflowId);
      } else {
        // 处理非流式响应
        const result = await response.json();
        return this.convertToWorkflowResult(result, workflowId);
      }

    } catch (error) {
      console.error('工作流执行失败:', error);
      
      return {
        id: workflowId,
        status: 'failed',
        results: {},
        progress: 0,
        steps: [],
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 处理SSE流式响应
   */
  private async handleSSEWorkflowResponse(response: Response, workflowId: string): Promise<WorkflowResult> {
    const workflowResult: WorkflowResult = {
      id: workflowId,
      status: 'running',
      results: {},
      progress: 0,
      steps: [],
      startTime: new Date().toISOString()
    };

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('无法读取响应流');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          workflowResult.status = 'completed';
          workflowResult.endTime = new Date().toISOString();
          break;
        }

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              workflowResult.status = 'completed';
              workflowResult.endTime = new Date().toISOString();
              break;
            }

            try {
              const parsed = JSON.parse(data);
              this.updateWorkflowFromSSE(workflowResult, parsed);
            } catch (e) {
              // 忽略解析错误，继续处理下一行
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    return workflowResult;
  }

  /**
   * 从SSE数据更新工作流状态
   */
  private updateWorkflowFromSSE(workflow: WorkflowResult, data: any): void {
    // 根据后端SSE数据格式更新工作流状态
    if (data.requestId && data.requestId !== workflow.id) {
      return; // 不是当前工作流的数据
    }

    // 更新进度和状态
    if (data.progress !== undefined) {
      workflow.progress = data.progress;
    }

    // 更新步骤信息
    if (data.step) {
      const existingStep = workflow.steps.find(s => s.id === data.step.id);
      if (existingStep) {
        Object.assign(existingStep, data.step);
      } else {
        workflow.steps.push({
          id: data.step.id || this.generateStepId(),
          agentId: data.step.agentId || 'unknown',
          agentType: data.step.agentType || 'unknown',
          status: data.step.status || 'waiting',
          description: data.step.description || '',
          startTime: data.step.startTime,
          endTime: data.step.endTime,
          duration: data.step.duration,
          result: data.step.result,
          error: data.step.error
        });
      }
    }

    // 更新结果
    if (data.result) {
      workflow.results[data.agentId || 'default'] = data.result;
    }
  }

  /**
   * 转换后端响应为工作流结果
   */
  private convertToWorkflowResult(backendResult: any, workflowId: string): WorkflowResult {
    return {
      id: workflowId,
      status: 'completed',
      results: { default: backendResult },
      progress: 100,
      steps: [{
        id: this.generateStepId(),
        agentId: 'multi_agent',
        agentType: 'react',
        status: 'completed',
        description: '多智能体分析完成',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        duration: 0,
        result: backendResult
      }],
      startTime: new Date().toISOString(),
      endTime: new Date().toISOString()
    };
  }

  /**
   * 分析用户意图并推荐智能体
   */
  analyzeIntentAndRecommendAgents(
    query: string, 
    context?: ProjectContext
  ): {
    intent: string;
    confidence: number;
    recommendedAgents: AgentType[];
    reasoning: string;
  } {
    const queryLower = query.toLowerCase();

    // 简单的关键词匹配逻辑
    if (queryLower.includes('商业模式') || queryLower.includes('画布') || queryLower.includes('盈利模式')) {
      return {
        intent: 'business_model_analysis',
        confidence: 0.9,
        recommendedAgents: ['business_canvas_agent'],
        reasoning: '检测到商业模式相关关键词，推荐使用商业模式画布智能体'
      };
    }

    if (queryLower.includes('swot') || queryLower.includes('优势') || queryLower.includes('劣势')) {
      return {
        intent: 'swot_analysis',
        confidence: 0.85,
        recommendedAgents: ['swot_analysis_agent'],
        reasoning: '检测到SWOT分析相关关键词，推荐使用SWOT分析智能体'
      };
    }

    if (queryLower.includes('政策') || queryLower.includes('补贴') || queryLower.includes('扶持')) {
      return {
        intent: 'policy_matching',
        confidence: 0.8,
        recommendedAgents: ['policy_matching_agent'],
        reasoning: '检测到政策相关关键词，推荐使用政策匹配智能体'
      };
    }

    if (queryLower.includes('孵化器') || queryLower.includes('加速器') || queryLower.includes('孵化')) {
      return {
        intent: 'incubator_recommendation',
        confidence: 0.8,
        recommendedAgents: ['incubator_agent'],
        reasoning: '检测到孵化器相关关键词，推荐使用孵化器推荐智能体'
      };
    }

    if (queryLower.includes('全面') || queryLower.includes('综合') || queryLower.includes('整体')) {
      return {
        intent: 'comprehensive_analysis',
        confidence: 0.9,
        recommendedAgents: ['business_canvas_agent', 'swot_analysis_agent', 'policy_matching_agent'],
        reasoning: '检测到综合分析需求，推荐使用多个智能体进行全面分析'
      };
    }

    // 默认推荐
    return {
      intent: 'general_consultation',
      confidence: 0.6,
      recommendedAgents: ['business_canvas_agent'],
      reasoning: '未检测到特定意图，推荐使用商业模式画布智能体进行基础分析'
    };
  }

  /**
   * 生成工作流ID
   */
  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 生成步骤ID
   */
  private generateStepId(): string {
    return `step_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 获取智能体描述
   */
  private getAgentDescription(agentType: AgentType): string {
    const descriptions: Partial<Record<AgentType, string>> = {
      'business_canvas_agent': '商业模式画布分析',
      'swot_analysis_agent': 'SWOT分析',
      'policy_matching_agent': '政策匹配分析',
      'incubator_agent': '孵化器推荐',
      'market_research_agent': '市场研究分析',
      'tech_stack_agent': '技术栈分析',
      'financial_model_agent': '财务模型分析'
    };
    
    return descriptions[agentType] || `${agentType}分析`;
  }
}

// 导出单例实例
export const backendApiService = new BackendApiService();