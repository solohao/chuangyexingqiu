/**
 * 工作流可视化组件
 * 显示多智能体工作流的执行状态和进度
 */

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Activity,
  Zap,
  BarChart3
} from 'lucide-react';
import type { WorkflowResult, WorkflowStep } from '../../services/backendApi.service';

// 工作流可视化数据接口
export interface WorkflowVisualization {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  progress: number;
  estimatedRemaining: number;
  steps: WorkflowVisualizationStep[];
  startTime: Date;
  endTime?: Date;
  totalDuration?: number;
  error?: string;
}

export interface WorkflowVisualizationStep {
  id: string;
  name: string;
  status: 'waiting' | 'in-progress' | 'completed' | 'failed' | 'skipped';
  duration?: number;
  description: string;
  details?: string;
  agentId: string;
  agentName: string;
  result?: any;
  error?: string;
}

interface WorkflowVisualizationCardProps {
  workflow: WorkflowVisualization;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  className?: string;
}

/**
 * 步骤状态图标组件
 */
const StepStatusIcon: React.FC<{ status: WorkflowVisualizationStep['status'] }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'in-progress':
      return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
    case 'failed':
      return <XCircle className="w-4 h-4 text-red-500" />;
    case 'skipped':
      return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    case 'waiting':
    default:
      return <Clock className="w-4 h-4 text-gray-400" />;
  }
};

/**
 * 步骤组件
 */
