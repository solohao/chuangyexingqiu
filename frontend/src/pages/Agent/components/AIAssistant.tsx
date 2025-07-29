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
import { WorkflowVisualizationCard, type WorkflowVisualization, convertWorkflowResult } from '../../../components/specialized/WorkflowVisualization';
import { RequirementAnalysis } from '../../../components/specialized/RequirementAnalysis';
import { backendApiService } from '../../../services/backendApi.service';
import type { AgentInfo } from '../../../types/agents';
import type { ProjectContext } from '../../../../../shared/types/agent.types';
import { agentService } from '../../../services/agentService';
import { useRequirementAnalysis } from '../../../hooks/useRequirementAnalysis';

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

    // 需求分析状态
    const [showRequirementAnalysis, setShowRequirementAnalysis] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');
    const [clarificationQuestions, setClarificationQuestions] = useState<any[]>([]);
    const [analysisCompleted, setAnalysisCompleted] = useState(false);

    // 使用需求分析Hook
    const {
        analysis,
        loading: analysisLoading,
        error: analysisError,
        analyzeRequirement,
        checkNeedsClarification,
        recommendAgents,
        reset: resetAnalysis
    } = useRequirementAnalysis();

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
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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

    // 处理需求分析完成
    const handleAnalysisComplete = (result: any) => {
        console.log('需求分析完成:', result);
        
        // 检查是否已经完成分析，避免重复处理
        if (analysisCompleted) {
            console.log('分析已完成，跳过重复处理');
            return;
        }
        
        // 标记分析已完成
        setAnalysisCompleted(true);
        
        // 延迟隐藏需求分析组件，让用户看到结果
        setTimeout(() => {
            setShowRequirementAnalysis(false);
        }, 2000);
        
        // 添加简洁的分析完成消息
        const completionMessage: Message = {
            id: `completion_${Date.now()}`,
            type: 'ai',
            content: '✅ 需求分析完成！基于您的需求，我已为您生成详细的分析报告。',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, completionMessage]);

        // 如果有推荐的智能体，显示推荐信息
        if (result.recommendedAgents && result.recommendedAgents.length > 0) {
            setTimeout(() => {
                const recommendationMessage: Message = {
                    id: `recommendation_${Date.now()}`,
                    type: 'ai',
                    content: `🤖 推荐智能体：${result.recommendedAgents.join('、')}`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, recommendationMessage]);
            }, 500);
        }

        // 添加下一步建议
        if (result.nextSteps && result.nextSteps.length > 0) {
            setTimeout(() => {
                const nextStepsMessage: Message = {
                    id: `nextsteps_${Date.now()}`,
                    type: 'ai',
                    content: `💡 建议的下一步：\n${result.nextSteps.slice(0, 3).map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, nextStepsMessage]);
            }, 1000);
        }
    };

    // 处理澄清需求
    const handleClarificationNeeded = (questions: any[]) => {
        setClarificationQuestions(questions);
        console.log('需要澄清的问题:', questions);
    };

    // 处理澄清回答
    const handleClarificationAnswer = async (answer: string) => {
        // 添加用户回答到消息中
        const answerMessage: Message = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'user',
            content: answer,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, answerMessage]);

        // 基于回答重新分析需求
        const updatedQuery = `${currentQuery}\n\n补充信息：${answer}`;
        setCurrentQuery(updatedQuery);
        await analyzeRequirement(updatedQuery, 'full');
    };

    // 处理直接对话
    const handleDirectChat = (agent: AgentInfo) => {
        setMode('direct');
        setSelectedAgentId(agent.id);
        const chatMessage: Message = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'user',
            content: inputMessage,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputMessage;
        setInputMessage('');
        setIsTyping(true);

        try {
            if (mode === 'orchestrated') {
                await handleOrchestratedResponse(currentInput);
            } else {
                await handleDirectResponse(currentInput);
            }
        } catch (error) {
            console.error('处理消息失败:', error);
        } finally {
            setIsTyping(false);
        }
    };

    // 处理编排模式响应
    const handleOrchestratedResponse = async (userInput: string) => {
        try {
            // 重置之前的分析状态
            resetAnalysis();
            setAnalysisCompleted(false);
            
            // 设置当前查询并显示需求分析
            setCurrentQuery(userInput);
            setShowRequirementAnalysis(true);

            // 显示分析开始消息
            const analysisStartMessage: Message = {
                id: `analysis_start_${Date.now()}`,
                type: 'ai',
                content: '🔍 正在分析您的需求，请稍候...',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, analysisStartMessage]);

            // 模拟分析过程的流式更新
            setTimeout(() => {
                const processMessage: Message = {
                    id: `analysis_process_${Date.now()}`,
                    type: 'ai',
                    content: '📊 正在评估项目复杂度和所需资源...',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, processMessage]);
            }, 1000);

            setTimeout(() => {
                const agentMessage: Message = {
                    id: `analysis_agents_${Date.now()}`,
                    type: 'ai',
                    content: '🤖 正在匹配最适合的专业智能体...',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, agentMessage]);
            }, 2000);

        } catch (error) {
            console.error('编排模式响应失败:', error);
            const errorMessage: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'ai',
                content: `❌ 抱歉，处理您的请求时出现了错误：${error instanceof Error ? error.message : '未知错误'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
            setShowRequirementAnalysis(false);
        }
    };

    // 处理直接模式响应  
    const handleDirectResponse = async (userInput: string) => {
        try {
            if (selectedAgentId) {
                const result = await agentService.callAgent(selectedAgentId, userInput, projectContext);

                const aiResponse: Message = {
                    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'ai',
                    content: result.data ?
                        `${agentService.getAgentById(selectedAgentId)?.name}的分析结果：\n\n${JSON.stringify(result.data, null, 2)}` :
                        `${agentService.getAgentById(selectedAgentId)?.name}执行完成`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
            } else {
                const aiResponse: Message = {
                    id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'ai',
                    content: '请先选择一个智能体进行对话',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, aiResponse]);
            }
        } catch (error) {
            console.error('直接模式响应失败:', error);
            const errorMessage: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'ai',
                content: `抱歉，调用智能体时出现了错误：${error instanceof Error ? error.message : '未知错误'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        }
    };

    // 创建模拟工作流（保留作为备用）
    const createMockWorkflow = () => {
        const workflowId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const workflow: WorkflowVisualization = {
            id: workflowId,
            title: '商业模式分析',
            progress: 0,
            status: 'running',
            estimatedRemaining: 42,
            startTime: new Date(),
            steps: [
                { id: '1', name: '意图分析', status: 'completed', duration: 2, description: '商业模式分析', details: '已识别用户意图', agentId: 'requirement_analysis_agent', agentName: '需求分析智能体' },
                { id: '2', name: '智能体选择', status: 'in-progress', description: '商业模式画布智能体', details: '正在调用智能体', agentId: 'business_canvas_agent', agentName: '商业模式画布智能体' },
                { id: '3', name: '数据收集', status: 'waiting', description: '收集项目相关数据', agentId: 'business_canvas_agent', agentName: '商业模式画布智能体' },
                { id: '4', name: '智能体处理', status: 'waiting', description: '智能体分析处理', agentId: 'business_canvas_agent', agentName: '商业模式画布智能体' },
                { id: '5', name: '结果合成', status: 'waiting', description: '整合分析结果', agentId: 'orchestrator', agentName: '编排智能体' }
            ]
        };

        setCurrentWorkflow(workflow);

        const systemMessage: Message = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'system',
            content: '正在为您分析，已启动多智能体工作流...',
            timestamp: new Date(),
            workflowId: workflow.id
        };

        setMessages(prev => [...prev, systemMessage]);

        // 模拟工作流进度
        setTimeout(() => {
            const agentMessage: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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



    // 工作流控制函数

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
                        className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${mode === 'orchestrated'
                                ? 'bg-blue-500 text-white font-medium shadow-sm'
                                : 'text-gray-600 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        <span className={`w-2 h-2 rounded-full ${mode === 'orchestrated' ? 'bg-white' : 'bg-blue-500'}`} />
                        🎯 编排模式
                    </button>
                    <button
                        onClick={() => handleModeSwitch('direct')}
                        className={`px-3 py-1 text-xs rounded-md transition-all duration-200 flex items-center gap-1 ${mode === 'direct'
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
                                    <div className={`max-w-[85%] p-3 rounded-lg text-sm ${message.type === 'user'
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
                                        <p className={`text-xs mt-2 ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400'
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
                                            onPause={handlePauseWorkflow}
                                            onStop={handleStopWorkflow}
                                            onResume={handleRestartWorkflow}
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

                        {/* 需求分析组件 */}
                        {showRequirementAnalysis && currentQuery && (
                            <div className="mt-4">
                                <RequirementAnalysis
                                    query={currentQuery}
                                    onAnalysisComplete={handleAnalysisComplete}
                                    onClarificationNeeded={handleClarificationNeeded}
                                />
                            </div>
                        )}

                        {/* 澄清问题 */}
                        {clarificationQuestions.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <h4 className="text-sm font-medium text-gray-900">请回答以下问题以获得更好的帮助：</h4>
                                {clarificationQuestions.map((q, index) => (
                                    <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                        <p className="text-sm font-medium text-yellow-900">{q.question}</p>
                                        <p className="text-xs text-yellow-700 mt-1">{q.purpose}</p>
                                        <div className="mt-2">
                                            <input
                                                type="text"
                                                placeholder="请输入您的回答..."
                                                className="w-full px-3 py-2 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        const target = e.target as HTMLInputElement;
                                                        if (target.value.trim()) {
                                                            handleClarificationAnswer(target.value);
                                                            target.value = '';
                                                            setClarificationQuestions([]);
                                                        }
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
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