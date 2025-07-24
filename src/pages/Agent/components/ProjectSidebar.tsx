import React, { useState } from 'react';
import { 
  FolderOpen, 
  FileText, 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Play,
  Pause,
  Square,
  Eye,
  Users
} from 'lucide-react';

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

interface ProjectSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  selectedProject: Project | null;
  onSelectProject: (project: Project) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  selectedProject,
  onSelectProject
}) => {
  const [expandedSections, setExpandedSections] = useState({
    owned: true,
    participated: true,
    watching: false
  });

  const projects: Project[] = [
    { id: '1', name: '智能家居APP', status: 'active', type: 'owned', progress: 75, stage: 'validation', health: 'good', teamCompletion: 80, fundingStatus: 60, marketValidation: 70 },
    { id: '2', name: '电商平台项目', status: 'active', type: 'owned', progress: 45, stage: 'idea', health: 'warning', teamCompletion: 40, fundingStatus: 30, marketValidation: 20 },
    { id: '3', name: '区块链钱包', status: 'paused', type: 'owned', progress: 30, stage: 'idea', health: 'critical', teamCompletion: 30, fundingStatus: 10, marketValidation: 15 },
    { id: '4', name: 'AI写作助手', status: 'active', type: 'participated', progress: 60, stage: 'growth', health: 'excellent', teamCompletion: 90, fundingStatus: 80, marketValidation: 85 },
    { id: '5', name: '在线教育平台', status: 'completed', type: 'participated', progress: 100, stage: 'expansion', health: 'excellent', teamCompletion: 100, fundingStatus: 100, marketValidation: 95 },
    { id: '6', name: '健康管理APP', status: 'active', type: 'watching', progress: 20, stage: 'idea', health: 'good', teamCompletion: 25, fundingStatus: 15, marketValidation: 10 },
  ];

  const getProjectsByType = (type: Project['type']) => 
    projects.filter(p => p.type === type);

  const getStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active': return <Play className="w-3 h-3 text-green-500" />;
      case 'paused': return <Pause className="w-3 h-3 text-yellow-500" />;
      case 'completed': return <Square className="w-3 h-3 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: Project['type']) => {
    switch (type) {
      case 'owned': return <FileText className="w-4 h-4" />;
      case 'participated': return <Users className="w-4 h-4" />;
      case 'watching': return <Eye className="w-4 h-4" />;
    }
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderProjectSection = (
    title: string, 
    type: Project['type'], 
    sectionKey: keyof typeof expandedSections
  ) => {
    const sectionProjects = getProjectsByType(type);
    const isExpanded = expandedSections[sectionKey];

    return (
      <div className="mb-4">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full flex items-center justify-between p-2 text-xs text-gray-400 uppercase tracking-wide hover:text-gray-300"
        >
          <span>{title} ({sectionProjects.length})</span>
          {isExpanded ? 
            <ChevronDown className="w-3 h-3" /> : 
            <ChevronRight className="w-3 h-3" />
          }
        </button>
        
        {isExpanded && (
          <div className="space-y-1">
            {sectionProjects.map(project => (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`p-2 rounded cursor-pointer text-sm transition-colors ${
                  selectedProject?.id === project.id 
                    ? 'bg-blue-600 text-white' 
                    : 'hover:bg-gray-800 text-gray-300'
                }`}
              >
                <div className="flex items-center">
                  {getTypeIcon(type)}
                  <span className="ml-2 flex-1 truncate">{project.name}</span>
                  {getStatusIcon(project.status)}
                </div>
                <div className="ml-6 mt-1">
                  <div className="flex items-center text-xs">
                    <div className="flex-1 bg-gray-700 rounded-full h-1">
                      <div 
                        className="bg-blue-500 h-1 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="ml-2 text-gray-400">{project.progress}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      collapsed ? 'w-12' : 'w-64'
    }`}>
      {/* 头部 */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="font-semibold text-gray-200">项目管理器</h2>
          )}
          <button 
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            title={collapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!collapsed && (
        <div className="p-4 flex-1 overflow-y-auto">
          {/* 新建项目按钮 */}
          <div className="mb-6">
            <button className="w-full flex items-center justify-center p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              新建项目
            </button>
          </div>
          
          {/* 项目分类 */}
          {renderProjectSection("我的项目", "owned", "owned")}
          {renderProjectSection("参与项目", "participated", "participated")}
          {renderProjectSection("关注项目", "watching", "watching")}
        </div>
      )}
    </div>
  );
};

export default ProjectSidebar;