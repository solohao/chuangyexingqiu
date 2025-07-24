import React, { useState } from 'react';
import { Bot, Terminal } from 'lucide-react';
import ProjectSidebar from './components/ProjectSidebar';
import StartupDashboard from './components/StartupDashboard';
import AIAssistant from './components/AIAssistant';

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
  const [showTerminal, setShowTerminal] = useState(true);

  const handleSelectProject = (project: Project) => {
    setSelectedProject(project);
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="h-screen flex bg-gray-100">
      {/* 左侧边栏 - 项目文件树 */}
      <ProjectSidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        selectedProject={selectedProject}
        onSelectProject={handleSelectProject}
      />

      {/* 主内容区 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部标签栏 */}
        {selectedProject && (
          <div className="bg-white border-b border-gray-200 px-4 py-2">
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
          </div>
        )}

        {/* 主编辑区和AI助手 */}
        <div className="flex-1 flex">
          {/* 主编辑区 */}
          <div className="flex-1 bg-white overflow-y-auto">
            {selectedProject ? (
              <div>
                {activeTab === 'overview' && (
                  <StartupDashboard project={selectedProject} />
                )}
                {activeTab === 'team' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">团队管理</h2>
                    <p className="text-gray-500">团队管理功能开发中...</p>
                  </div>
                )}
                {activeTab === 'tasks' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">任务管理</h2>
                    <p className="text-gray-500">任务管理功能开发中...</p>
                  </div>
                )}
                {activeTab === 'analytics' && (
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-4">数据分析</h2>
                    <p className="text-gray-500">数据分析功能开发中...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Bot className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h2 className="text-xl font-medium mb-2">欢迎使用创业Agent</h2>
                  <p className="text-gray-400">选择一个项目开始管理，或创建新项目</p>
                  <div className="mt-6 space-y-2 text-sm text-gray-400">
                    <p>💡 智能项目分析和建议</p>
                    <p>📊 实时进度跟踪</p>
                    <p>🤖 AI驱动的项目管理</p>
                    <p>👥 团队协作工具</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 右侧AI助手面板 */}
          <AIAssistant projectId={selectedProject?.id} />
        </div>

        {/* 底部终端/日志 */}
        {showTerminal && (
          <div className="h-32 bg-gray-900 text-white border-t border-gray-700">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Terminal className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm text-gray-300">操作日志</span>
                </div>
                <button
                  onClick={() => setShowTerminal(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
              <div className="text-xs text-gray-300 font-mono space-y-1 overflow-y-auto">
                <div>[2024-01-24 10:30] 项目"{selectedProject?.name || '智能家居APP'}"状态更新为进行中</div>
                <div>[2024-01-24 10:25] 新增团队成员：张三</div>
                <div>[2024-01-24 10:20] 创建新任务：前端界面设计</div>
                <div>[2024-01-24 10:15] AI助手提供了3条优化建议</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPage; 