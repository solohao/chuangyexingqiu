import React from 'react';
import { CheckCircle, Circle, Clock, Calendar } from 'lucide-react';
import { ProjectProgress } from '../../types/project.types';

interface ProjectTimelineProps {
  progress: ProjectProgress;
  className?: string;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  progress,
  className = ""
}) => {
  const getStatusIcon = (completed: boolean) => {
    if (completed) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <Circle className="w-5 h-5 text-gray-300" />;
  };

  const getStatusColor = (completed: boolean, index: number, currentIndex: number) => {
    if (completed) return 'text-green-600';
    if (index === currentIndex) return 'text-blue-600';
    return 'text-gray-400';
  };

  const getLineColor = (completed: boolean) => {
    return completed ? 'bg-green-500' : 'bg-gray-200';
  };

  // 找到当前进行的里程碑
  const currentMilestoneIndex = progress.milestones.findIndex(m => !m.completed);
  const actualCurrentIndex = currentMilestoneIndex === -1 ? progress.milestones.length - 1 : currentMilestoneIndex;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">项目进度</h3>
        <div className="flex items-center gap-2">
          <div className="w-24 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {progress.percentage}%
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {progress.milestones.map((milestone, index) => {
          const isCompleted = milestone.completed;
          const isCurrent = index === actualCurrentIndex && !isCompleted;
          const isLast = index === progress.milestones.length - 1;

          return (
            <div key={index} className="relative">
              <div className="flex items-start gap-4">
                {/* 状态图标 */}
                <div className="relative flex-shrink-0">
                  <div className={`relative z-10 ${isCurrent ? 'animate-pulse' : ''}`}>
                    {getStatusIcon(isCompleted)}
                  </div>
                  
                  {/* 连接线 */}
                  {!isLast && (
                    <div
                      className={`absolute top-6 left-1/2 w-0.5 h-8 -translate-x-1/2 ${getLineColor(isCompleted)}`}
                    />
                  )}
                </div>

                {/* 里程碑内容 */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-medium ${getStatusColor(isCompleted, index, actualCurrentIndex)}`}>
                      {milestone.title}
                    </h4>
                    
                    {milestone.date && (
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(milestone.date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* 状态标签 */}
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">
                        <CheckCircle className="w-3 h-3" />
                        已完成
                      </span>
                    )}
                    
                    {isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-full">
                        <Clock className="w-3 h-3" />
                        进行中
                      </span>
                    )}
                    
                    {!isCompleted && !isCurrent && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-gray-100 text-gray-500 rounded-full">
                        <Circle className="w-3 h-3" />
                        待开始
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 进度统计 */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-green-600">
              {progress.milestones.filter(m => m.completed).length}
            </div>
            <div className="text-xs text-gray-500">已完成</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-blue-600">
              {progress.milestones.filter(m => !m.completed).length > 0 ? 1 : 0}
            </div>
            <div className="text-xs text-gray-500">进行中</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-600">
              {Math.max(0, progress.milestones.filter(m => !m.completed).length - 1)}
            </div>
            <div className="text-xs text-gray-500">待开始</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimeline;