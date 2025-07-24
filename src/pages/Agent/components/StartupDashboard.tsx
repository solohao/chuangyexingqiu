import React, { useState } from 'react';
import { 
  Users, 
  Target, 
  DollarSign, 
  Clock,
  Zap
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

interface StartupDashboardProps {
  project: Project;
}

const StartupDashboard: React.FC<StartupDashboardProps> = ({ project }) => {
  const [activeView, setActiveView] = useState<'overview' | 'kanban' | 'roadmap' | 'market'>('overview');
  
  // 模拟数据
  const projectData = {
    teamMembers: 5,
    completedTasks: 23,
    totalTasks: 31,
    daysLeft: 15,
    budget: 50000,
    spent: 32000,
    burnRate: 5000,
    runway: 3.6,
    marketSize: '2.5亿',
    competitors: 8,
    customerSegments: 3,
    keyMetrics: [
      { name: '用户获取成本', value: '¥120', trend: 'down', change: '12%' },
      { name: '月活跃用户', value: '2,450', trend: 'up', change: '8%' },
      { name: '转化率', value: '3.2%', trend: 'up', change: '0.5%' },
      { name: '客单价', value: '¥78', trend: 'stable', change: '0%' }
    ]
  };

  const getStageLabel = (stage: Project['stage']) => {
    switch (stage) {
      case 'idea': return '构思阶段';
      case 'validation': return '验证阶段';
      case 'growth': return '成长阶段';
      case 'expansion': return '扩张阶段';
    }
  };

  const getHealthColor = (health: Project['health']) => {
    switch (health) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
    }
  };

  const getHealthLabel = (health: Project['health']) => {
    switch (health) {
      case 'excellent': return '优秀';
      case 'good': return '良好';
      case 'warning': return '需注意';
      case 'critical': return '危险';
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      {/* 项目标题和状态 */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status === 'active' ? '进行中' : 
               project.status === 'paused' ? '已暂停' : '已完成'}
            </span>
          </div>
          <div className="flex items-center mt-2">
            <span className="text-sm text-gray-500 mr-2">创业阶段:</span>
            <span className="font-medium text-primary-600">{getStageLabel(project.stage)}</span>
            <div className={`ml-3 w-3 h-3 rounded-full ${getHealthColor(project.health)}`}></div>
            <span className="ml-1 text-sm text-gray-600">项目健康度: {getHealthLabel(project.health)}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            编辑项目
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            分享项目
          </button>
        </div>
      </div>

      {/* 视图切换 */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeView === 'overview' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          项目概览
        </button>
        <button
          onClick={() => setActiveView('kanban')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeView === 'kanban' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          任务看板
        </button>
        <button
          onClick={() => setActiveView('roadmap')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeView === 'roadmap' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          路线图
        </button>
        <button
          onClick={() => setActiveView('market')}
          className={`px-4 py-2 border-b-2 font-medium text-sm ${
            activeView === 'market' 
              ? 'border-primary-500 text-primary-600' 
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          市场分析
        </button>
      </div>

      {/* 项目概览视图 */}
      {activeView === 'overview' && (
        <div className="space-y-6">
          {/* 创业阶段指导 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-100">
            <div className="flex items-start">
              <Zap className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg text-gray-900 mb-2">创业阶段: {getStageLabel(project.stage)}</h3>
                <p className="text-gray-600 mb-3">
                  {project.stage === 'idea' && '这个阶段主要关注创业想法的形成和初步验证，包括市场调研、竞品分析和商业模式构思。'}
                  {project.stage === 'validation' && '这个阶段专注于验证产品市场契合度，包括MVP开发、用户反馈收集和商业模式验证。'}
                  {project.stage === 'growth' && '这个阶段关注产品的规模化和用户增长，包括营销策略、团队扩张和运营优化。'}
                  {project.stage === 'expansion' && '这个阶段专注于业务扩张和多元化，包括新市场进入、融资和战略合作。'}
                </p>
                <div className="bg-white p-3 rounded border border-blue-100">
                  <h4 className="font-medium text-blue-700 mb-1">Agent建议</h4>
                  <p className="text-gray-600">
                    {project.stage === 'idea' && '建议专注于验证问题假设，进行用户访谈，明确价值主张，避免过早投入大量资源。'}
                    {project.stage === 'validation' && '建议快速迭代MVP，收集用户反馈，调整产品方向，寻找产品市场契合点。'}
                    {project.stage === 'growth' && '建议优化获客渠道，提高用户留存，建立可扩展的团队结构，关注单位经济效益。'}
                    {project.stage === 'expansion' && '建议评估新市场机会，建立战略合作关系，优化资本结构，构建长期竞争壁垒。'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 关键指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">团队完整度</p>
                  <p className="text-2xl font-bold text-blue-600">{project.teamCompletion}%</p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${project.teamCompletion}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">资金状况</p>
                  <p className="text-2xl font-bold text-green-600">{project.fundingStatus}%</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${project.fundingStatus}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">市场验证</p>
                  <p className="text-2xl font-bold text-yellow-600">{project.marketValidation}%</p>
                </div>
                <Target className="w-8 h-8 text-yellow-200" />
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-600 h-2 rounded-full"
                    style={{ width: `${project.marketValidation}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">资金消耗率</p>
                  <div className="flex items-baseline">
                    <p className="text-2xl font-bold text-purple-600">¥{projectData.burnRate.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 ml-1">/月</p>
                  </div>
                </div>
                <Clock className="w-8 h-8 text-purple-200" />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                预计资金可维持 <span className="font-medium text-purple-600">{projectData.runway}</span> 个月
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 其他视图 - 占位符 */}
      {activeView === 'kanban' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">任务看板视图</h3>
          <p className="text-gray-500">任务看板功能开发中，敬请期待...</p>
        </div>
      )}

      {activeView === 'roadmap' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">路线图视图</h3>
          <p className="text-gray-500">路线图功能开发中，敬请期待...</p>
        </div>
      )}

      {activeView === 'market' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200 text-center py-12">
          <h3 className="text-xl font-medium text-gray-700 mb-2">市场分析视图</h3>
          <p className="text-gray-500">市场分析功能开发中，敬请期待...</p>
        </div>
      )}
    </div>
  );
};

export default StartupDashboard;