const WorkflowStepComponent: React.FC<{
  step: WorkflowVisualizationStep;
  isExpanded: boolean;
  onToggleExpand: () => void;
}> = ({ step, isExpanded, onToggleExpand }) => {
  const getStatusText = (status: WorkflowVisualizationStep['status']) => {
    switch (status) {
      case 'completed': return '✅ 完成';
      case 'in-progress': return '⏳ 进行中';
      case 'failed': return '❌ 失败';
      case 'skipped': return '⏸ 跳过';
      case 'waiting': return '⏸ 等待中';
      default: return '⏸ 等待中';
    }
  };

  const getStatusColor = (status: WorkflowVisualizationStep['status']) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'skipped': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'waiting': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`border rounded-lg p-3 ${getStatusColor(step.status)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <StepStatusIcon status={step.status} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{step.name}</h4>
              <span className="text-xs px-2 py-1 rounded-full bg-white/50">
                {step.agentName}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{step.description}</p>
            {step.duration && (
              <p className="text-xs text-gray-500 mt-1">
                耗时: {Math.round(step.duration / 1000)}秒
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{getStatusText(step.status)}</span>
          {(step.details || step.result || step.error) && (
            <button
              onClick={onToggleExpand}
              className="p-1 hover:bg-white/50 rounded transition-colors"
              title={isExpanded ? "收起详情" : "展开详情"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 展开的详情区域 */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-white/30">
          {step.details && (
            <div className="mb-2">
              <h5 className="text-xs font-medium text-gray-700 mb-1">执行详情</h5>
              <p className="text-xs text-gray-600 bg-white/50 p-2 rounded">{step.details}</p>
            </div>
          )}
          
          {step.result && (
            <div className="mb-2">
              <h5 className="text-xs font-medium text-gray-700 mb-1">执行结果</h5>
              <div className="text-xs text-gray-600 bg-white/50 p-2 rounded max-h-32 overflow-y-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(step.result, null, 2)}</pre>
              </div>
            </div>
          )}
          
          {step.error && (
            <div className="mb-2">
              <h5 className="text-xs font-medium text-red-700 mb-1">错误信息</h5>
              <p className="text-xs text-red-600 bg-red-100 p-2 rounded">{step.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 工作流可视化卡片组件
 */
export const WorkflowVisualizationCard: React.FC<WorkflowVisualizationCardProps> = ({
  workflow,
  onPause,
  onResume,
  onStop,
  onRestart,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // 计算统计信息
  const completedSteps = workflow.steps.filter(s => s.status === 'completed').length;
  const failedSteps = workflow.steps.filter(s => s.status === 'failed').length;
  const totalSteps = workflow.steps.length;

  const toggleStepExpand = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
  };

  const getStatusColor = () => {
    switch (workflow.status) {
      case 'completed': return 'border-green-200 bg-green-50';
      case 'running': return 'border-blue-200 bg-blue-50';
      case 'failed': return 'border-red-200 bg-red-50';
      case 'paused': return 'border-yellow-200 bg-yellow-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusText = () => {
    switch (workflow.status) {
      case 'completed': return '✅ 已完成';
      case 'running': return '⚡ 执行中';
      case 'failed': return '❌ 执行失败';
      case 'paused': return '⏸️ 已暂停';
      case 'pending': return '⏳ 等待中';
      default: return '⏸️ 未知状态';
    }
  };

  return (
    <div className={`border rounded-lg ${getStatusColor()} ${className}`}>
      {/* 工作流头部 */}
      <div className="p-4 border-b border-white/30">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-medium text-gray-900">{workflow.title}</h3>
              <p className="text-sm text-gray-600">{getStatusText()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 控制按钮 */}
            {workflow.status === 'running' && onPause && (
              <button
                onClick={onPause}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/50 rounded transition-colors"
                title="暂停工作流"
              >
                <Pause className="w-4 h-4" />
              </button>
            )}
            
            {workflow.status === 'paused' && onResume && (
              <button
                onClick={onResume}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-white/50 rounded transition-colors"
                title="恢复工作流"
              >
                <Play className="w-4 h-4" />
              </button>
            )}
            
            {(workflow.status === 'running' || workflow.status === 'paused') && onStop && (
              <button
                onClick={onStop}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-white/50 rounded transition-colors"
                title="停止工作流"
              >
                <Square className="w-4 h-4" />
              </button>
            )}
            
            {(workflow.status === 'completed' || workflow.status === 'failed') && onRestart && (
              <button
                onClick={onRestart}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-white/50 rounded transition-colors"
                title="重新执行"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
            
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-white/50 rounded transition-colors"
              title={isExpanded ? "收起详情" : "展开详情"}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
            <span>整体进度</span>
            <span>{workflow.progress}%</span>
          </div>
          <div className="w-full bg-white/50 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${workflow.progress}%` }}
            />
          </div>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">{completedSteps}</div>
            <div className="text-xs text-gray-600">已完成</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{totalSteps}</div>
            <div className="text-xs text-gray-600">总步骤</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {workflow.totalDuration ? Math.round(workflow.totalDuration / 1000) : '-'}s
            </div>
            <div className="text-xs text-gray-600">总耗时</div>
          </div>
        </div>

        {workflow.error && (
          <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
            <strong>错误:</strong> {workflow.error}
          </div>
        )}
      </div>

      {/* 展开的详情区域 */}
      {isExpanded && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-900">执行步骤</h4>
          </div>
          
          <div className="space-y-3">
            {workflow.steps.map((step) => (
              <WorkflowStepComponent
                key={step.id}
                step={step}
                isExpanded={expandedSteps.has(step.id)}
                onToggleExpand={() => toggleStepExpand(step.id)}
              />
            ))}
          </div>

          {/* 性能分析 */}
          {workflow.status === 'completed' && (
            <div className="mt-4 pt-4 border-t border-white/30">
              <h5 className="font-medium text-gray-900 mb-2">性能分析</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">成功率:</span>
                  <span className="ml-2 font-medium">
                    {Math.round((completedSteps / totalSteps) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">失败步骤:</span>
                  <span className="ml-2 font-medium text-red-600">{failedSteps}</span>
                </div>
                <div>
                  <span className="text-gray-600">平均步骤耗时:</span>
                  <span className="ml-2 font-medium">
                    {workflow.totalDuration ? Math.round(workflow.totalDuration / totalSteps / 1000) : 0}s
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">智能体调用:</span>
                  <span className="ml-2 font-medium">{totalSteps}次</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * 将后端WorkflowResult转换为前端WorkflowVisualization
 */
export const convertWorkflowResult = (result: WorkflowResult): WorkflowVisualization => {
  return {
    id: result.id,
    title: `多智能体工作流 - ${result.id.slice(-8)}`,
    status: result.status,
    progress: result.progress,
    estimatedRemaining: 0, // 后端暂不提供此数据
    steps: result.steps.map(step => ({
      id: step.id,
      name: step.description,
      status: step.status,
      duration: step.duration,
      description: step.description,
      details: step.result ? '执行成功，已获得分析结果' : undefined,
      agentId: step.agentId,
      agentName: getAgentDisplayName(step.agentType),
      result: step.result,
      error: step.error
    })),
    startTime: new Date(result.startTime),
    endTime: result.endTime ? new Date(result.endTime) : undefined,
    totalDuration: result.endTime ? 
      new Date(result.endTime).getTime() - new Date(result.startTime).getTime() : undefined,
    error: result.error
  };
};

/**
 * 获取智能体显示名称
 */
const getAgentDisplayName = (agentType: string): string => {
  const names: Record<string, string> = {
    'business_canvas_agent': '商业模式画布智能体',
    'swot_analysis_agent': 'SWOT分析智能体',
    'policy_matching_agent': '政策匹配智能体',
    'incubator_agent': '孵化器推荐智能体',
    'market_research_agent': '市场研究智能体',
    'tech_stack_agent': '技术栈智能体',
    'financial_model_agent': '财务模型智能体'
  };
  
  return names[agentType] || agentType;
};

export default WorkflowVisualizationCard;