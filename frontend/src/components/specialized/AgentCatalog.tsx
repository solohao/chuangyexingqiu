/**
 * 智能体目录组件
 * 显示可用智能体的分类列表，支持搜索和过滤
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Zap, Clock, TrendingUp, Flame, Info, Plus, MessageCircle, Circle, BarChart3, Star, Activity, Target, ChevronUp } from 'lucide-react';
import { agentService } from '../../services/agentService';
import { agentRegistry } from '../../services/agentRegistry.service';
import type { AgentInfo, AgentCategory } from '../../types/agents';
import type { ProjectContext } from '../../../../shared/types/agent.types';

interface AgentCatalogProps {
  mode: 'orchestrated' | 'direct';
  selectedAgentId?: string;
  onAgentSelect?: (agent: AgentInfo) => void;
  onAddToWorkflow?: (agent: AgentInfo) => void;
  onDirectChat?: (agent: AgentInfo) => void;
  projectContext?: ProjectContext;
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

/**
 * 智能体状态指示器组件
 */
const AgentStatusIndicator: React.FC<{ agent: AgentInfo }> = ({ agent }) => {
  const getStatusIcon = () => {
    if (agent.averageResponseTime < 2000) return <Zap className="w-3 h-3 text-yellow-500" />;
    if (agent.averageResponseTime < 5000) return <Clock className="w-3 h-3 text-blue-500" />;
    if (agent.isRecommended) return <TrendingUp className="w-3 h-3 text-green-500" />;
    if (agent.isPopular) return <Flame className="w-3 h-3 text-red-500" />;
    return null;
  };

  const getStatusText = () => {
    if (agent.averageResponseTime < 2000) return '⚡快速';
    if (agent.averageResponseTime < 5000) return '⏳中等';
    if (agent.isRecommended) return '📈推荐';
    if (agent.isPopular) return '🔥热门';
    return '';
  };

  const getTooltipText = () => {
    if (agent.averageResponseTime < 2000) return '快速响应';
    if (agent.averageResponseTime < 5000) return '中等响应';
    if (agent.isRecommended) return '推荐';
    if (agent.isPopular) return '热门';
    return '';
  };

  return (
    <div className="flex items-center gap-1 text-xs" title={getTooltipText()}>
      {getStatusIcon()}
      <span className="text-gray-500">{getStatusText()}</span>
    </div>
  );
};

/**
 * 智能体卡片组件
 */
const AgentCard: React.FC<{
  agent: AgentInfo;
  mode: 'orchestrated' | 'direct';
  isSelected?: boolean;
  onSelect?: (agent: AgentInfo) => void;
  onAddToWorkflow?: (agent: AgentInfo) => void;
  onDirectChat?: (agent: AgentInfo) => void;
  onShowDetails?: (agent: AgentInfo) => void;
}> = ({ agent, mode, isSelected, onSelect, onAddToWorkflow, onDirectChat, onShowDetails }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={`relative p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* 智能体基本信息 */}
      <div className="flex items-start gap-3">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
          style={{ backgroundColor: agent.color + '20', color: agent.color }}
        >
          {agent.icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">{agent.name}</h4>
            {mode === 'direct' && isSelected && (
              <Circle className="w-2 h-2 text-blue-500 fill-current" />
            )}
          </div>
          
          <p className="text-xs text-gray-600 line-clamp-2 mb-2">{agent.description}</p>
          
          <div className="flex items-center justify-between">
            <AgentStatusIndicator agent={agent} />
            <div className="flex items-center gap-1">
              <button
                onClick={() => onShowDetails?.(agent)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                title="详情"
              >
                <Info className="w-3 h-3" />
              </button>
            </div>
          </div>
          
          {/* 操作按钮区域 - 根据模式显示不同的按钮 */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            {mode === 'orchestrated' ? (
              // 编排模式：显示两个操作按钮
              <div className="flex gap-2">
                <button
                  onClick={() => onAddToWorkflow?.(agent)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors"
                  title="添加到工作流"
                >
                  <Plus className="w-3 h-3" />
                  添加到工作流
                </button>
                <button
                  onClick={() => onDirectChat?.(agent)}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs border border-gray-200 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                  title="直接对话"
                >
                  <MessageCircle className="w-3 h-3" />
                  直接对话
                </button>
              </div>
            ) : (
              // 直接模式：显示选择按钮
              <div className="flex">
                <button
                  onClick={() => {
                    onSelect?.(agent);
                    onDirectChat?.(agent);
                  }}
                  className={`flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded transition-colors ${
                    isSelected 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                  }`}
                  title={isSelected ? "当前选中的智能体" : "选择此智能体"}
                >
                  {isSelected ? (
                    <>
                      <Circle className="w-3 h-3 fill-current" />
                      当前对话
                    </>
                  ) : (
                    <>
                      <Circle className="w-3 h-3" />
                      选择对话
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 悬浮提示面板 */}
      {showTooltip && (
        <div className="absolute left-full top-0 ml-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{agent.icon}</span>
            <h5 className="font-medium text-gray-900">{agent.name}</h5>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">{agent.description}</p>
          
          <div className="space-y-2">
            <div>
              <h6 className="text-xs font-medium text-gray-700 mb-1">核心能力</h6>
              <div className="flex flex-wrap gap-1">
                {agent.capabilities.slice(0, 4).map((capability, index) => (
                  <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded">
                    {capability}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-500">响应时间:</span>
                <span className="ml-1 font-medium">{Math.round(agent.averageResponseTime / 1000)}s</span>
              </div>
              <div>
                <span className="text-gray-500">成功率:</span>
                <span className="ml-1 font-medium">{Math.round(agent.successRate * 100)}%</span>
              </div>
              <div>
                <span className="text-gray-500">用户评分:</span>
                <span className="ml-1 font-medium">{agent.userRating.toFixed(1)}/5</span>
              </div>
              <div>
                <span className="text-gray-500">使用次数:</span>
                <span className="ml-1 font-medium">{agent.usageCount}</span>
              </div>
            </div>
            
            {agent.examples.length > 0 && (
              <div>
                <h6 className="text-xs font-medium text-gray-700 mb-1">使用示例</h6>
                <p className="text-xs text-gray-600 italic">"{agent.examples[0]}"</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * 智能体分类组件
 */
const AgentCategorySection: React.FC<{
  category: AgentCategory;
  agents: AgentInfo[];
  isExpanded: boolean;
  onToggle: () => void;
  mode: 'orchestrated' | 'direct';
  selectedAgentId?: string;
  onAgentSelect?: (agent: AgentInfo) => void;
  onAddToWorkflow?: (agent: AgentInfo) => void;
  onDirectChat?: (agent: AgentInfo) => void;
  onShowDetails?: (agent: AgentInfo) => void;
  projectContext?: ProjectContext;
}> = ({ 
  category, 
  agents, 
  isExpanded, 
  onToggle, 
  mode, 
  selectedAgentId,
  onAgentSelect,
  onAddToWorkflow,
  onDirectChat,
  onShowDetails,
  projectContext
}) => {
  // 智能排序：推荐的智能体排在前面
  const sortedAgents = useMemo(() => {
    if (!projectContext) return agents;
    
    return [...agents].sort((a, b) => {
      // 推荐智能体权重
      const aRecommended = a.isRecommended ? 100 : 0;
      const bRecommended = b.isRecommended ? 100 : 0;
      
      // 热门智能体权重
      const aPopular = a.isPopular ? 50 : 0;
      const bPopular = b.isPopular ? 50 : 0;
      
      // 用户评分权重
      const aRating = a.userRating * 10;
      const bRating = b.userRating * 10;
      
      // 最近使用权重
      const aRecent = projectContext.recentAgentUsage.includes(a.id) ? 30 : 0;
      const bRecent = projectContext.recentAgentUsage.includes(b.id) ? 30 : 0;
      
      // 综合评分
      const aScore = aRecommended + aPopular + aRating + aRecent;
      const bScore = bRecommended + bPopular + bRating + bRecent;
      
      return bScore - aScore;
    });
  }, [agents, projectContext]);

  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{category.icon}</span>
          <div className="text-left">
            <h3 className="font-medium text-sm text-gray-900">{category.name}</h3>
            <p className="text-xs text-gray-500">{category.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{sortedAgents.length}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {sortedAgents.map((agent, index) => (
            <div key={agent.id} className="relative">
              {/* 智能推荐标识 */}
              {index === 0 && (agent.isRecommended || projectContext?.recentAgentUsage.includes(agent.id)) && (
                <div className="absolute -left-2 top-1/2 transform -translate-y-1/2">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-green-500 rounded-full" title="智能推荐"></div>
                </div>
              )}
              
              <AgentCard
                agent={agent}
                mode={mode}
                isSelected={selectedAgentId === agent.id}
                onSelect={onAgentSelect}
                onAddToWorkflow={onAddToWorkflow}
                onDirectChat={onDirectChat}
                onShowDetails={onShowDetails}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 智能体使用统计面板组件
 */
const AgentStatsPanel: React.FC<{
  isVisible: boolean;
  onClose: () => void;
  agents: AgentInfo[];
}> = ({ isVisible, onClose, agents }) => {
  if (!isVisible) return null;

  const sortedByUsage = [...agents].sort((a, b) => b.usageCount - a.usageCount).slice(0, 5);
  const sortedByRating = [...agents].sort((a, b) => b.userRating - a.userRating).slice(0, 5);
  const sortedBySpeed = [...agents].sort((a, b) => a.averageResponseTime - b.averageResponseTime).slice(0, 5);

  return (
    <div className="absolute inset-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          智能体使用统计
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-xl"
        >
          ×
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* 使用次数排行 */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
            <Activity className="w-4 h-4" />
            使用次数排行
          </h4>
          <div className="space-y-2">
            {sortedByUsage.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-medium text-gray-500">#{index + 1}</span>
                  <span>{agent.icon}</span>
                  <span className="text-gray-900">{agent.name}</span>
                </div>
                <span className="font-medium text-blue-600">{agent.usageCount}次</span>
              </div>
            ))}
          </div>
        </div>

        {/* 用户评分排行 */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
            <Star className="w-4 h-4" />
            用户评分排行
          </h4>
          <div className="space-y-2">
            {sortedByRating.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-medium text-gray-500">#{index + 1}</span>
                  <span>{agent.icon}</span>
                  <span className="text-gray-900">{agent.name}</span>
                </div>
                <span className="font-medium text-yellow-600">{agent.userRating.toFixed(1)}/5</span>
              </div>
            ))}
          </div>
        </div>

        {/* 响应速度排行 */}
        <div>
          <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center gap-1">
            <Zap className="w-4 h-4" />
            响应速度排行
          </h4>
          <div className="space-y-2">
            {sortedBySpeed.map((agent, index) => (
              <div key={agent.id} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 text-center font-medium text-gray-500">#{index + 1}</span>
                  <span>{agent.icon}</span>
                  <span className="text-gray-900">{agent.name}</span>
                </div>
                <span className="font-medium text-green-600">{Math.round(agent.averageResponseTime / 1000)}s</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 智能体目录主组件
 */
export const AgentCatalog: React.FC<AgentCatalogProps> = ({
  mode,
  selectedAgentId,
  onAgentSelect,
  onAddToWorkflow,
  onDirectChat,
  projectContext,
  className = '',
  isCollapsed,
  onToggleCollapse
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['business-strategy']));
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [categories, setCategories] = useState<AgentCategory[]>([]);
  const [isStatsPanelVisible, setIsStatsPanelVisible] = useState(false);

  // 加载智能体数据
  useEffect(() => {
    const loadAgents = () => {
      setAgents(agentService.getAllAgents());
      setCategories(agentService.getCategories());
    };

    loadAgents();
    
    // 设置项目上下文
    if (projectContext) {
      agentService.setProjectContext(projectContext);
    }
  }, [projectContext]);

  // 过滤智能体
  const filteredAgents = useMemo(() => {
    if (!searchQuery.trim()) return agents;
    return agentService.searchAgentsByCapability(searchQuery);
  }, [agents, searchQuery]);

  // 按分类分组智能体
  const agentsByCategory = useMemo(() => {
    const grouped: Record<string, AgentInfo[]> = {};
    
    categories.forEach(category => {
      grouped[category.id] = filteredAgents.filter(agent => agent.category.id === category.id);
    });
    
    return grouped;
  }, [categories, filteredAgents]);

  // 切换分类展开状态
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // 显示智能体详情
  const handleShowDetails = (agent: AgentInfo) => {
    // TODO: 实现详情弹窗
    console.log('显示智能体详情:', agent);
  };

  // 显示统计面板
  const handleShowStats = () => {
    setIsStatsPanelVisible(true);
  };

  // 关闭统计面板
  const handleCloseStats = () => {
    setIsStatsPanelVisible(false);
  };

  return (
    <div className={`bg-white border-b border-gray-200 flex flex-col relative ${className}`}>
      {/* 统计面板覆盖层 */}
      {isStatsPanelVisible && (
        <AgentStatsPanel
          isVisible={isStatsPanelVisible}
          onClose={handleCloseStats}
          agents={agents}
        />
      )}

      {/* 智能体目录头部 - 始终显示 */}
      <div className="h-10 flex-shrink-0 px-3 py-2 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">智能体目录</span>
          <span className="text-xs text-gray-500">({agents.length}个可用)</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleShowStats}
            className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-gray-100 transition-colors"
            title="查看使用统计"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100 transition-colors"
              title={isCollapsed ? "展开智能体目录" : "收起智能体目录"}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* 可折叠的内容区域 */}
      {!isCollapsed && (
        <div className="flex flex-col" style={{ maxHeight: '220px' }}>
          {/* 搜索框 */}
          <div className="flex-shrink-0 p-3 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="搜索智能体..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* 智能体列表 - 可滚动区域 */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            {searchQuery.trim() ? (
              // 搜索结果
              <div className="p-3 space-y-2">
                {filteredAgents.length > 0 ? (
                  filteredAgents.map(agent => (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      mode={mode}
                      isSelected={selectedAgentId === agent.id}
                      onSelect={onAgentSelect}
                      onAddToWorkflow={onAddToWorkflow}
                      onDirectChat={onDirectChat}
                      onShowDetails={handleShowDetails}
                    />
                  ))
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                    <p className="text-sm">未找到匹配的智能体</p>
                  </div>
                )}
              </div>
            ) : (
              // 分类列表
              <div>
                {categories.map(category => (
                  <AgentCategorySection
                    key={category.id}
                    category={category}
                    agents={agentsByCategory[category.id] || []}
                    isExpanded={expandedCategories.has(category.id)}
                    onToggle={() => toggleCategory(category.id)}
                    mode={mode}
                    selectedAgentId={selectedAgentId}
                    onAgentSelect={onAgentSelect}
                    onAddToWorkflow={onAddToWorkflow}
                    onDirectChat={onDirectChat}
                    onShowDetails={handleShowDetails}
                    projectContext={projectContext}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCatalog;