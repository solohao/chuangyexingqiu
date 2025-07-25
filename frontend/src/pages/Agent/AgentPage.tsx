import React, { useState } from 'react';
import { Bot, Terminal } from 'lucide-react';
import ProjectSidebar from './components/ProjectSidebar';
import StartupDashboard from './components/StartupDashboard';
import AIAssistant from './components/AIAssistant';
import ResizablePanel from '../../components/common/ResizablePanel';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  type: 'owned' | 'participated' | 'watching';
  progress: number;
  stage: 'idea' | 'validation' | 'growth' | 'expansion';
  health: 'excellent' | 'good' | 'warning' | 'critical';
  teamCompletion: number;
  fundingStatus: number;
  marketValidation: number;
}

const AgentPage: React.FC = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'team' | 'tasks' | 'analytics'>('overview');
  const [showTerminal, setShowTerminal] = useState(false);
  
  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="w-full flex bg-gray-100" style={{ height: 'calc(100vh - 80px)' }}>
      {/* 三列布局：项目管理器(20%) | 主内容区(55%) | AI助手(25%) */}
      <ResizablePanel
        direction="horizontal"
        initialSizes={sidebarCollapsed ? [5, 70, 25] : [20, 55, 25]}
        minSizes={[5, 30, 20]}
        maxSizes={[40, 70, 40]}
        className="w-full h-full"
        key={sidebarCollapsed ? 'collapsed' : 'expanded'}
      >
        {/* 左侧边栏 - 项目管理器 (20%) */}
        <div className="h-full">
          <ProjectSidebar
            collapsed={sidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
            selectedProject={selectedProject}
            onSelectProject={handleSelectProject}
          />
        </div>

        {/* 中间主内容区域 (55%) */}
        <div className="h-full flex flex-col">
          {/* 顶部标签栏 */}
          <div className="bg-white border-b border-gray-200 px-4 py-2 flex-shrink-0">
            {selectedProject ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-900">{selectedProject.name}</span>
                  <div className="flex space-x-1">
                    {(['overview', 'team', 'tasks', 'analytics'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          activeTab === tab 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'hover:bg-gray-100 text-gray-600'
                        }`}
                      >
                        {tab === 'overview' && '概述'}
                        {tab === 'team' && '团队'}
                        {tab === 'tasks' && '任务'}
                        {tab === 'analytics' && '分析'}
                      </button>
                    ))}
                  </div>
                </div>
                
                <button
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center"
                >
                  <Terminal className="w-4 h-4 mr-1" />
                  {showTerminal ? '隐藏' : '显示'}终端
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="font-medium text-gray-400">多智能体系统 - 请选择项目</span>
                </div>
                
                <button
                  onClick={() => setShowTerminal(!showTerminal)}
                  className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded flex items-center"
                >
                  <Terminal className="w-4 h-4 mr-1" />
                  {showTerminal ? '隐藏' : '显示'}终端
                </button>
              </div>
            )}
          </div>

          {/* 主编辑区 */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full bg-white overflow-y-auto">
              {selectedProject ? (
                <div className="h-full">
                  {activeTab === 'overview' && (
                    <StartupDashboard project={selectedProject} />
                  )}
                  {activeTab === 'team' && (
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">团队管理</h2>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-blue-900">AI团队协作助手</span>
                        </div>
                        <p className="text-sm text-blue-700">
                          智能体系统可以帮助您优化团队协作流程，分析团队效率，推荐最佳实践。
                        </p>
                      </div>
                      <p className="text-gray-500">团队管理功能开发中...</p>
                    </div>
                  )}
                  {activeTab === 'tasks' && (
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">任务管理</h2>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-5 h-5 text-green-600" />
                          <span className="font-medium text-green-900">AI任务规划助手</span>
                        </div>
                        <p className="text-sm text-green-700">
                          智能体可以帮助您自动分解任务，估算工期，分配资源，跟踪进度。
                        </p>
                      </div>
                      <p className="text-gray-500">任务管理功能开发中...</p>
                    </div>
                  )}
                  {activeTab === 'analytics' && (
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-4">数据分析</h2>
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Bot className="w-5 h-5 text-purple-600" />
                          <span className="font-medium text-purple-900">AI数据分析师</span>
                        </div>
                        <p className="text-sm text-purple-700">
                          专业的数据分析智能体可以为您提供深度的项目数据洞察和预测分析。
                        </p>
                      </div>
                      <p className="text-gray-500">数据分析功能开发中...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h2 className="text-xl font-medium mb-2">欢迎使用多智能体创业系统</h2>
                    <p className="text-gray-400 mb-6">选择一个项目开始智能协作，或创建新项目</p>
                    <div className="grid grid-cols-2 gap-4 max-w-md mx-auto text-sm text-gray-400">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="font-medium text-blue-600 mb-1">🤖 编排模式</div>
                        <div className="text-xs">多智能体协同工作</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="font-medium text-green-600 mb-1">💬 直接模式</div>
                        <div className="text-xs">与专业智能体一对一对话</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="font-medium text-purple-600 mb-1">📊 智能分析</div>
                        <div className="text-xs">AI驱动的项目洞察</div>
                      </div>
                      <div className="bg-yellow-50 p-3 rounded-lg">
                        <div className="font-medium text-yellow-600 mb-1">🔗 资源匹配</div>
                        <div className="text-xs">政策、资金、孵化器推荐</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 底部终端/日志 */}
          {showTerminal && (
            <div className="h-32 bg-white text-gray-900 border-t border-gray-200 flex-shrink-0">
              <div className="p-4 h-full">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Terminal className="w-4 h-4 mr-2 text-gray-600" />
                    <span className="text-sm text-gray-700">多智能体系统操作日志</span>
                  </div>
                  <button
                    onClick={() => setShowTerminal(false)}
                    className="text-gray-600 hover:text-gray-900 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="text-xs text-gray-700 font-mono space-y-1 overflow-y-auto h-20">
                  <div>[2024-12-29 14:30] 多智能体系统已初始化</div>
                  <div>[2024-12-29 14:29] 智能体目录加载完成 - 7个智能体可用</div>
                  <div>[2024-12-29 14:28] 项目"{selectedProject?.name || '智能家居APP'}"上下文已设置</div>
                  <div>[2024-12-29 14:27] 编排模式已激活，推荐系统运行中</div>
                  <div>[2024-12-29 14:26] 商业模式画布智能体准备就绪</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 右侧AI助手面板 - 多智能体系统 (25%) */}
        <div className="h-full bg-white border-l border-gray-200">
          <AIAssistant projectId={selectedProject?.id} />
        </div>
      </ResizablePanel>
    </div>
  );
};

export default AgentPage; 