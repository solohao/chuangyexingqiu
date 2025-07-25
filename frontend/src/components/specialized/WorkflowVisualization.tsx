import React from 'react';
import {
    RotateCcw,
    CheckCircle,
    Clock,
    Pause,
    X,
    Play,
    BarChart3,
    FileText,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

export interface WorkflowStep {
    id: string;
    name: string;
    status: 'completed' | 'in-progress' | 'waiting' | 'failed';
    duration?: number;
    description?: string;
    details?: string;
    apiCalls?: number;
}

export interface WorkflowVisualization {
    id: string;
    name: string;
    progress: number;
    status: 'running' | 'paused' | 'completed' | 'failed';
    steps: WorkflowStep[];
    isExpanded: boolean;
    totalDuration?: number;
    agentCount?: number;
    apiCallCount?: number;
    estimatedRemaining?: number;
}

interface WorkflowVisualizationProps {
    workflow: WorkflowVisualization;
    onToggleExpanded: () => void;
    onPause?: () => void;
    onStop?: () => void;
    onRestart?: () => void;
    onShowLogs?: () => void;
    onShowAnalytics?: () => void;
}

export const WorkflowVisualizationCard: React.FC<WorkflowVisualizationProps> = ({
    workflow,
    onToggleExpanded,
    onPause,
    onStop,
    onRestart,
    onShowLogs,
    onShowAnalytics
}) => {
    const getStatusIcon = (status: WorkflowStep['status']) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'in-progress': return <RotateCcw className="w-4 h-4 text-blue-500 animate-spin" />;
            case 'waiting': return <Clock className="w-4 h-4 text-gray-400" />;
            case 'failed': return <X className="w-4 h-4 text-red-500" />;
        }
    };

    const getStatusStyles = (status: WorkflowVisualization['status']) => {
        switch (status) {
            case 'running': 
                return {
                    container: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-600',
                    title: 'text-blue-900',
                    button: 'hover:bg-blue-100',
                    progress: 'bg-blue-500',
                    progressBg: 'bg-blue-100',
                    border: 'border-blue-200',
                    actionBtn: 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                };
            case 'paused': 
                return {
                    container: 'bg-yellow-50 border-yellow-200',
                    icon: 'text-yellow-600',
                    title: 'text-yellow-900',
                    button: 'hover:bg-yellow-100',
                    progress: 'bg-yellow-500',
                    progressBg: 'bg-yellow-100',
                    border: 'border-yellow-200',
                    actionBtn: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                };
            case 'completed': 
                return {
                    container: 'bg-green-50 border-green-200',
                    icon: 'text-green-600',
                    title: 'text-green-900',
                    button: 'hover:bg-green-100',
                    progress: 'bg-green-500',
                    progressBg: 'bg-green-100',
                    border: 'border-green-200',
                    actionBtn: 'bg-green-100 text-green-700 hover:bg-green-200'
                };
            case 'failed': 
                return {
                    container: 'bg-red-50 border-red-200',
                    icon: 'text-red-600',
                    title: 'text-red-900',
                    button: 'hover:bg-red-100',
                    progress: 'bg-red-500',
                    progressBg: 'bg-red-100',
                    border: 'border-red-200',
                    actionBtn: 'bg-red-100 text-red-700 hover:bg-red-200'
                };
        }
    };

    const styles = getStatusStyles(workflow.status);
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;

    return (
        <div className={`${styles.container} border rounded-lg p-3 mb-2`}>
            {/* 头部 */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <RotateCcw className={`w-4 h-4 ${styles.icon} ${workflow.status === 'running' ? 'animate-spin' : ''}`} />
                    <span className={`text-sm font-medium ${styles.title}`}>
                        {workflow.name}
                    </span>
                    <span className="text-xs text-gray-500">
                        ({completedSteps}/{workflow.steps.length}步骤完成)
                    </span>
                </div>
                
                <div className="flex items-center gap-1">
                    {workflow.status === 'running' && onPause && (
                        <button 
                            onClick={onPause}
                            className={`p-1 ${styles.button} rounded`}
                            title="暂停"
                        >
                            <Pause className={`w-3 h-3 ${styles.icon}`} />
                        </button>
                    )}
                    {workflow.status === 'paused' && onRestart && (
                        <button 
                            onClick={onRestart}
                            className={`p-1 ${styles.button} rounded`}
                            title="继续"
                        >
                            <Play className={`w-3 h-3 ${styles.icon}`} />
                        </button>
                    )}
                    {onStop && (
                        <button 
                            onClick={onStop}
                            className={`p-1 ${styles.button} rounded`}
                            title="停止"
                        >
                            <X className={`w-3 h-3 ${styles.icon}`} />
                        </button>
                    )}
                </div>
            </div>

            {/* 进度条 */}
            <div className="mb-3">
                <div className={`w-full ${styles.progressBg} rounded-full h-2`}>
                    <div 
                        className={`${styles.progress} h-2 rounded-full transition-all duration-300`}
                        style={{ width: `${workflow.progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>进度: {workflow.progress}%</span>
                    {workflow.totalDuration && (
                        <span>耗时: {Math.floor(workflow.totalDuration / 60)}:{(workflow.totalDuration % 60).toString().padStart(2, '0')}</span>
                    )}
                </div>
            </div>

            {/* 步骤列表 */}
            <div className="space-y-1 mb-3">
                {workflow.steps.map((step, index) => (
                    <div key={step.id} className="flex items-center gap-2 text-xs">
                        <span className="w-4 text-gray-500 text-center">{index + 1}.</span>
                        {getStatusIcon(step.status)}
                        <span className={
                            step.status === 'completed' ? `${styles.title} font-medium` : 
                            step.status === 'in-progress' ? styles.title : 
                            'text-gray-500'
                        }>
                            {step.name}
                        </span>
                        {step.description && (
                            <span className="text-gray-500">- {step.description}</span>
                        )}
                        {step.duration && (
                            <span className="text-gray-400 ml-auto">
                                [{step.duration < 60 ? `${step.duration}s` : `${Math.floor(step.duration / 60)}:${(step.duration % 60).toString().padStart(2, '0')}`}]
                            </span>
                        )}
                    </div>
                ))}
            </div>

            {/* 展开详情 */}
            {workflow.isExpanded && (
                <div className={`border-t ${styles.border} pt-3 mt-3`}>
                    <div className="grid grid-cols-2 gap-4 text-xs mb-3">
                        <div>
                            <span className="text-gray-500">实时统计:</span>
                            <div className="mt-1 space-y-1">
                                {workflow.totalDuration && (
                                    <div>总耗时: {Math.floor(workflow.totalDuration / 60)}:{(workflow.totalDuration % 60).toString().padStart(2, '0')}</div>
                                )}
                                {workflow.agentCount && (
                                    <div>调用智能体: {workflow.agentCount}个</div>
                                )}
                                {workflow.apiCallCount && (
                                    <div>API调用: {workflow.apiCallCount}次</div>
                                )}
                                {workflow.estimatedRemaining && (
                                    <div>预计剩余: {Math.floor(workflow.estimatedRemaining / 60)}:{(workflow.estimatedRemaining % 60).toString().padStart(2, '0')}</div>
                                )}
                            </div>
                        </div>
                        
                        <div>
                            <span className="text-gray-500">详细步骤:</span>
                            <div className="mt-1 space-y-1">
                                {workflow.steps.map(step => (
                                    step.details && (
                                        <div key={`${step.id}-detail`} className="text-gray-600">
                                            {step.name}: {step.details}
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                        {onShowLogs && (
                            <button
                                onClick={onShowLogs}
                                className={`px-2 py-1 text-xs ${styles.actionBtn} rounded flex items-center gap-1`}
                            >
                                <FileText className="w-3 h-3" />
                                详细日志
                            </button>
                        )}
                        {onShowAnalytics && (
                            <button
                                onClick={onShowAnalytics}
                                className={`px-2 py-1 text-xs ${styles.actionBtn} rounded flex items-center gap-1`}
                            >
                                <BarChart3 className="w-3 h-3" />
                                性能分析
                            </button>
                        )}
                        {workflow.status !== 'completed' && onRestart && (
                            <button
                                onClick={onRestart}
                                className={`px-2 py-1 text-xs ${styles.actionBtn} rounded flex items-center gap-1`}
                            >
                                <RotateCcw className="w-3 h-3" />
                                重新执行
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* 展开/收起按钮 */}
            <button
                onClick={onToggleExpanded}
                className={`w-full mt-2 text-xs ${styles.icon} hover:opacity-70 flex items-center justify-center gap-1`}
            >
                {workflow.isExpanded ? (
                    <>收起详情 <ChevronUp className="w-3 h-3" /></>
                ) : (
                    <>展开详情 <ChevronDown className="w-3 h-3" /></>
                )}
            </button>
        </div>
    );
};

export default WorkflowVisualizationCard; 