/**
 * 后端API调用服务
 * 负责与后端智能体框架进行通信
 */

import type { AgentInfo, AgentType } from '../types/agents';
import type { ProjectContext } from '../../../shared/types/agent.types';

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  code?: number;
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

// 智能体分析请求 - 匹配后端AgentAnalysisRequest格式
export interface AgentAnalysisRequest {
  query: string;
  project_description?: string;
  analysis_type?: string;
  project_type?: string;
  location?: string;
  project_stage?: string;
  industry?: string;
  project_info?: string;
  business_idea?: string;
  requestId?: string;
}

/**
 * 后端API服务类
 */
export class BackendApiService {
  private baseUrl: string;
  private joyagentUrl: string;
  private genieToolUrl: string;

  constructor() {
    // 根据环境配置API地址 - 指向Python服务
    this.baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://api.yourapp.com'
      : 'http://localhost:8080';

    this.joyagentUrl = `${this.baseUrl}/api/startup-agents`;
    this.genieToolUrl = process.env.NODE_ENV === 'production'
      ? 'https://genie.yourapp.com'
      : 'http://localhost:1601';
  }

  /**
   * 商业模式画布分析 - 流式版本
   */
  async analyzeBusinessCanvas(request: AgentAnalysisRequest): Promise<ApiResponse> {
    try {
      console.log('发送流式商业模式画布请求:', request);

      const response = await fetch(`${this.joyagentUrl}/business-canvas-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          business_idea: request.business_idea || request.query,
          analysis_type: request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          location: request.location || '',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          project_info: request.project_info || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 处理流式响应
      return await this.handleSSEResponse(response, 'business_canvas');
    } catch (error) {
      console.error('商业模式画布分析失败:', error);
      throw error;
    }
  }

  /**
   * 商业模式画布分析 - 流式版本（带回调）
   */
  async analyzeBusinessCanvasStream(
    request: AgentAnalysisRequest,
    onProgress?: (event: any) => void
  ): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.joyagentUrl}/business-canvas-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          business_idea: request.business_idea || request.query,
          analysis_type: request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          location: request.location || '',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          project_info: request.project_info || ''
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await this.handleSSEResponseWithCallback(response, 'business_canvas', onProgress);
    } catch (error) {
      console.error('商业模式画布分析失败:', error);
      throw error;
    }
  }

  /**
   * 商业模式画布分析 - 非流式版本（备用）
   */
  async analyzeBusinessCanvasSync(request: AgentAnalysisRequest): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.joyagentUrl}/business-canvas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          business_idea: request.business_idea || request.query,
          analysis_type: request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          location: request.location || '',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          project_info: request.project_info || ''
        })
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
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          project_info: request.project_info || request.query,
          analysis_type: request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          location: request.location || '',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          business_idea: request.business_idea || ''
        })
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
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          project_type: request.project_type || '',
          location: request.location || '',
          analysis_type: request.analysis_type || 'comprehensive',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          project_info: request.project_info || '',
          business_idea: request.business_idea || ''
        })
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
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          location: request.location || '',
          analysis_type: request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          project_info: request.project_info || '',
          business_idea: request.business_idea || ''
        })
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
   * 需求分析 - 流式版本
   */
  async analyzeRequirement(request: AgentAnalysisRequest & { analysisType?: string }): Promise<ApiResponse> {
    try {
      console.log('发送流式需求分析请求:', request);

      const response = await fetch(`${this.joyagentUrl}/requirement-analysis-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          analysis_type: request.analysisType || request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          location: request.location || '',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          project_info: request.project_info || '',
          business_idea: request.business_idea || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('需求分析API错误:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // 处理流式响应
      return await this.handleSSEResponse(response, 'requirement_analysis');
    } catch (error) {
      console.error('需求分析失败:', error);
      throw error;
    }
  }

  /**
   * 需求分析 - 流式版本（带回调）
   */
  async analyzeRequirementStream(
    request: AgentAnalysisRequest & { analysisType?: string },
    onProgress?: (event: any) => void
  ): Promise<ApiResponse> {
    try {
      console.log('发送流式需求分析请求:', request);

      const response = await fetch(`${this.joyagentUrl}/requirement-analysis-stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          analysis_type: request.analysisType || request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          location: request.location || '',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          project_info: request.project_info || '',
          business_idea: request.business_idea || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('需求分析API错误:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      // 处理流式响应（带回调）
      return await this.handleSSEResponseWithCallback(response, 'requirement_analysis', onProgress);
    } catch (error) {
      console.error('需求分析失败:', error);
      throw error;
    }
  }

  /**
   * 需求分析 - 非流式版本（备用）
   */
  async analyzeRequirementSync(request: AgentAnalysisRequest & { analysisType?: string }): Promise<ApiResponse> {
    try {
      console.log('发送同步需求分析请求:', request);

      const response = await fetch(`${this.joyagentUrl}/requirement-analysis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: request.query,
          project_description: request.project_description || request.query,
          analysis_type: request.analysisType || request.analysis_type || 'comprehensive',
          project_type: request.project_type || '',
          location: request.location || '',
          project_stage: request.project_stage || '',
          industry: request.industry || '',
          project_info: request.project_info || '',
          business_idea: request.business_idea || ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('需求分析API错误:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const result = await response.json();
      console.log('需求分析响应:', result);
      return result;
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
          query: request.parameters.query || '',
          project_description: request.parameters.query || '',
          analysis_type: request.parameters.analysisType || 'comprehensive',
          requestId
        });

      case 'business_canvas_agent':
        return this.analyzeBusinessCanvas({
          query: request.parameters.query || request.parameters.task || '',
          project_description: request.parameters.query || request.parameters.task || '',
          business_idea: request.parameters.query || request.parameters.task || '',
          analysis_type: 'comprehensive',
          requestId
        });

      case 'swot_analysis_agent':
        return this.performSWOTAnalysis({
          query: request.parameters.query || request.parameters.task || '',
          project_description: request.parameters.query || request.parameters.task || '',
          project_info: request.parameters.query || request.parameters.task || '',
          analysis_type: 'comprehensive',
          requestId
        });

      case 'policy_matching_agent':
        return this.matchPolicies({
          query: request.parameters.query || request.parameters.task || '',
          project_description: request.parameters.query || request.parameters.task || '',
          project_type: request.parameters.projectType || '',
          location: request.parameters.location || '',
          requestId
        });

      case 'incubator_agent':
        return this.recommendIncubators({
          query: request.parameters.query || request.parameters.task || '',
          project_description: request.parameters.query || request.parameters.task || '',
          project_stage: request.parameters.projectStage || '',
          industry: request.parameters.industry || '',
          location: request.parameters.location || '',
          requestId
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
        isStream: 'true', // 强制使用字符串格式
        outputStyle: 'markdown', // 使用markdown格式，更容易解析
        sopPrompt: '',
        basePrompt: ''
      };

      console.log('发送工作流请求:', agentRequest);

      const response = await fetch(`${this.baseUrl}/AutoAgent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(agentRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // 检查响应类型
      const contentType = response.headers.get('content-type');
      console.log('响应Content-Type:', contentType);

      // 处理SSE流式响应
      if (contentType?.includes('text/event-stream') || agentRequest.isStream === 'true') {
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
        steps: [{
          id: 'error_step',
          agentId: 'system',
          agentType: 'system',
          status: 'failed',
          description: '工作流执行失败',
          error: error instanceof Error ? error.message : String(error),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString()
        }],
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

    let buffer = '';
    let messageCount = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          workflowResult.status = 'completed';
          workflowResult.endTime = new Date().toISOString();
          workflowResult.progress = 100;
          break;
        }

        // 将新数据添加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 按双换行符分割SSE消息
        const messages = buffer.split('\n\n');

        // 保留最后一个消息（可能不完整）
        buffer = messages.pop() || '';

        for (const message of messages) {
          if (!message.trim()) continue;

          const lines = message.split('\n');
          let eventType = '';
          let data = '';

          // 解析SSE消息格式
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('data: event: ')) {
              // 处理 "data: event: xxx" 格式
              eventType = trimmedLine.slice(13).trim();
            } else if (trimmedLine.startsWith('data: data: ')) {
              // 处理 "data: data: {...}" 格式
              data = trimmedLine.slice(12).trim();
            } else if (trimmedLine.startsWith('event: ')) {
              // 处理标准 "event: xxx" 格式
              eventType = trimmedLine.slice(7).trim();
            } else if (trimmedLine.startsWith('data: ')) {
              // 处理标准 "data: xxx" 格式
              const rawData = trimmedLine.slice(6).trim();
              // 如果不是以event:开头，则认为是数据
              if (!rawData.startsWith('event:')) {
                data = rawData;
              }
            }
          }

          // 处理数据
          if (data) {
            messageCount++;

            // 跳过心跳和空数据
            if (data === 'heartbeat' || data === '' || data === ' ') {
              continue;
            }

            // 检查结束标记
            if (data === '[DONE]' || data === 'DONE' || eventType === 'done' || eventType === 'complete') {
              workflowResult.status = 'completed';
              workflowResult.endTime = new Date().toISOString();
              workflowResult.progress = 100;
              break;
            }

            // 尝试解析JSON数据
            if (this.isValidJSON(data)) {
              try {
                const parsed = JSON.parse(data);
                this.updateWorkflowFromSSE(workflowResult, parsed, eventType);

                // 根据事件类型更新进度
                if (eventType === 'start') {
                  workflowResult.progress = 10;
                } else if (eventType === 'thinking') {
                  workflowResult.progress = 30;
                } else if (eventType === 'action') {
                  workflowResult.progress = 50;
                } else if (eventType === 'observation') {
                  workflowResult.progress = 70;
                } else if (eventType === 'final_answer') {
                  workflowResult.progress = 90;
                } else if (eventType === 'complete') {
                  workflowResult.progress = 100;
                  workflowResult.status = 'completed';
                  workflowResult.endTime = new Date().toISOString();
                }

                continue;
              } catch (e) {
                console.warn('JSON解析失败:', e, 'Data:', data);
              }
            }

            // 处理非JSON文本数据
            console.log(`SSE文本数据 [${messageCount}] (${eventType}):`, data.substring(0, 100));

            // 将文本数据累积到结果中
            if (!workflowResult.results.textOutput) {
              workflowResult.results.textOutput = '';
            }
            workflowResult.results.textOutput += `[${eventType}] ${data}\n`;

            // 更新进度
            workflowResult.progress = Math.min(messageCount * 10, 90);

            // 创建或更新步骤
            this.updateWorkflowStepsFromText(workflowResult, data, messageCount, eventType);
          }
        }
      }
    } catch (error) {
      console.error('SSE处理错误:', error);
      workflowResult.status = 'failed';
      workflowResult.error = error instanceof Error ? error.message : String(error);
      workflowResult.endTime = new Date().toISOString();
    } finally {
      reader.releaseLock();
    }

    // 确保工作流有最终状态（安全网检查）
    if ((workflowResult.status as string) === 'running') {
      workflowResult.status = 'completed';
      workflowResult.endTime = new Date().toISOString();
      workflowResult.progress = 100;
    }

    return workflowResult;
  }

  /**
   * 处理智能体SSE响应
   */
  private async handleSSEResponse(response: Response, agentType: string): Promise<ApiResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult: any = null;
    let hasError = false;
    let errorMessage = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // 将新数据添加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 按双换行符分割SSE消息
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // 保留最后一个不完整的消息

        for (const message of messages) {
          if (!message.trim()) continue;

          const lines = message.split('\n');
          let eventType = '';
          let data = '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('event:')) {
              eventType = trimmedLine.slice(6).trim();
            } else if (trimmedLine.startsWith('data:')) {
              data = trimmedLine.slice(5).trim();
            }
          }

          // 处理数据
          if (data) {
            console.log(`[SSE] ${agentType}:`, { eventType, data });

            // 检查结束标记
            if (data === '[DONE]' || data === 'DONE') {
              break;
            }

            // 尝试解析JSON数据
            if (this.isValidJSON(data)) {
              try {
                const parsed = JSON.parse(data);
                
                if (parsed.type === 'start') {
                  console.log(`[${agentType}] 开始分析:`, parsed.message);
                } else if (parsed.type === 'result') {
                  console.log(`[${agentType}] 分析结果:`, parsed.data);
                  finalResult = parsed.data;
                } else if (parsed.type === 'complete') {
                  console.log(`[${agentType}] 分析完成:`, parsed.message);
                } else if (parsed.type === 'error') {
                  console.error(`[${agentType}] 分析错误:`, parsed.error);
                  hasError = true;
                  errorMessage = parsed.error;
                }
              } catch (e) {
                console.warn(`[${agentType}] JSON解析失败:`, data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`[${agentType}] SSE处理错误:`, error);
      hasError = true;
      errorMessage = error instanceof Error ? error.message : String(error);
    } finally {
      reader.releaseLock();
    }

    // 返回最终结果
    if (hasError) {
      return {
        success: false,
        data: {},
        message: errorMessage || '分析失败',
        error: errorMessage
      };
    } else if (finalResult) {
      return {
        success: true,
        data: finalResult,
        message: '分析完成'
      };
    } else {
      return {
        success: false,
        data: {},
        message: '未收到分析结果',
        error: '未收到分析结果'
      };
    }
  }

  /**
   * 处理智能体SSE响应（带回调）
   */
  private async handleSSEResponseWithCallback(
    response: Response, 
    agentType: string, 
    onProgress?: (event: any) => void
  ): Promise<ApiResponse> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let finalResult: any = null;
    let hasError = false;
    let errorMessage = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        // 将新数据添加到缓冲区
        buffer += decoder.decode(value, { stream: true });

        // 按双换行符分割SSE消息
        const messages = buffer.split('\n\n');
        buffer = messages.pop() || ''; // 保留最后一个不完整的消息

        for (const message of messages) {
          if (!message.trim()) continue;

          const lines = message.split('\n');
          let eventType = '';
          let data = '';

          for (const line of lines) {
            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('event:')) {
              eventType = trimmedLine.slice(6).trim();
            } else if (trimmedLine.startsWith('data:')) {
              data = trimmedLine.slice(5).trim();
            }
          }

          // 处理数据
          if (data) {
            console.log(`[SSE] ${agentType}:`, { eventType, data });

            // 检查结束标记
            if (data === '[DONE]' || data === 'DONE') {
              break;
            }

            // 尝试解析JSON数据
            if (this.isValidJSON(data)) {
              try {
                const parsed = JSON.parse(data);
                
                // 调用进度回调
                if (onProgress) {
                  onProgress({
                    type: parsed.type,
                    data: parsed,
                    agentType
                  });
                }
                
                if (parsed.type === 'start') {
                  console.log(`[${agentType}] 开始分析:`, parsed.message);
                } else if (parsed.type === 'progress') {
                  console.log(`[${agentType}] 分析进度:`, parsed.message);
                } else if (parsed.type === 'stream') {
                  console.log(`[${agentType}] 流式内容:`, parsed.accumulated_content?.length || 0, '字符');
                  // 对于流式内容，我们认为有内容就是成功的
                  if (parsed.accumulated_content) {
                    finalResult = { content: parsed.accumulated_content };
                  }
                } else if (parsed.type === 'stream_complete') {
                  console.log(`[${agentType}] 流式完成:`, parsed.message);
                  // 流式完成时，确保有最终内容
                  if (parsed.final_content) {
                    finalResult = { content: parsed.final_content };
                  }
                } else if (parsed.type === 'result') {
                  console.log(`[${agentType}] 分析结果:`, parsed.data);
                  finalResult = parsed.data;
                } else if (parsed.type === 'complete') {
                  console.log(`[${agentType}] 分析完成:`, parsed.message);
                  // 如果还没有结果，但是完成了，说明是流式模式，结果已经在stream事件中处理了
                  if (!finalResult && parsed.final_content) {
                    finalResult = { content: parsed.final_content };
                  }
                } else if (parsed.type === 'error') {
                  console.error(`[${agentType}] 分析错误:`, parsed.error);
                  hasError = true;
                  errorMessage = parsed.error;
                }
              } catch (e) {
                console.warn(`[${agentType}] JSON解析失败:`, data);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error(`[${agentType}] SSE处理错误:`, error);
      hasError = true;
      errorMessage = error instanceof Error ? error.message : String(error);
    } finally {
      reader.releaseLock();
    }

    // 返回最终结果
    if (hasError) {
      return {
        success: false,
        data: {},
        message: errorMessage || '分析失败',
        error: errorMessage
      };
    } else if (finalResult) {
      return {
        success: true,
        data: finalResult,
        message: '分析完成'
      };
    } else {
      // 对于流式模式，如果没有错误且流程完成，也应该认为是成功的
      console.log(`[${agentType}] 流式分析完成，虽然没有传统的result数据，但流程正常完成`);
      return {
        success: true,
        data: { content: '流式分析已完成' },
        message: '分析完成'
      };
    }
  }

  /**
   * SWOT分析 - 流式版本（带回调）
   */
  async performSWOTAnalysisStream(
    request: AgentAnalysisRequest,
    onProgress?: (event: any) => void
  ): Promise<ApiResponse> {
    // 暂时回退到非流式版本
    return await this.performSWOTAnalysis(request);
  }

  /**
   * 政策匹配 - 流式版本（带回调）
   */
  async matchPoliciesStream(
    request: AgentAnalysisRequest,
    onProgress?: (event: any) => void
  ): Promise<ApiResponse> {
    // 暂时回退到非流式版本
    return await this.matchPolicies(request);
  }

  /**
   * 孵化器推荐 - 流式版本（带回调）
   */
  async recommendIncubatorsStream(
    request: AgentAnalysisRequest,
    onProgress?: (event: any) => void
  ): Promise<ApiResponse> {
    // 暂时回退到非流式版本
    return await this.recommendIncubators(request);
  }

  /**
   * 检查字符串是否为有效JSON
   */
  private isValidJSON(str: string): boolean {
    if (!str || typeof str !== 'string') return false;

    const trimmed = str.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) return false;
    if (!trimmed.endsWith('}') && !trimmed.endsWith(']')) return false;

    try {
      JSON.parse(trimmed);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * 从文本数据更新工作流步骤
   */
  private updateWorkflowStepsFromText(workflow: WorkflowResult, text: string, messageIndex: number, eventType: string = ''): void {
    // 根据事件类型和文本内容推断当前步骤
    let stepName = eventType || '处理中';
    let agentId = 'react_agent';

    // 根据事件类型确定步骤名称
    switch (eventType) {
      case 'start':
        stepName = '智能体启动';
        break;
      case 'thinking':
        stepName = '思考分析';
        break;
      case 'action':
        stepName = '执行操作';
        break;
      case 'observation':
        stepName = '观察结果';
        break;
      case 'final_answer':
        stepName = '最终答案';
        break;
      case 'complete':
        stepName = '执行完成';
        break;
      default:
        // 根据文本内容推断
        if (text.includes('分析') || text.includes('analysis')) {
          stepName = '需求分析';
          agentId = 'requirement_analysis_agent';
        } else if (text.includes('商业模式') || text.includes('business')) {
          stepName = '商业模式分析';
          agentId = 'business_canvas_agent';
        } else if (text.includes('SWOT') || text.includes('优势')) {
          stepName = 'SWOT分析';
          agentId = 'swot_analysis_agent';
        } else if (text.includes('政策') || text.includes('policy')) {
          stepName = '政策匹配';
          agentId = 'policy_matching_agent';
        }
    }

    const stepId = eventType || `step_${messageIndex}`;
    const existingStep = workflow.steps.find(s => s.id === stepId);

    const status = eventType === 'complete' ? 'completed' : 'in-progress';

    if (existingStep) {
      existingStep.status = status;
      existingStep.result = text;
      if (status === 'completed') {
        existingStep.endTime = new Date().toISOString();
      }
    } else {
      workflow.steps.push({
        id: stepId,
        agentId,
        agentType: agentId as any,
        status,
        description: stepName,
        startTime: new Date().toISOString(),
        endTime: status === 'completed' ? new Date().toISOString() : undefined,
        result: text
      });
    }
  }

  /**
   * 从SSE数据更新工作流状态
   */
  private updateWorkflowFromSSE(workflow: WorkflowResult, data: any, eventType: string = ''): void {
    // 根据后端SSE数据格式更新工作流状态
    console.log('更新工作流状态:', { eventType, data });

    // 更新进度和状态
    if (data.progress !== undefined) {
      workflow.progress = data.progress;
    }

    // 处理不同类型的事件
    switch (data.type || eventType) {
      case 'agent_start':
        workflow.results.agentType = data.agent_type;
        workflow.results.query = data.query;
        this.addOrUpdateStep(workflow, 'start', '智能体启动', 'in-progress', data.content);
        break;

      case 'thinking':
        this.addOrUpdateStep(workflow, 'thinking', '思考分析', 'in-progress', data.content);
        break;

      case 'action':
        this.addOrUpdateStep(workflow, 'action', '执行操作', 'in-progress',
          `操作: ${data.action}, 参数: ${JSON.stringify(data.parameters || {})}`);
        break;

      case 'observation':
        this.addOrUpdateStep(workflow, 'observation', '观察结果', 'completed', data.content);
        break;

      case 'final_answer':
        this.addOrUpdateStep(workflow, 'final_answer', '最终答案', 'completed', data.content);
        workflow.results.finalAnswer = data.content;
        break;

      case 'agent_complete':
        workflow.status = 'completed';
        workflow.endTime = new Date().toISOString();
        workflow.progress = 100;
        workflow.results.steps = data.steps;
        this.addOrUpdateStep(workflow, 'complete', '执行完成', 'completed', '智能体执行完成');
        break;

      default:
        // 处理其他数据
        if (data.content) {
          workflow.results.content = (workflow.results.content || '') + data.content + '\n';
        }
        if (data.result) {
          workflow.results[data.agentId || 'default'] = data.result;
        }
    }
  }

  /**
   * 添加或更新工作流步骤
   */
  private addOrUpdateStep(
    workflow: WorkflowResult,
    stepId: string,
    description: string,
    status: 'waiting' | 'in-progress' | 'completed' | 'failed',
    result?: string
  ): void {
    const existingStep = workflow.steps.find(s => s.id === stepId);

    if (existingStep) {
      existingStep.status = status;
      existingStep.endTime = status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined;
      if (result) existingStep.result = result;
    } else {
      workflow.steps.push({
        id: stepId,
        agentId: 'react_agent',
        agentType: 'react',
        status,
        description,
        startTime: new Date().toISOString(),
        endTime: status === 'completed' || status === 'failed' ? new Date().toISOString() : undefined,
        result
      });
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