import React from 'react';
import { 
  Users, 
  BarChart3, 
  CheckSquare, 
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  type: 'owned' | 'participated' | 'watching';
  progress: number;
}

interface ProjectOverviewProps {
  project: Project;
}

const ProjectOverview: React.FC<ProjectOverviewProps> = ({ project }) => {
  // 模拟项目数据
  const projectData = {
    teamMembers: 5,
    completedTasks: 23,
    totalTasks: 31,
    daysLeft: 15,
    budget: 50000,
    spent: 32000,
    milestones: [
      { name: '需求分析', completed: true, date: '2024-01-15' },
      { name: '原型设计', completed: true, date: '2024-01-25' },
      { name: '开发阶段', completed: false, date: '2024-02-15' },
      { name: '测试上线', completed: false, date: '2024-03-01' },
    ],
    recentActivities: [
      { action: '张三完成了"用户登录功能"', time: '2小时前' },
      { action: '李四更新了项目进度', time: '4小时前' },
      { action: '王五添加了新的任务', time: '1天前' },
    ]
  };

  const completionRate = Math.round((projectData.completedTasks / projectData.totalTasks) * 100);
  const budgetUsage = Math.round((projectData.spent / projectData.budget) * 100);

  return (
    <div className="p-6 space-y-6">
      {/* 项目标题和状态 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <div className="flex items-center mt-2 space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              project.status === 'active' ? 'bg-green-100 text-green-800' :
              project.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {project.status === 'active' ? '进行中' : 
               project.status === 'paused' ? '已暂停' : '已完成'}
            </span>
            <span className="text-sm text-gray-500">
              创建于 2024-01-10
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            编辑项目
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            分享项目
          </button>
        </div>
      </div>

      {/* 关键指标卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">团队成员</p>
              <p className="text-2xl font-bold text-blue-700">{projectData.teamMembers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">任务完成率</p>
              <p className="text-2xl font-bold text-green-700">{completionRate}%</p>
            </div>
            <CheckSquare className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-600">剩余天数</p>
              <p className="text-2xl font-bold text-yellow-700">{projectData.daysLeft}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">预算使用</p>
              <p className="text-2xl font-bold text-purple-700">{budgetUsage}%</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* 项目进度和里程碑 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 项目进度 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-gray-600" />
            项目进度
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>整体进度</span>
                <span>{project.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>任务完成</span>
                <span>{projectData.completedTasks}/{projectData.totalTasks}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 里程碑 */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Target className="w-5 h-5 mr-2 text-gray-600" />
            项目里程碑
          </h3>
          <div className="space-y-3">
            {projectData.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${
                  milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    milestone.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {milestone.name}
                  </p>
                  <p className="text-xs text-gray-400">{milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近活动 */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2 text-gray-600" />
          最近活动
        </h3>
        <div className="space-y-3">
          {projectData.recentActivities.map((activity, index) => (
            <div key={index} className="flex items-start">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3" />
              <div>
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectOverview;