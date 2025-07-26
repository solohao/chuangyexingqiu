import React, { useState, useEffect } from 'react';
import {
    Bot,
    Send,
    Settings,
    Paperclip,
    Mic,
    RotateCcw,
    CheckCircle,
    Clock,
    Pause,
    X
} from 'lucide-react';
import { AgentCatalog } from '../../../components/specialized/AgentCatalog';
import { WorkflowVisualizationCard, type WorkflowVisualization } from '../../../components/specialized/WorkflowVisualization';
import type { AgentInfo } from '../../../types/agents';
import type { ProjectContext } from '../../../../../shared/types/agent.types';

interface Message {
    id: string;
    type: 'user' | 'ai' | 'system' | 'agent';
    content: string;
    timestamp: Date;
    agentId?: string;
    agentName?: string;
    workflowId?: string;
}

interface AIAssistantProps {
    projectId?: string;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ projectId }) => {
    // 基础状态
    const [mode, setMode] = useState<'orchestrated' | 'direct'>('orchestrated');
    const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
    const [isAgentCatalogCollapsed, setIsAgentCatalogCollapsed] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            type: 'ai',
            content: '您好！我是创业助手，可以协调多个专业智能体为您服务。请问需要什么帮助？',
            timestamp: new Date(Date.now() - 5 * 60 * 1000)
        }
    ]);

    // 输入和交互状态
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowVisualization | null>(null);

    // 项目上下文
    const [projectContext, setProjectContext] = useState<ProjectContext | undefined>();

    // 初始化项目上下文
    useEffect(() => {
        if (projectId) {
            // 模拟项目上下文数据
            setProjectContext({
                projectId,
                projectType: 'saas',
                industry: 'technology',
                stage: 'mvp',
                recentAgentUsage: ['business_canvas_agent', 'swot_analysis_agent'],
                userPreferences: {
                    preferredAgents: ['business_canvas_agent'],
                    agentPriorities: {
                        'business_canvas_agent': 10,
                        'swot_analysis_agent': 8
                    },
                    workflowPreferences: {
                        autoStart: true,
                        showDetails: false
                    },
                    notificationSettings: {
                        enableAgentStatusUpdates: true,
                        enableWorkflowProgress: true,
                        enableRecommendations: true
                    }
                }
            });
        }
    }, [projectId]);

    // 快捷建议 - 根据模式显示不同的建议
    const suggestions = mode === 'orchestrated' ? [
        '分析竞争对手',
        '制定融资计划', 
        'SWOT分析',
        '商业模式画布',
        '政策匹配'
    ] : selectedAgentId === 'business_canvas_agent' ? [
        '价值主张分析',
        '客户细分研究',
        '收入模式设计',
        '关键合作伙伴',
        '成本结构优化'
    ] : selectedAgentId === 'swot_analysis_agent' ? [
        '优势分析',
        '劣势识别',
        '机会挖掘',
        '威胁评估',
        '竞争策略'
    ] : [
        '开始专业对话',
        '咨询专业问题',
        '获取建议',
        '深度分析',
        '解决方案'
    ];

    // 处理模式切换
    const handleModeSwitch = (newMode: 'orchestrated' | 'direct') => {
        setMode(newMode);
        setSelectedAgentId(undefined);
        setCurrentWorkflow(null);
        
        // 添加模式切换消息
        const switchMessage: Message = {
            id: Date.now().toString(),
            type: 'system',
            content: `已切换到${newMode === 'orchestrated' ? '编排模式' : '直接模式'}`,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, switchMessage]);
    };

    // 处理智能体选择
    const handleAgentSelect = (agent: AgentInfo) => {
        if (mode === 'direct') {
            setSelectedAgentId(agent.id);
            // 添加切换消息
            const switchMessage: Message = {
                id: Date.now().toString(),
                type: 'system',
                content: `已切换到${agent.name}对话`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, switchMessage]);
        }
    };

    // 处理添加到工作流
    const handleAddToWorkflow = (agent: AgentInfo) => {
        if (mode === 'orchestrated') {
            console.log('添加智能体到工作流:', agent);
            // TODO: 实现添加到工作流逻辑
        }
    };

    // 处理直接对话
    const handleDirectChat = (agent: AgentInfo) => {
        setMode('direct');
        setSelectedAgentId(agent.id);
        const chatMessage: Message = {
            id: Date.now().toString(),
            type: 'system',
            content: `正在与${agent.name}对话`,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, chatMessage]);
    };

    // 处理发送消息
    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsTyping(true);

        // 模拟响应
        setTimeout(() => {
            if (mode === 'orchestrated') {
                handleOrchestratedResponse(inputMessage);
            } else {
                handleDirectResponse(inputMessage);
            }
            setIsTyping(false);
        }, 1500);
    };

    // 处理编排模式响应
    const handleOrchestratedResponse = (userInput: string) => {
        // 创建工作流可视化
        const workflow: WorkflowVisualization = {
            id: Date.now().toString(),
            name: '商业模式分析',
            progress: 0,
            status: 'running',
            isExpanded: false,
            totalDuration: 18,
            agentCount: 1,
            apiCallCount: 3,
            estimatedRemaining: 42,
            steps: [
                { id: '1', name: '意图分析', status: 'completed', duration: 2, description: '商业模式分析', details: '已识别用户意图' },
                { id: '2', name: '智能体选择', status: 'in-progress', description: '商业模式画布智能体', details: '正在调用智能体' },
                { id: '3', name: '数据收集', status: 'waiting', description: '收集项目相关数据' },
                { id: '4', name: '智能体处理', status: 'waiting', description: '智能体分析处理' },
                { id: '5', name: '结果合成', status: 'waiting', description: '整合分析结果' }
            ]
        };

        setCurrentWorkflow(workflow);

        const systemMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: 'system',
            content: '正在为您分析，已启动多智能体工作流...',
            timestamp: new Date(),
            workflowId: workflow.id
        };

        setMessages(prev => [...prev, systemMessage]);

        // 模拟工作流进度
        setTimeout(() => {
            const agentMessage: Message = {
                id: (Date.now() + 2).toString(),
                type: 'agent',
                content: '我来帮您分析商业模式的九大要素。首先，让我了解一下您的目标客户群体...',
                timestamp: new Date(),
                agentId: 'business_canvas_agent',
                agentName: '商业模式画布智能体'
            };
            setMessages(prev => [...prev, agentMessage]);

            // 更新工作流进度
            setCurrentWorkflow(prev => prev ? {
                ...prev,
                progress: 40,
                steps: prev.steps.map(step => 
                    step.id === '2' ? { ...step, status: 'completed' as const, duration: 1 } :
                    step.id === '3' ? { ...step, status: 'in-progress' as const } :
                    step
                )
            } : null);
        }, 2000);
    };

    // 处理直接模式响应
    const handleDirectResponse = (userInput: string) => {
        const agentName = selectedAgentId === 'business_canvas_agent' ? '商业模式画布智能体' : 
                         selectedAgentId === 'swot_analysis_agent' ? 'SWOT分析智能体' : 'AI助手';

        const agentResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'agent',
            content: `针对您的问题"${userInput}"，我来为您提供专业的分析和建议...`,
            timestamp: new Date(),
            agentId: selectedAgentId,
            agentName
        };
        setMessages(prev => [...prev, agentResponse]);
    };

    // 工作流控制函数
    const handleToggleWorkflowExpanded = () => {
        setCurrentWorkflow(prev => prev ? { ...prev, isExpanded: !prev.isExpanded } : null);
    };

    const handlePauseWorkflow = () => {
        setCurrentWorkflow(prev => prev ? { ...prev, status: 'paused' } : null);
    };

    const handleStopWorkflow = () => {
        setCurrentWorkflow(null);
    };

    const handleRestartWorkflow = () => {
        setCurrentWorkflow(prev => prev ? { ...prev, status: 'running' } : null);
    };

    return (
        <div className="w-full h-full bg-white flex flex-col">
            {/* 1. 模式切换区域 (固定40px) */}
            <div className="h-10 flex-shrink-0 border-b border-gray-200 px-3 flex items-center justify-between bg-gray-50">
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => handleModeSwitch('orchestrated')}
                        className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
                            mode === 'orchestrated' 
                                ? 'bg-blue-500 text-white font-medium shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${mode === 'orchestrated' ? 'bg-white' : 'bg-blue-500'}`} />
                        🎯 编排模式
                    </button>
                    <button
                        onClick={() => handleModeSwitch('direct')}
                        className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${
                            mode === 'direct' 
                                ? 'bg-green-500 text-white font-medium shadow-sm' 
                                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${mode === 'direct' ? 'bg-white' : 'bg-green-500'}`} />
                        💬 直接模式
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                        {mode === 'orchestrated' ? '多智能体协同' : selectedAgentId ? '专业对话中' : '选择智能体'}
                    </span>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <Settings className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* 2. 智能体目录区域 (动态高度) */}
            <div className="flex-shrink-0" style={{ maxHeight: isAgentCatalogCollapsed ? '40px' : '300px' }}>
                <AgentCatalog
                    mode={mode}
                    selectedAgentId={selectedAgentId}
                    onAgentSelect={handleAgentSelect}
                    onAddToWorkflow={handleAddToWorkflow}
                    onDirectChat={handleDirectChat}
                    projectContext={projectContext}
                    isCollapsed={isAgentCatalogCollapsed}
                    onToggleCollapse={() => setIsAgentCatalogCollapsed(!isAgentCatalogCollapsed)}
                />
            </div>

            {/* 3. 对话区域 (占据剩余空间) */}
            <div className="flex-1 min-h-0 flex flex-col bg-gray-50">
                {/* 对话头部 */}
                {mode === 'direct' && selectedAgentId && (
                    <div className="flex-shrink-0 px-3 py-2 border-b border-gray-200 bg-blue-50">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-900">
                                正在与 🎯 {selectedAgentId === 'business_canvas_agent' ? '商业模式画布智能体' : 'AI智能体'} 对话
                            </span>
                            <button 
                                onClick={() => handleModeSwitch('orchestrated')}
                                className="text-xs text-blue-600 hover:text-blue-700"
                            >
                                [切换模式]
                            </button>
                        </div>
                </div>
                )}

                {/* 消息列表 */}
                <div className="flex-1 min-h-0 overflow-y-auto bg-white">
                    <div className="p-4 space-y-4">
                        {/* 如果没有消息，显示欢迎信息 */}
                        {messages.length === 0 && (
                            <div className="text-center py-12 text-gray-500">
                                <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium mb-2 text-gray-700">
                                    {mode === 'orchestrated' ? '🎯 多智能体编排模式' : '💬 直接对话模式'}
                                </h3>
                                <p className="text-sm text-gray-500 mb-4">
                                    {mode === 'orchestrated' 
                                        ? '我可以协调多个专业智能体为您服务，自动创建工作流完成复杂任务' 
                                        : selectedAgentId 
                                            ? `正在与 ${selectedAgentId === 'business_canvas_agent' ? '商业模式画布智能体' : 'AI智能体'} 进行一对一专业对话`
                                            : '请从上方智能体目录中选择一个专业智能体开始深度对话'
                                    }
                                </p>
                                {mode === 'orchestrated' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">✨ 编排模式特性:</h4>
                                        <ul className="text-xs text-blue-700 space-y-1">
                                            <li>• 智能任务分解和智能体调度</li>
                                            <li>• 实时工作流进度可视化</li>
                                            <li>• 多智能体协同工作</li>
                                            <li>• 自动结果合成和优化</li>
                                        </ul>
                                    </div>
                                )}
                                {mode === 'direct' && !selectedAgentId && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left max-w-md mx-auto">
                                        <h4 className="text-sm font-medium text-green-900 mb-2">🎯 直接模式特性:</h4>
                                        <ul className="text-xs text-green-700 space-y-1">
                                            <li>• 与专业智能体一对一深度对话</li>
                                            <li>• 专业领域深度分析和建议</li>
                                            <li>• 连续对话保持上下文</li>
                                            <li>• 个性化专业指导</li>
                                        </ul>
                                    </div>
                                )}
                                {mode === 'direct' && selectedAgentId && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left max-w-md mx-auto">
                                        <h4 className="text-sm font-medium text-green-900 mb-2">
                                            🤖 {selectedAgentId === 'business_canvas_agent' ? '商业模式画布智能体' : 'AI智能体'}
                                        </h4>
                                        <p className="text-xs text-green-700">
                                            {selectedAgentId === 'business_canvas_agent' 
                                                ? '专业的商业模式分析专家，精通商业模式画布九大要素分析'
                                                : '专业AI助手，为您提供深度分析和建议'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 消息列表 */}
                        {messages.map(message => (
                            <div key={message.id}>
                                <div className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${
                                        message.type === 'user'
                                            ? 'bg-blue-600 text-white'
                                            : message.type === 'system'
                                            ? 'bg-gray-100 text-gray-700'
                                            : message.type === 'agent'
                                            ? 'bg-green-50 border border-green-200 text-gray-800'
                                            : 'bg-white border border-gray-200 text-gray-800'
                                    }`}>
                                        {(message.type === 'agent' && message.agentName) && (
                                            <div className="flex items-center mb-2">
                                                <Bot className="w-4 h-4 mr-2" />
                                                <span className="text-sm text-green-600 font-medium">{message.agentName}</span>
                                            </div>
                                        )}
                                        <p className="text-sm leading-relaxed">{message.content}</p>
                                        <p className={`text-xs mt-2 ${
                                            message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
                                    }`}>
                                    {message.timestamp.toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                                </div>

                                {/* 工作流可视化 */}
                                {message.workflowId && currentWorkflow && (
                                    <div className="mt-3 ml-8">
                                        <WorkflowVisualizationCard 
                                            workflow={currentWorkflow}
                                            onToggleExpanded={handleToggleWorkflowExpanded}
                                            onPause={handlePauseWorkflow}
                                            onStop={handleStopWorkflow}
                                            onRestart={handleRestartWorkflow}
                                            onShowLogs={() => console.log('显示日志')}
                                            onShowAnalytics={() => console.log('显示分析')}
                                        />
                                    </div>
                                )}
                        </div>
                    ))}

                        {/* 正在输入指示器 */}
                    {isTyping && (
                        <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                                    <div className="flex items-center space-x-2">
                                        <Bot className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm text-gray-500">正在处理中</span>
                                    <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        </div>
                </div>
                </div>

            {/* 4. 输入区域 (固定80px) */}
            <div className="h-20 flex-shrink-0 border-t border-gray-200 bg-white">
                <div className="p-3 h-full flex flex-col">
                    {/* 输入框行 */}
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder={
                                mode === 'orchestrated' 
                                    ? "描述您的需求，我会协调多个智能体为您服务..." 
                                    : selectedAgentId 
                                        ? `与${selectedAgentId === 'business_canvas_agent' ? '商业模式画布智能体' : 'AI智能体'}对话...`
                                        : "请先选择一个智能体开始专业对话..."
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button 
                            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="附件"
                        >
                            <Paperclip className="w-4 h-4" />
                        </button>
                        <button 
                            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="语音"
                        >
                            <Mic className="w-4 h-4" />
                        </button>
                        <button 
                            className="p-2 text-gray-400 hover:text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            title="设置"
                        >
                            <Settings className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleSendMessage}
                            disabled={!inputMessage.trim() || isTyping}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                            title="发送"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>

                    {/* 建议提示行 */}
                    <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        <span className="text-xs text-gray-500 whitespace-nowrap mr-2 self-center">💡 建议:</span>
                        {suggestions.map(suggestion => (
                                <button
                                key={suggestion}
                                onClick={() => setInputMessage(suggestion)}
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 whitespace-nowrap transition-colors"
                                >
                                {suggestion}
                                </button>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIAssistant;