import React, { useState, useEffect } from 'react';
import {
    Bot,
    Send,
    Settings,
    Paperclip,
    Mic,
    Home,
    CheckSquare,
    FileText,
    Calendar,
    Users,
    BarChart3,
    Briefcase,
    Target,
    Wrench,
    Star,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    X,
    RotateCcw,
    CheckCircle,
    Clock,
    Pause
} from 'lucide-react';
import { RequirementAnalysis } from '../../components/specialized/RequirementAnalysis';
import { AgentCatalog } from '../../components/specialized/AgentCatalog';
import { useRequirementAnalysis } from '../../hooks/useRequirementAnalysis';
import ResizablePanel from '../../components/common/ResizablePanel';
import { WorkflowVisualizationCard, type WorkflowVisualization, convertWorkflowResult } from '../../components/specialized/WorkflowVisualization';
import { backendApiService } from '../../services/backendApi.service';
import { agentService } from '../../services/agentService';
import type { AgentInfo } from '../../types/agents';
import type { ProjectContext } from '../../../../shared/types/agent.types';
import { chatHistoryService } from '../../services/chatHistoryService';
import { chatSessionService } from '../../services/chatSessionService';
import { Message } from '../../types/chat.types';
import SessionHistoryDrawer from '../../components/specialized/SessionHistoryDrawer';
import './AgentWorkspace.css';

// 使用共享的Message类型
// interface Message {
//     id: string;
//     type: 'user' | 'ai' | 'system' | 'agent';
//     content: string;
//     timestamp: Date;
//     agentId?: string;
//     agentName?: string;
//     workflowId?: string;
// }

// 项目数据接口
interface ProjectData {
    id: string;
    name: string;
    icon: string;
    status: '进行中' | '规划中' | '已完成';
    progress: number;
    team: number;
    description: string;
    createdAt: string;
    lastActive: string;
}

// 页面类型
type PageType = 'workspace' | 'dashboard' | 'tasks' | 'documents' | 'timeline' | 'team' | 'settings' |
    'agents-analysis' | 'agents-business' | 'agents-strategy' | 'agents-tools' | 'agents-all';

interface AgentWorkspaceProps {
    projectId?: string;
}

const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ projectId }) => {
    // 项目数据
    const [projectsData] = useState<Record<string, ProjectData>>({
        project1: {
            id: 'project1',
            name: '我的创业项目',
            icon: '🚀',
            status: '进行中',
            progress: 65,
            team: 4,
            description: '一个面向大学生的创业服务平台',
            createdAt: '2023-12-01',
            lastActive: '2小时前'
        },
        project2: {
            id: 'project2',
            name: 'AI教育平台',
            icon: '🎓',
            status: '规划中',
            progress: 15,
            team: 2,
            description: '基于AI的个性化教育解决方案',
            createdAt: '2024-01-05',
            lastActive: '1天前'
        },
        project3: {
            id: 'project3',
            name: '智能医疗助手',
            icon: '🏥',
            status: '已完成',
            progress: 100,
            team: 6,
            description: '智能医疗诊断和健康管理系统',
            createdAt: '2023-10-15',
            lastActive: '1周前'
        }
    });

    // 会话ID管理
    const [sessionId] = useState(() =>
        `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    );

    // 状态管理
    const [currentProjectId, setCurrentProjectId] = useState('project1');
    const [currentPage, setCurrentPage] = useState<PageType>('agents-analysis');
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState<string | undefined>();
    const [projectContext, setProjectContext] = useState<ProjectContext | undefined>();
    const [showChatPanel, setShowChatPanel] = useState(true);

    // 对话相关状态
    const [mode, setMode] = useState<'orchestrated' | 'direct'>('orchestrated');
    const [messages, setMessages] = useState<Message[]>(() => {
        // 尝试从本地存储加载消息
        const savedMessages = chatHistoryService.getMessages(sessionId);
        if (savedMessages && savedMessages.length > 0) {
            return savedMessages;
        }
        // 默认欢迎消息
        return [{
            id: '1',
            type: 'ai',
            content: '您好！我是创业助手，可以协调多个专业智能体为您服务。请问需要什么帮助？',
            timestamp: new Date(Date.now() - 5 * 60 * 1000)
        }];
    });
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowVisualization | null>(null);
    const [clarificationQuestions, setClarificationQuestions] = useState<any[]>([]);
    const [analysisCompleted, setAnalysisCompleted] = useState(false);

    // 需求分析状态
    const [showRequirementAnalysis, setShowRequirementAnalysis] = useState(false);
    const [currentQuery, setCurrentQuery] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // 会话历史状态
    const [showSessionHistory, setShowSessionHistory] = useState(false);

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

    // 智能体数据
    const agentsData = {
        analysis: [
            {
                id: 'requirement_analysis',
                name: '需求分析智能体',
                description: '专业分析创业项目需求，评估可行性和复杂度，为项目规划提供数据支持',
                icon: '🔍',
                tags: ['需求分析', '可行性评估', '项目规划'],
                status: 'online',
                usage: '1.2k次使用',
                rating: '4.8分'
            },
            {
                id: 'swot_analysis_agent',
                name: 'SWOT分析智能体',
                description: '深度分析项目的优势、劣势、机会和威胁，提供全面的战略分析报告',
                icon: '⚖️',
                tags: ['SWOT分析', '战略分析', '风险评估'],
                status: 'online',
                usage: '856次使用',
                rating: '4.7分'
            },
            {
                id: 'market_research',
                name: '市场研究智能体',
                description: '专业的市场调研和竞争分析，帮助了解目标市场和竞争环境',
                icon: '📈',
                tags: ['市场调研', '竞争分析', '用户画像'],
                status: 'online',
                usage: '2.1k次使用',
                rating: '4.9分'
            },
            {
                id: 'financial_analysis',
                name: '财务分析智能体',
                description: '专业的财务建模和投资回报分析，为融资决策提供数据支持',
                icon: '💰',
                tags: ['财务建模', '投资分析', '成本核算'],
                status: 'busy',
                usage: '743次使用',
                rating: '4.6分'
            }
        ],
        business: [
            {
                id: 'business_canvas_agent',
                name: '商业模式画布智能体',
                description: '基于商业模式画布方法论，帮助梳理和优化商业模式的九大要素',
                icon: '🎨',
                tags: ['商业模式', '画布分析', '价值主张'],
                status: 'online',
                usage: '1.8k次使用',
                rating: '4.8分'
            },
            {
                id: 'business_plan',
                name: '商业计划书智能体',
                description: '专业的商业计划书撰写和优化，符合投资人和银行的标准要求',
                icon: '📋',
                tags: ['商业计划书', '融资材料', '项目包装'],
                status: 'online',
                usage: '1.3k次使用',
                rating: '4.7分'
            },
            {
                id: 'pitch_deck',
                name: '路演PPT智能体',
                description: '制作专业的投资路演PPT，突出项目亮点和投资价值',
                icon: '🎤',
                tags: ['路演PPT', '投资材料', '演示设计'],
                status: 'online',
                usage: '967次使用',
                rating: '4.5分'
            }
        ],
        strategy: [
            {
                id: 'growth_strategy',
                name: '增长策略智能体',
                description: '制定用户增长和业务扩张策略，提供可执行的增长方案',
                icon: '🚀',
                tags: ['增长策略', '用户获取', '业务扩张'],
                status: 'online',
                usage: '654次使用',
                rating: '4.6分'
            },
            {
                id: 'marketing_strategy',
                name: '营销策略智能体',
                description: '制定全面的营销推广策略，包括品牌定位和渠道选择',
                icon: '📢',
                tags: ['营销策略', '品牌定位', '推广渠道'],
                status: 'online',
                usage: '892次使用',
                rating: '4.7分'
            }
        ],
        tools: [
            {
                id: 'policy_matching_agent',
                name: '政策匹配智能体',
                description: '智能匹配适合的创业扶持政策和补贴项目，提供申请指导',
                icon: '📜',
                tags: ['政策匹配', '补贴申请', '扶持政策'],
                status: 'online',
                usage: '1.1k次使用',
                rating: '4.8分'
            },
            {
                id: 'incubator_agent',
                name: '孵化器推荐智能体',
                description: '根据项目特点推荐合适的孵化器和加速器，提供入驻建议',
                icon: '🏢',
                tags: ['孵化器', '加速器', '资源对接'],
                status: 'online',
                usage: '578次使用',
                rating: '4.5分'
            },
            {
                id: 'legal_advisor',
                name: '法律顾问智能体',
                description: '提供创业过程中的法律咨询和合规建议，规避法律风险',
                icon: '⚖️',
                tags: ['法律咨询', '合规建议', '风险规避'],
                status: 'offline',
                usage: '423次使用',
                rating: '4.4分'
            }
        ]
    };

    // 初始化项目上下文
    useEffect(() => {
        if (projectId) {
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

    // 响应式设计：检测屏幕大小
    useEffect(() => {
        const checkScreenSize = () => {
            setShowChatPanel(window.innerWidth > 1200);
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);

        return () => {
            window.removeEventListener('resize', checkScreenSize);
        };
    }, []);

    // 保存消息到后端和本地存储
    useEffect(() => {
        if (messages.length > 0) {
            // 使用chatSessionService保存到后端，同时会保存到本地存储
            chatSessionService.saveSessionMessages(sessionId, messages, {
                projectId: currentProjectId,
                agentId: selectedAgentId,
                mode
            }).catch(error => {
                console.error('保存消息到后端失败，已保存到本地存储:', error);
            });
        }
    }, [messages, sessionId, currentProjectId, selectedAgentId, mode]);

    // 切换项目
    const switchProject = async (projectId: string) => {
        try {
            // 保存当前会话消息到后端
            await chatSessionService.saveSessionMessages(sessionId, messages, {
                projectId: currentProjectId,
                agentId: selectedAgentId,
                mode
            });

            setCurrentProjectId(projectId);
            setShowProjectDropdown(false);

            // 尝试从后端获取该项目的最新会话
            const sessions = await chatSessionService.getSessions();
            const projectSessions = sessions.filter(s => s.projectId === projectId);

            if (projectSessions.length > 0) {
                // 按最后更新时间排序
                projectSessions.sort((a, b) =>
                    new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
                );

                const latestSession = projectSessions[0];

                // 获取会话消息
                const sessionMessages = await chatSessionService.getSessionMessages(latestSession.id);

                // 恢复会话状态
                setMessages(sessionMessages);
                if (latestSession.mode) setMode(latestSession.mode as 'orchestrated' | 'direct');
                if (latestSession.agentId) setSelectedAgentId(latestSession.agentId);
            } else {
                // 如果没有历史会话，创建新会话
                const newSession = await chatSessionService.createSession({
                    projectId,
                    mode: 'orchestrated',
                    title: `项目: ${projectsData[projectId].name}`
                });

                if (newSession) {
                    setMessages(newSession.messages);
                } else {
                    // 如果创建失败，使用默认欢迎消息
                    setMessages([{
                        id: `welcome_${Date.now()}`,
                        type: 'ai',
                        content: `您好！我是创业助手，正在为您的项目"${projectsData[projectId].name}"提供服务。请问需要什么帮助？`,
                        timestamp: new Date()
                    }]);
                }
            }
        } catch (error) {
            console.error('切换项目失败:', error);

            // 出错时回退到本地存储
            setCurrentProjectId(projectId);
            setShowProjectDropdown(false);

            // 尝试加载该项目的最新会话
            const latestSession = chatHistoryService.getLatestSessionForProject(projectId);

            if (latestSession) {
                // 如果找到了历史会话，恢复状态
                setMessages(latestSession.messages);
                if (latestSession.mode) setMode(latestSession.mode);
                if (latestSession.agentId) setSelectedAgentId(latestSession.agentId);
            } else {
                // 如果没有历史会话，设置默认欢迎消息
                setMessages([{
                    id: `welcome_${Date.now()}`,
                    type: 'ai',
                    content: `您好！我是创业助手，正在为您的项目"${projectsData[projectId].name}"提供服务。请问需要什么帮助？`,
                    timestamp: new Date()
                }]);
            }
        }
    };

    // 切换到历史会话
    const switchToSession = async (sessionId: string) => {
        try {
            // 保存当前会话到后端
            await chatSessionService.saveSessionMessages(sessionId, messages, {
                projectId: currentProjectId,
                agentId: selectedAgentId,
                mode
            });

            // 从后端加载选中的会话
            const sessionMessages = await chatSessionService.getSessionMessages(sessionId);

            // 获取会话元数据
            const sessions = await chatSessionService.getSessions();
            const session = sessions.find(s => s.id === sessionId);

            if (session) {
                // 恢复会话状态
                setMessages(sessionMessages);

                // 恢复会话相关设置
                if (session.mode) setMode(session.mode as 'orchestrated' | 'direct');
                if (session.agentId) setSelectedAgentId(session.agentId);
                if (session.projectId) setCurrentProjectId(session.projectId);

                // 重置其他状态
                setShowRequirementAnalysis(false);
                setCurrentQuery('');
                resetAnalysis();
                setClarificationQuestions([]);
            }
        } catch (error) {
            console.error('切换会话失败，使用本地存储:', error);

            // 出错时回退到本地存储
            // 加载选中的会话
            const session = chatHistoryService.getSession(sessionId);
            if (session) {
                // 恢复会话状态
                setMessages(session.messages);

                // 恢复会话相关设置
                if (session.mode) setMode(session.mode);
                if (session.agentId) setSelectedAgentId(session.agentId);
                if (session.projectId) setCurrentProjectId(session.projectId);

                // 重置其他状态
                setShowRequirementAnalysis(false);
                setCurrentQuery('');
                resetAnalysis();
                setClarificationQuestions([]);
            }
        }

        // 关闭会话历史抽屉
        setShowSessionHistory(false);
    };

    // 显示页面
    const showPage = (page: PageType) => {
        setCurrentPage(page);
    };

    // 渲染智能体网格
    const renderAgentsGrid = (category: string) => {
        let categoryData = category === 'all'
            ? Object.values(agentsData).flat()
            : agentsData[category as keyof typeof agentsData] || [];

        // 应用搜索过滤
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            categoryData = categoryData.filter(agent =>
                agent.name.toLowerCase().includes(query) ||
                agent.description.toLowerCase().includes(query) ||
                agent.tags.some(tag => tag.toLowerCase().includes(query))
            );
        }

        // 如果没有搜索结果，显示提示
        if (searchQuery.trim() && categoryData.length === 0) {
            return (
                <div className="agents-container">
                    <div className="search-no-results">
                        <div className="no-results-icon">🔍</div>
                        <h3>未找到匹配的智能体</h3>
                        <p>尝试使用不同的关键词，或者点击"智能分析"让AI为您推荐合适的智能体</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="agents-container">
                {categoryData.map((agent) => (
                    <div
                        key={agent.id}
                        className={`agent-card ${selectedAgentId === agent.id ? 'selected' : ''}`}
                        onClick={() => selectAgent(agent)}
                    >
                        <div className="agent-icon">{agent.icon}</div>
                        <div className="agent-name">
                            <span className={`status-indicator status-${agent.status}`}></span>
                            {agent.name}
                        </div>
                        <div className="agent-description">{agent.description}</div>
                        <div className="agent-tags">
                            {agent.tags.map(tag => (
                                <span key={tag} className="agent-tag">{tag}</span>
                            ))}
                        </div>
                        <div className="agent-stats">
                            <span>{agent.usage}</span>
                            <span>⭐ {agent.rating}</span>
                        </div>
                        <div className="agent-actions">
                            <button
                                className="agent-action-btn workflow-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // 使用agent对象而不是尝试转换类型
                                    const workflowMessage: Message = {
                                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                        type: 'system',
                                        content: `已将${agent.name}添加到工作流`,
                                        timestamp: new Date()
                                    };
                                    setMessages(prev => [...prev, workflowMessage]);

                                    // 如果当前是直接模式，提示用户但不切换模式
                                    if (mode === 'direct') {
                                        const infoMessage: Message = {
                                            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                            type: 'system',
                                            content: `智能体已添加到工作流，您可以继续在直接模式下对话，或切换到编排模式查看工作流`,
                                            timestamp: new Date()
                                        };
                                        setMessages(prev => [...prev, infoMessage]);
                                    }
                                }}
                            >
                                🔄 添加到工作流
                            </button>
                            <button
                                className="agent-action-btn chat-btn"
                                onClick={async (e) => {
                                    e.stopPropagation();

                                    // 创建消息
                                    const chatMessage: Message = {
                                        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                                        type: 'system',
                                        content: mode === 'orchestrated'
                                            ? `已切换到直接模式，正在与${agent.name}对话`
                                            : `正在与${agent.name}对话`,
                                        timestamp: new Date()
                                    };

                                    // 更新状态
                                    setMessages(prev => [...prev, chatMessage]);
                                    setSelectedAgentId(agent.id);
                                    setShowChatPanel(true);

                                    try {
                                        // 保存当前会话状态
                                        await chatSessionService.saveSessionMessages(sessionId, [...messages, chatMessage], {
                                            projectId: currentProjectId,
                                            agentId: agent.id,
                                            mode: mode === 'orchestrated' ? 'direct' : mode // 如果是编排模式，切换到直接模式
                                        });

                                        // 如果当前是编排模式，切换到直接模式
                                        if (mode === 'orchestrated') {
                                            // 清除需求分析相关状态
                                            setShowRequirementAnalysis(false);
                                            setCurrentQuery('');
                                            setAnalysisCompleted(false);
                                            resetAnalysis();
                                            setClarificationQuestions([]);

                                            // 切换模式
                                            setMode('direct');
                                        }
                                    } catch (error) {
                                        console.error('操作失败，使用本地存储:', error);
                                        // 出错时回退到本地存储
                                        chatHistoryService.saveMessages(sessionId, [...messages, chatMessage], {
                                            projectId: currentProjectId,
                                            agentId: agent.id,
                                            mode: mode === 'orchestrated' ? 'direct' : mode
                                        });

                                        // 如果当前是编排模式，仍然切换到直接模式
                                        if (mode === 'orchestrated') {
                                            setMode('direct');
                                        }
                                    }
                                }}
                            >
                                💬 {mode === 'orchestrated' ? '直接对话' : '开始对话'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // 处理智能体选择
    const handleAgentSelect = (agent: AgentInfo) => {
        if (mode === 'direct') {
            setSelectedAgentId(agent.id);
            setShowChatPanel(true);
            // 添加切换消息
            const switchMessage: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'system',
                content: `已切换到${agent.name}对话`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, switchMessage]);
        } else {
            setSelectedAgentId(agent.id);
        }
        console.log('选择智能体:', agent);
    };

    // 处理添加到工作流
    const handleAddToWorkflow = (agent: AgentInfo) => {
        if (mode === 'orchestrated') {
            console.log('添加智能体到工作流:', agent);
            const workflowMessage: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'system',
                content: `已将${agent.name}添加到工作流`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, workflowMessage]);
        }
    };

    // 处理直接对话
    const handleDirectChat = (agent: AgentInfo) => {
        setMode('direct');
        setSelectedAgentId(agent.id);
        setShowChatPanel(true);
        const chatMessage: Message = {
            id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'system',
            content: `正在与${agent.name}对话`,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, chatMessage]);
    };

    // 选择智能体（兼容旧版本）
    const selectAgent = async (agent: any) => {
        setSelectedAgentId(agent.id);
        console.log('选择智能体:', agent);

        try {
            // 保存当前会话状态到后端，更新选中的智能体
            await chatSessionService.saveSessionMessages(sessionId, messages, {
                projectId: currentProjectId,
                agentId: agent.id,
                mode
            });
        } catch (error) {
            console.error('保存智能体选择状态失败，使用本地存储:', error);

            // 出错时回退到本地存储
            chatHistoryService.saveMessages(sessionId, messages, {
                projectId: currentProjectId,
                agentId: agent.id,
                mode
            });
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

        // 检查当前模式，如果是直接模式则不处理分析结果
        if (mode !== 'orchestrated') {
            console.log('当前为直接模式，不处理分析结果');
            setShowRequirementAnalysis(false);
            return;
        }

        // 标记分析已完成
        setAnalysisCompleted(true);

        // 延迟隐藏需求分析组件，让用户看到结果
        const hideTimer = setTimeout(() => {
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
        let recommendationTimer: NodeJS.Timeout;
        if (result.recommendedAgents && result.recommendedAgents.length > 0) {
            recommendationTimer = setTimeout(() => {
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
        let nextStepsTimer: NodeJS.Timeout;
        if (result.nextSteps && result.nextSteps.length > 0) {
            nextStepsTimer = setTimeout(() => {
                const nextStepsMessage: Message = {
                    id: `nextsteps_${Date.now()}`,
                    type: 'ai',
                    content: `💡 建议的下一步：\n${result.nextSteps.slice(0, 3).map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, nextStepsMessage]);
            }, 1000);
        }

        // 清理函数
        return () => {
            clearTimeout(hideTimer);
            if (recommendationTimer) clearTimeout(recommendationTimer);
            if (nextStepsTimer) clearTimeout(nextStepsTimer);
        };
    };

    // 处理澄清需求
    const handleClarificationNeeded = (questions: any[]) => {
        setClarificationQuestions(questions);
        console.log('需要澄清的问题:', questions);
    };

    // 搜索智能体
    const searchAgents = (query: string) => {
        setSearchQuery(query);
        // TODO: 实现搜索逻辑
    };

    // 开始需求分析
    const startRequirementAnalysis = (query: string) => {
        // 只在编排模式下启动需求分析
        if (mode === 'orchestrated') {
            // 如果当前已经在分析中，则不重复启动
            if (showRequirementAnalysis && !analysisCompleted) {
                console.log('已有分析正在进行中，不重复启动');
                return;
            }

            setCurrentQuery(query);
            setAnalysisCompleted(false);
            setShowRequirementAnalysis(true);

            // 显示分析开始消息
            const analysisStartMessage: Message = {
                id: `analysis_start_${Date.now()}`,
                type: 'ai',
                content: '🔍 正在分析您的需求，请稍候...',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, analysisStartMessage]);
        } else {
            // 在直接模式下，提示用户选择智能体
            const aiResponse: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'ai',
                content: '您当前处于直接模式，请先选择一个具体的智能体进行对话。',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }
    };

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
    const handleModeSwitch = async (newMode: 'orchestrated' | 'direct') => {
        try {
            // 保存当前会话状态到后端
            await chatSessionService.saveSessionMessages(sessionId, messages, {
                projectId: currentProjectId,
                agentId: selectedAgentId,
                mode
            });

            setMode(newMode);
            setSelectedAgentId(undefined);
            setCurrentWorkflow(null);

            // 重要：清除需求分析相关状态，防止模式切换后仍执行之前的分析
            setShowRequirementAnalysis(false);
            setCurrentQuery('');
            setAnalysisCompleted(false);
            resetAnalysis();
            setClarificationQuestions([]);

            // 添加模式切换消息
            const switchMessage: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'system',
                content: `已切换到${newMode === 'orchestrated' ? '编排模式' : '直接模式'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, switchMessage]);

            // 考虑创建新会话
            // 如果需要为每个模式创建单独的会话，可以取消下面的注释
            /*
            // 创建新的会话
            const newSession = await chatSessionService.createSession({
                projectId: currentProjectId,
                mode: newMode,
                title: `${projectsData[currentProjectId].name} - ${newMode === 'orchestrated' ? '编排模式' : '直接模式'}`
            });
            
            if (newSession) {
                // 使用新会话ID
                setSessionId(newSession.id);
                // 添加模式切换消息到新会话
                await chatSessionService.saveSessionMessages(newSession.id, [switchMessage], {
                    projectId: currentProjectId,
                    mode: newMode
                });
            }
            */
        } catch (error) {
            console.error('模式切换失败，使用本地存储:', error);

            // 出错时回退到本地存储
            chatHistoryService.saveMessages(sessionId, messages, {
                projectId: currentProjectId,
                agentId: selectedAgentId,
                mode
            });

            setMode(newMode);
            setSelectedAgentId(undefined);
            setCurrentWorkflow(null);

            // 重要：清除需求分析相关状态，防止模式切换后仍执行之前的分析
            setShowRequirementAnalysis(false);
            setCurrentQuery('');
            setAnalysisCompleted(false);
            resetAnalysis();
            setClarificationQuestions([]);

            // 添加模式切换消息
            const switchMessage: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'system',
                content: `已切换到${newMode === 'orchestrated' ? '编排模式' : '直接模式'}`,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, switchMessage]);
        }
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
            // 确保在直接模式下不会触发需求分析
            if (mode === 'orchestrated') {
                // 重置之前的分析状态，防止重复分析
                resetAnalysis();
                setAnalysisCompleted(false);
                setShowRequirementAnalysis(false);

                await handleOrchestratedResponse(currentInput);
            } else {
                // 直接模式下确保不会显示需求分析
                setShowRequirementAnalysis(false);
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
            // 如果当前已经在分析中，则不重复启动分析
            if (showRequirementAnalysis) {
                console.log('已有分析正在进行中，不重复启动');
                return;
            }

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
            const processTimer = setTimeout(() => {
                const processMessage: Message = {
                    id: `analysis_process_${Date.now()}`,
                    type: 'ai',
                    content: '📊 正在评估项目复杂度和所需资源...',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, processMessage]);
            }, 1000);

            const agentTimer = setTimeout(() => {
                const agentMessage: Message = {
                    id: `analysis_agents_${Date.now()}`,
                    type: 'ai',
                    content: '🤖 正在匹配最适合的专业智能体...',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, agentMessage]);
            }, 2000);

            // 清理函数，防止组件卸载后仍执行
            return () => {
                clearTimeout(processTimer);
                clearTimeout(agentTimer);
            };

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

    // 处理直接模式响应 - 真正的流式输出
    const handleDirectResponse = async (userInput: string) => {
        try {
            if (selectedAgentId) {
                const agentName = agentService.getAgentById(selectedAgentId)?.name || '智能体';

                // 创建初始的AI响应消息
                const aiResponseId = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                const initialAiResponse: Message = {
                    id: aiResponseId,
                    type: 'ai',
                    content: `${agentName}正在分析中...`,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, initialAiResponse]);

                // 定义智能体格式化内容的标识符
                const AGENT_CONTENT_INDICATORS = ['📋', '🎨', '📊', '⚖️'];
                const hasFormattedContent = (content: string) => 
                    AGENT_CONTENT_INDICATORS.some(indicator => content.includes(indicator));

                // 流式进度回调函数 - 简化版本，基于当前消息内容累积
                const onProgress = (event: any) => {
                    const { type, data } = event;

                    setMessages(prev => prev.map(msg => {
                        if (msg.id === aiResponseId) {
                            let newContent = msg.content;

                            switch (type) {
                                case 'start':
                                    newContent = `${agentName}开始分析：${data.message || '正在启动...'}`;
                                    break;

                                case 'progress':
                                    const stage = data.stage || '';
                                    const message = data.message || '';

                                    // 如果有部分AI内容，实时解析和格式化显示
                                    if (data.partial_content) {
                                        const formattedContent = parseAndFormatStreamingContent(data.partial_content, selectedAgentId);
                                        newContent = `${agentName}分析中：[${stage}] ${message}\n\n${formattedContent}`;
                                    } else {
                                        // 只更新状态信息，保持现有的AI内容
                                        if (hasFormattedContent(newContent)) {
                                            // 保持格式化的AI内容，只更新状态行
                                            const contentLines = newContent.split('\n');
                                            const statusLine = `${agentName}分析中：[${stage}] ${message}`;
                                            const aiContentLines = contentLines.slice(2); // 跳过状态行和空行
                                            newContent = statusLine + '\n\n' + aiContentLines.join('\n');
                                        } else {
                                            newContent = `${agentName}分析中：[${stage}] ${message}`;
                                        }
                                    }
                                    break;

                                case 'stream':
                                    // 真正的流式显示 - 直接显示AI生成的格式化内容
                                    const accumulatedContent = data.accumulated_content || '';
                                    if (accumulatedContent.trim()) {
                                        newContent = `${agentName}分析中：[正在生成] 第${data.chunk_index}块内容\n\n${accumulatedContent}`;
                                    } else {
                                        newContent = `${agentName}分析中：[正在生成] 第${data.chunk_index}块内容`;
                                    }
                                    break;

                                case 'stream_complete':
                                    // 流式完成 - 显示最终内容
                                    const finalContent = data.final_content || '';
                                    if (finalContent.trim()) {
                                        newContent = `${agentName}分析完成！\n\n${finalContent}`;
                                    } else {
                                        newContent = `${agentName}分析完成！`;
                                    }
                                    break;

                                case 'result':
                                    // 后端已经不再发送result事件，这个case保留用于兼容性
                                    // 如果收到result事件，只更新状态不重复显示内容
                                    if (hasFormattedContent(newContent)) {
                                        // 保持现有格式化内容不变
                                        // newContent 保持不变
                                    } else {
                                        // 兼容旧版本或其他智能体
                                        newContent = `${agentName}的分析结果：\n\n${formatAgentResult(data.data, selectedAgentId)}`;
                                    }
                                    break;

                                case 'complete':
                                    // 保持当前内容不变，只在没有任何内容时才显示完成消息
                                    if (!hasFormattedContent(newContent)) {
                                        newContent = `${agentName}分析完成！\n\n${data.message || ''}`;
                                    }
                                    // 如果已经有格式化内容，保持不变
                                    break;

                                case 'error':
                                    newContent = `${agentName}分析出错：${data.error || '未知错误'}`;
                                    break;
                            }

                            return { ...msg, content: newContent };
                        }
                        return msg;
                    }));
                };

                // 调用流式智能体
                const result = await agentService.callAgentStream(selectedAgentId, userInput, projectContext, onProgress);

                // 只在流式更新失败时才手动更新（避免重复显示）
                if (!result.success) {
                    setMessages(prev => prev.map(msg => {
                        if (msg.id === aiResponseId) {
                            return {
                                ...msg,
                                content: `${agentName}分析失败：${result.error || '未知错误'}`
                            };
                        }
                        return msg;
                    }));
                }
                // 如果流式更新成功，不需要手动更新，因为内容已经通过onProgress实时更新了
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

    // 格式化智能体结果显示
    const formatAgentResult = (data: any, agentId: string): string => {
        try {
            switch (agentId) {
                case 'requirement_analysis':
                    return formatRequirementAnalysisResult(data);
                case 'business_canvas_agent':
                    return formatBusinessCanvasResult(data);
                case 'swot_analysis_agent':
                    return formatSWOTAnalysisResult(data);
                case 'policy_matching_agent':
                    return formatPolicyMatchingResult(data);
                case 'incubator_agent':
                    return formatIncubatorResult(data);
                default:
                    return JSON.stringify(data, null, 2);
            }
        } catch (error) {
            return JSON.stringify(data, null, 2);
        }
    };

    // 实时解析和格式化AI生成的JSON内容
    const parseAndFormatStreamingContent = (rawContent: string, agentId: string): string => {
        try {
            // 尝试提取JSON部分
            const jsonStart = rawContent.indexOf('{');
            const jsonEnd = rawContent.lastIndexOf('}') + 1;

            if (jsonStart === -1 || jsonEnd <= jsonStart) {
                // 如果没有找到完整JSON，显示原始内容但进行基本格式化
                return formatRawStreamingContent(rawContent, agentId);
            }

            const jsonStr = rawContent.substring(jsonStart, jsonEnd);

            // 尝试解析JSON
            const parsed = JSON.parse(jsonStr);

            // 根据智能体类型格式化
            switch (agentId) {
                case 'requirement_analysis':
                    return formatRequirementAnalysisStreaming(parsed);
                case 'business_canvas_agent':
                    return formatBusinessCanvasStreaming(parsed);
                default:
                    return formatGenericStreaming(parsed);
            }
        } catch (e) {
            // JSON解析失败，显示格式化的原始内容
            return formatRawStreamingContent(rawContent, agentId);
        }
    };

    // 格式化原始流式内容（当JSON不完整时）
    const formatRawStreamingContent = (content: string, agentId: string): string => {
        // 基本的内容清理和格式化
        let formatted = content
            .replace(/\n\s*\n/g, '\n\n') // 规范化换行
            .replace(/^\s+|\s+$/g, ''); // 去除首尾空白

        // 如果内容看起来像JSON的开始，添加提示
        if (formatted.includes('{') && formatted.includes('"')) {
            return `🤖 AI正在生成分析结果...\n\n📝 生成内容预览：\n${formatted}`;
        }

        return `🤖 AI正在思考中...\n\n${formatted}`;
    };

    // 流式格式化需求分析结果
    const formatRequirementAnalysisStreaming = (data: any): string => {
        let result = '📋 **需求分析结果**\n\n';

        // 项目概览
        if (data.project_overview) {
            result += `📊 **项目概览**\n`;
            if (data.project_overview.description) {
                result += `• 项目描述：${data.project_overview.description}\n`;
            }
            if (data.project_overview.category) {
                result += `• 项目分类：${data.project_overview.category}\n`;
            }
            if (data.project_overview.complexity) {
                result += `• 复杂度评估：${data.project_overview.complexity}\n`;
            }
            result += '\n';
        }

        // 功能需求
        if (data.functional_requirements?.length) {
            result += `⚙️ **功能需求**\n`;
            data.functional_requirements.forEach((req: string, index: number) => {
                result += `${index + 1}. ${req}\n`;
            });
            result += '\n';
        }

        // 非功能需求
        if (data.non_functional_requirements?.length) {
            result += `🔧 **非功能需求**\n`;
            data.non_functional_requirements.forEach((req: string, index: number) => {
                result += `${index + 1}. ${req}\n`;
            });
            result += '\n';
        }

        // 利益相关者
        if (data.stakeholders?.length) {
            result += `👥 **利益相关者**\n`;
            data.stakeholders.forEach((stakeholder: string, index: number) => {
                result += `${index + 1}. ${stakeholder}\n`;
            });
            result += '\n';
        }

        // 成功标准
        if (data.success_criteria?.length) {
            result += `🎯 **成功标准**\n`;
            data.success_criteria.forEach((criteria: string, index: number) => {
                result += `${index + 1}. ${criteria}\n`;
            });
            result += '\n';
        }

        // 风险和挑战
        if (data.risks_and_challenges?.length) {
            result += `⚠️ **风险和挑战**\n`;
            data.risks_and_challenges.forEach((risk: string, index: number) => {
                result += `${index + 1}. ${risk}\n`;
            });
            result += '\n';
        }

        // 专业建议
        if (data.recommendations?.length) {
            result += `💡 **专业建议**\n`;
            data.recommendations.forEach((rec: string, index: number) => {
                result += `${index + 1}. ${rec}\n`;
            });
            result += '\n';
        }

        return result;
    };

    // 流式格式化商业模式画布结果
    const formatBusinessCanvasStreaming = (data: any): string => {
        let result = '🎨 **商业模式画布分析**\n\n';

        const sections = [
            { key: 'value_propositions', title: '💎 价值主张', icon: '•' },
            { key: 'customer_segments', title: '👥 客户细分', icon: '•' },
            { key: 'channels', title: '📢 渠道通路', icon: '•' },
            { key: 'customer_relationships', title: '🤝 客户关系', icon: '•' },
            { key: 'revenue_streams', title: '💰 收入来源', icon: '•' },
            { key: 'key_resources', title: '🔑 核心资源', icon: '•' },
            { key: 'key_activities', title: '⚡ 关键业务', icon: '•' },
            { key: 'key_partners', title: '🤝 重要伙伴', icon: '•' },
            { key: 'cost_structure', title: '💸 成本结构', icon: '•' }
        ];

        sections.forEach(section => {
            if (data[section.key]?.length) {
                result += `${section.title}\n`;
                data[section.key].forEach((item: string) => {
                    result += `${section.icon} ${item}\n`;
                });
                result += '\n';
            }
        });

        return result;
    };

    // 通用流式格式化
    const formatGenericStreaming = (data: any): string => {
        let result = '📊 **分析结果**\n\n';

        Object.entries(data).forEach(([key, value]) => {
            if (Array.isArray(value) && value.length > 0) {
                result += `**${key.replace(/_/g, ' ').toUpperCase()}**\n`;
                value.forEach((item: any, index: number) => {
                    result += `${index + 1}. ${item}\n`;
                });
                result += '\n';
            } else if (typeof value === 'object' && value !== null) {
                result += `**${key.replace(/_/g, ' ').toUpperCase()}**\n`;
                Object.entries(value).forEach(([subKey, subValue]) => {
                    result += `• ${subKey}: ${subValue}\n`;
                });
                result += '\n';
            }
        });

        return result;
    };

    // 格式化需求分析结果（保留原有方法作为备用）
    const formatRequirementAnalysisResult = (data: any): string => {
        return formatRequirementAnalysisStreaming(data);
    };

    // 格式化商业模式画布结果
    const formatBusinessCanvasResult = (data: any): string => {
        if (!data) return '未获得分析结果';

        let result = '🎨 **商业模式画布分析**\n\n';

        const sections = [
            { key: 'value_propositions', title: '💎 价值主张', icon: '•' },
            { key: 'customer_segments', title: '👥 客户细分', icon: '•' },
            { key: 'channels', title: '📢 渠道通路', icon: '•' },
            { key: 'customer_relationships', title: '🤝 客户关系', icon: '•' },
            { key: 'revenue_streams', title: '💰 收入来源', icon: '•' },
            { key: 'key_resources', title: '🔑 核心资源', icon: '•' },
            { key: 'key_activities', title: '⚡ 关键业务', icon: '•' },
            { key: 'key_partners', title: '🤝 重要伙伴', icon: '•' },
            { key: 'cost_structure', title: '💸 成本结构', icon: '•' }
        ];

        sections.forEach(section => {
            if (data[section.key]?.length) {
                result += `${section.title}\n`;
                data[section.key].forEach((item: string) => {
                    result += `${section.icon} ${item}\n`;
                });
                result += '\n';
            }
        });

        return result || JSON.stringify(data, null, 2);
    };

    // 格式化SWOT分析结果
    const formatSWOTAnalysisResult = (data: any): string => {
        if (!data) return '未获得分析结果';

        let result = '⚖️ **SWOT分析结果**\n\n';

        const sections = [
            { key: 'strengths', title: '💪 优势 (Strengths)', icon: '✅' },
            { key: 'weaknesses', title: '⚠️ 劣势 (Weaknesses)', icon: '❌' },
            { key: 'opportunities', title: '🚀 机会 (Opportunities)', icon: '🔥' },
            { key: 'threats', title: '⚡ 威胁 (Threats)', icon: '⚠️' }
        ];

        sections.forEach(section => {
            if (data[section.key]?.length) {
                result += `${section.title}\n`;
                data[section.key].forEach((item: string) => {
                    result += `${section.icon} ${item}\n`;
                });
                result += '\n';
            }
        });

        return result || JSON.stringify(data, null, 2);
    };

    // 格式化政策匹配结果
    const formatPolicyMatchingResult = (data: any): string => {
        if (!data) return '未获得分析结果';
        return `📜 **政策匹配结果**\n\n${JSON.stringify(data, null, 2)}`;
    };

    // 格式化孵化器推荐结果
    const formatIncubatorResult = (data: any): string => {
        if (!data) return '未获得分析结果';
        return `🏢 **孵化器推荐结果**\n\n${JSON.stringify(data, null, 2)}`;
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

        // 检查当前模式，只在编排模式下进行需求分析
        if (mode === 'orchestrated') {
            // 基于回答重新分析需求
            const updatedQuery = `${currentQuery}\n\n补充信息：${answer}`;
            setCurrentQuery(updatedQuery);

            // 重置分析状态，避免重复分析
            setAnalysisCompleted(false);
            await analyzeRequirement(updatedQuery, 'full');
        } else {
            // 在直接模式下，简单回复用户
            const aiResponse: Message = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'ai',
                content: '谢谢您的回答。在直接模式下，请选择一个具体的智能体进行对话。',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiResponse]);
        }
    };

    // 渲染页面内容
    const renderPageContent = () => {
        const currentProject = projectsData[currentProjectId];

        if (currentPage.startsWith('agents-')) {
            const category = currentPage.replace('agents-', '');
            const titles = {
                analysis: { title: '分析类智能体', desc: '专业的数据分析和需求评估智能体' },
                business: { title: '商业类智能体', desc: '商业模式和计划制定专业智能体' },
                strategy: { title: '策略类智能体', desc: '增长和营销策略制定专业智能体' },
                tools: { title: '工具类智能体', desc: '实用的创业工具和资源对接智能体' },
                all: { title: '全部智能体', desc: '所有可用的创业专业智能体' }
            };

            return (
                <>
                    <div className="page-header">
                        <div>
                            <h1 className="page-title">{titles[category as keyof typeof titles]?.title}</h1>
                            <p className="page-description">{titles[category as keyof typeof titles]?.desc}</p>
                        </div>
                    </div>
                    <div className="agents-grid">
                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="搜索智能体或描述您的需求..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && searchQuery.trim()) {
                                        startRequirementAnalysis(searchQuery.trim());
                                    }
                                }}
                            />
                            {searchQuery.trim() && (
                                <button
                                    className="search-analyze-btn"
                                    onClick={() => startRequirementAnalysis(searchQuery.trim())}
                                >
                                    🔍 智能分析
                                </button>
                            )}
                        </div>

                        {/* 需求分析组件 */}
                        {showRequirementAnalysis && currentQuery && (
                            <div className="requirement-analysis-section">
                                <RequirementAnalysis
                                    query={currentQuery}
                                    onAnalysisComplete={handleAnalysisComplete}
                                    onClarificationNeeded={handleClarificationNeeded}
                                />
                            </div>
                        )}

                        {/* 智能体容器 */}
                        <div className="agents-scroll-container">
                            {/* 使用新的卡片样式智能体网格 */}
                            {renderAgentsGrid(category)}
                        </div>
                    </div>
                </>
            );
        }

        // 项目管理页面
        switch (currentPage) {
            case 'workspace':
                return (
                    <>
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">所有项目</h1>
                                <p className="page-description">管理您的所有创业项目</p>
                            </div>
                        </div>
                        <div className="workspace-content">
                            <div className="workspace-header">
                                <div className="workspace-stats">
                                    <div className="stat-item">
                                        <div className="stat-number">{Object.keys(projectsData).length}</div>
                                        <div className="stat-label">总项目数</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">{Object.values(projectsData).filter(p => p.status === '进行中').length}</div>
                                        <div className="stat-label">进行中</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">{Object.values(projectsData).filter(p => p.status === '已完成').length}</div>
                                        <div className="stat-label">已完成</div>
                                    </div>
                                    <div className="stat-item">
                                        <div className="stat-number">{Object.values(projectsData).reduce((sum, p) => sum + p.team, 0)}</div>
                                        <div className="stat-label">团队成员</div>
                                    </div>
                                </div>
                                <div className="workspace-actions">
                                    <button className="btn-secondary" onClick={() => showPage('agents-analysis')}>🤖 智能分析</button>
                                    <button className="btn-primary">+ 新建项目</button>
                                </div>
                            </div>
                            <div className="projects-grid">
                                {Object.values(projectsData).map(project => (
                                    <div key={project.id} className={`project-card ${project.id === currentProjectId ? 'current' : ''}`}>
                                        <div className="project-card-header">
                                            <div className="project-card-icon">{project.icon}</div>
                                            <div className={`project-card-status ${project.status === '进行中' ? 'active' : project.status === '已完成' ? 'completed' : 'planning'}`}>
                                                {project.status}
                                            </div>
                                        </div>
                                        <div className="project-card-content">
                                            <h3 className="project-card-title">{project.name}</h3>
                                            <p className="project-card-description">{project.description}</p>
                                            <div className="project-card-progress">
                                                <div className="progress-bar">
                                                    <div className="progress-fill" style={{ width: `${project.progress}%` }}></div>
                                                </div>
                                                <span className="progress-text">{project.progress}% 完成</span>
                                            </div>
                                        </div>
                                        <div className="project-card-footer">
                                            <div className="project-card-meta">
                                                <span>👥 {project.team}人</span>
                                                <span>📅 {project.lastActive}</span>
                                            </div>
                                            <div className="project-card-actions">
                                                <button className="btn-secondary">编辑</button>
                                                <button className="btn-primary" onClick={() => switchProject(project.id)}>打开</button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                );
            case 'dashboard':
                return (
                    <>
                        <div className="page-header">
                            <div>
                                <h1 className="page-title">项目概览</h1>
                                <p className="page-description">查看 {currentProject?.name} 的整体进度和关键指标</p>
                            </div>
                        </div>
                        <div className="dashboard-content">
                            <div className="dashboard-grid">
                                <div className="dashboard-card">
                                    <h3>📊 项目进度</h3>
                                    <div className="progress-bar">
                                        <div className="progress-fill" style={{ width: `${currentProject?.progress}%` }}></div>
                                    </div>
                                    <p>{currentProject?.progress}% 完成</p>
                                </div>
                                <div className="dashboard-card">
                                    <h3>✅ 任务状态</h3>
                                    <div className="task-stats">
                                        <div>待处理: 5</div>
                                        <div>进行中: 3</div>
                                        <div>已完成: 12</div>
                                    </div>
                                </div>
                                <div className="dashboard-card">
                                    <h3>🤖 智能体使用</h3>
                                    <div className="agent-usage">
                                        <div>本周使用: 15次</div>
                                        <div>最常用: 需求分析智能体</div>
                                    </div>
                                </div>
                                <div className="dashboard-card">
                                    <h3>👥 团队成员</h3>
                                    <div className="team-info">
                                        <div>团队规模: {currentProject?.team}人</div>
                                        <div>活跃成员: {currentProject?.team}人</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                );
            default:
                return (
                    <div className="page-header">
                        <h1 className="page-title">功能开发中</h1>
                        <p className="page-description">该功能正在开发中，敬请期待</p>
                    </div>
                );
        }
    };

    const currentProject = projectsData[currentProjectId];

    return (
        <div className="agent-workspace">
            <ResizablePanel
                key={showChatPanel ? 'three-panel' : 'two-panel'}
                direction="horizontal"
                initialSizes={showChatPanel ? [20, 55, 25] : [20, 80]}
                minSizes={showChatPanel ? [20, 35, 20] : [20, 80]}
                maxSizes={showChatPanel ? [32, 60, 40] : [32, 80]}
                className="w-full h-full"
            >
                {/* 左侧导航栏 */}
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h2>创业星球</h2>
                        <div className="project-selector">
                            <div className="current-project" onClick={() => setShowProjectDropdown(!showProjectDropdown)}>
                                <div className="project-info">
                                    <div className="project-name">{currentProject?.name}</div>
                                    <div className="project-status">{currentProject?.status} • {currentProject?.progress}% 完成</div>
                                </div>
                                <div className="dropdown-arrow">
                                    {showProjectDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </div>
                            {showProjectDropdown && (
                                <div className="project-dropdown">
                                    <div className="project-list">
                                        {Object.values(projectsData).map(project => (
                                            <div
                                                key={project.id}
                                                className={`project-item ${project.id === currentProjectId ? 'active' : ''}`}
                                                onClick={() => switchProject(project.id)}
                                            >
                                                <div className="project-icon">{project.icon}</div>
                                                <div className="project-details">
                                                    <div className="project-name">{project.name}</div>
                                                    <div className="project-meta">{project.status} • {project.team}人团队</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="project-actions">
                                        <button className="btn-secondary" onClick={() => showPage('workspace')}>📋 所有项目</button>
                                        <button className="btn-primary">+ 新建项目</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 主要功能导航 */}
                    <nav className="sidebar-nav">
                        <div className="nav-section">
                            <div className="nav-section-title">工作台</div>
                            <button
                                className={`nav-item ${currentPage === 'workspace' ? 'active' : ''}`}
                                onClick={() => showPage('workspace')}
                            >
                                <Home className="nav-item-icon" size={16} />
                                <span className="nav-item-text">所有项目</span>
                                <span className="nav-item-count">3</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                                onClick={() => showPage('dashboard')}
                            >
                                <Home className="nav-item-icon" size={16} />
                                <span className="nav-item-text">当前项目</span>
                            </button>
                        </div>

                        <div className="nav-section">
                            <div className="nav-section-title">项目管理</div>
                            <button
                                className={`nav-item ${currentPage === 'tasks' ? 'active' : ''}`}
                                onClick={() => showPage('tasks')}
                            >
                                <CheckSquare className="nav-item-icon" size={16} />
                                <span className="nav-item-text">任务管理</span>
                                <span className="nav-item-count">5</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'documents' ? 'active' : ''}`}
                                onClick={() => showPage('documents')}
                            >
                                <FileText className="nav-item-icon" size={16} />
                                <span className="nav-item-text">文档管理</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'timeline' ? 'active' : ''}`}
                                onClick={() => showPage('timeline')}
                            >
                                <Calendar className="nav-item-icon" size={16} />
                                <span className="nav-item-text">项目时间线</span>
                            </button>
                        </div>

                        <div className="nav-section">
                            <div className="nav-section-title">智能体助手</div>
                            <button
                                className={`nav-item ${currentPage === 'agents-analysis' ? 'active' : ''}`}
                                onClick={() => showPage('agents-analysis')}
                            >
                                <BarChart3 className="nav-item-icon" size={16} />
                                <span className="nav-item-text">分析类</span>
                                <span className="nav-item-count">4</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'agents-business' ? 'active' : ''}`}
                                onClick={() => showPage('agents-business')}
                            >
                                <Briefcase className="nav-item-icon" size={16} />
                                <span className="nav-item-text">商业类</span>
                                <span className="nav-item-count">3</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'agents-strategy' ? 'active' : ''}`}
                                onClick={() => showPage('agents-strategy')}
                            >
                                <Target className="nav-item-icon" size={16} />
                                <span className="nav-item-text">策略类</span>
                                <span className="nav-item-count">2</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'agents-tools' ? 'active' : ''}`}
                                onClick={() => showPage('agents-tools')}
                            >
                                <Wrench className="nav-item-icon" size={16} />
                                <span className="nav-item-text">工具类</span>
                                <span className="nav-item-count">3</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'agents-all' ? 'active' : ''}`}
                                onClick={() => showPage('agents-all')}
                            >
                                <Star className="nav-item-icon" size={16} />
                                <span className="nav-item-text">全部智能体</span>
                                <span className="nav-item-count">12</span>
                            </button>
                        </div>

                        <div className="nav-section">
                            <div className="nav-section-title">协作与设置</div>
                            <button
                                className={`nav-item ${currentPage === 'team' ? 'active' : ''}`}
                                onClick={() => showPage('team')}
                            >
                                <Users className="nav-item-icon" size={16} />
                                <span className="nav-item-text">团队协作</span>
                            </button>
                            <button
                                className={`nav-item ${currentPage === 'settings' ? 'active' : ''}`}
                                onClick={() => showPage('settings')}
                            >
                                <Settings className="nav-item-icon" size={16} />
                                <span className="nav-item-text">项目设置</span>
                            </button>
                        </div>
                    </nav>
                </div>

                {/* 主内容区 */}
                <div className="main-content">
                    {/* 右侧面板切换按钮 */}
                    <button
                        className={`chat-panel-toggle ${showChatPanel ? 'panel-open' : 'panel-closed'}`}
                        onClick={() => setShowChatPanel(!showChatPanel)}
                        title={showChatPanel ? '隐藏对话面板' : '显示对话面板'}
                    >
                        {showChatPanel ? <ChevronRight size={20} /> : <Bot size={20} />}
                        {/* 通知指示器 */}
                        {!showChatPanel && selectedAgentId && (
                            <span className="chat-panel-notification"></span>
                        )}
                    </button>

                    {renderPageContent()}
                </div>

                {/* 右侧对话区 - 条件渲染 */}
                {showChatPanel && (
                    <div className="chat-panel">
                        {/* 1. 模式切换区域 */}
                        <div className="chat-mode-header">
                            <div className="mode-buttons">
                                <button
                                    onClick={() => handleModeSwitch('orchestrated')}
                                    className={`mode-btn ${mode === 'orchestrated' ? 'active orchestrated' : ''}`}
                                >
                                    <span className={`mode-indicator ${mode === 'orchestrated' ? 'active' : ''}`} />
                                    🎯 编排模式
                                </button>
                                <button
                                    onClick={() => handleModeSwitch('direct')}
                                    className={`mode-btn ${mode === 'direct' ? 'active direct' : ''}`}
                                >
                                    <span className={`mode-indicator ${mode === 'direct' ? 'active' : ''}`} />
                                    💬 直接模式
                                </button>
                            </div>
                            <div className="mode-status">
                                <span className="status-text">
                                    {mode === 'orchestrated' ? '多智能体协同' : selectedAgentId ? '专业对话中' : '选择智能体'}
                                </span>
                                <div className="chat-header-actions">
                                    <button
                                        className="chat-history-btn"
                                        onClick={() => setShowSessionHistory(true)}
                                        title="查看历史会话"
                                    >
                                        <Clock size={14} />
                                    </button>
                                    <button className="chat-settings-btn" title="设置">
                                        <Settings size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 2. 对话头部 */}
                        {mode === 'direct' && selectedAgentId && (
                            <div className="chat-agent-header">
                                <div className="agent-info">
                                    <Bot size={16} />
                                    <span className="agent-name">
                                        正在与 {agentsData.analysis.find(a => a.id === selectedAgentId)?.name ||
                                            agentsData.business.find(a => a.id === selectedAgentId)?.name ||
                                            agentsData.strategy.find(a => a.id === selectedAgentId)?.name ||
                                            agentsData.tools.find(a => a.id === selectedAgentId)?.name || 'AI智能体'} 对话
                                    </span>
                                </div>
                                <button
                                    onClick={() => handleModeSwitch('orchestrated')}
                                    className="switch-mode-btn"
                                >
                                    [切换模式]
                                </button>
                            </div>
                        )}

                        {/* 3. 消息列表 */}
                        <div className="chat-messages">
                            {/* 欢迎信息 */}
                            {messages.length === 0 && (
                                <div className="chat-welcome">
                                    <Bot size={48} />
                                    <h3>
                                        {mode === 'orchestrated' ? '🎯 多智能体编排模式' : '💬 直接对话模式'}
                                    </h3>
                                    <p>
                                        {mode === 'orchestrated'
                                            ? '我可以协调多个专业智能体为您服务，自动创建工作流完成复杂任务'
                                            : selectedAgentId
                                                ? `正在与专业智能体进行一对一对话`
                                                : '请从智能体目录中选择一个专业智能体开始深度对话'
                                        }
                                    </p>
                                    <div className="mode-features">
                                        <h4>✨ {mode === 'orchestrated' ? '编排模式' : '直接模式'}特性:</h4>
                                        <ul>
                                            {mode === 'orchestrated' ? (
                                                <>
                                                    <li>• 智能任务分解和智能体调度</li>
                                                    <li>• 实时工作流进度可视化</li>
                                                    <li>• 多智能体协同工作</li>
                                                    <li>• 自动结果合成和优化</li>
                                                </>
                                            ) : (
                                                <>
                                                    <li>• 与专业智能体一对一深度对话</li>
                                                    <li>• 专业领域深度分析和建议</li>
                                                    <li>• 连续对话保持上下文</li>
                                                    <li>• 个性化专业指导</li>
                                                </>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            )}

                            {/* 消息列表 */}
                            {messages.map(message => (
                                <div key={message.id} className={`message ${message.type}`}>
                                    <div className="message-content">
                                        {(message.type === 'agent' && message.agentName) && (
                                            <div className="agent-header">
                                                <Bot size={16} />
                                                <span className="agent-name">{message.agentName}</span>
                                            </div>
                                        )}
                                        <p className="message-text">{message.content}</p>
                                        <p className="message-time">
                                            {typeof message.timestamp === 'object' && message.timestamp instanceof Date
                                                ? message.timestamp.toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : typeof message.timestamp === 'string'
                                                    ? new Date(message.timestamp).toLocaleTimeString([], {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })
                                                    : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}

                            {/* 正在输入指示器 */}
                            {isTyping && (
                                <div className="message ai">
                                    <div className="message-content typing">
                                        <div className="typing-indicator">
                                            <Bot size={16} />
                                            <span>正在处理中</span>
                                            <div className="typing-dots">
                                                <div className="dot" />
                                                <div className="dot" />
                                                <div className="dot" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 澄清问题 */}
                            {clarificationQuestions.length > 0 && (
                                <div className="clarification-questions">
                                    <h4>请回答以下问题以获得更好的帮助：</h4>
                                    {clarificationQuestions.map((q, index) => (
                                        <div key={index} className="clarification-item">
                                            <p className="question">{q.question}</p>
                                            <p className="purpose">{q.purpose}</p>
                                            <input
                                                type="text"
                                                placeholder="请输入您的回答..."
                                                className="clarification-input"
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
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* 4. 输入区域 */}
                        <div className="chat-input-area">
                            <div className="input-row">
                                <input
                                    type="text"
                                    value={inputMessage}
                                    onChange={(e) => setInputMessage(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder={
                                        mode === 'orchestrated'
                                            ? "描述您的需求，我会协调多个智能体为您服务..."
                                            : selectedAgentId
                                                ? `与专业智能体对话...`
                                                : "请先选择一个智能体开始专业对话..."
                                    }
                                    className="message-input"
                                />
                                <button className="input-btn" title="附件">
                                    <Paperclip size={16} />
                                </button>
                                <button className="input-btn" title="语音">
                                    <Mic size={16} />
                                </button>
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputMessage.trim() || isTyping}
                                    className="send-btn"
                                    title="发送"
                                >
                                    <Send size={16} />
                                </button>
                            </div>

                            {/* 建议提示 */}
                            <div className="suggestions">
                                <span className="suggestions-label">💡 建议:</span>
                                <div className="suggestions-list">
                                    {suggestions.slice(0, 3).map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => setInputMessage(suggestion)}
                                            className="suggestion-btn"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ResizablePanel>

            {/* 会话历史抽屉 */}
            {showSessionHistory && (
                <SessionHistoryDrawer
                    isOpen={showSessionHistory}
                    onClose={() => setShowSessionHistory(false)}
                    onSelectSession={switchToSession}
                    currentSessionId={sessionId}
                />
            )}
        </div>
    );
};

export default AgentWorkspace;