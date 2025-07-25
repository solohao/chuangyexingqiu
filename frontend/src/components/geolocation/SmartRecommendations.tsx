// 智能协作推荐组件

import React, { useState, useEffect } from 'react';
import { Star, MapPin, Users, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { 
  ProjectMatch, 
  GeoLocation, 
  CollaborationPreference,
  ProjectWithLocation 
} from '../../types/geolocation.types';
import { ProjectService } from '../../services/project.service';

interface SmartRecommendationsProps {
  userId: string;
  userLocation?: GeoLocation | null;
  userPreferences?: CollaborationPreference;
  onProjectSelect?: (project: ProjectWithLocation) => void;
  limit?: number;
  className?: string;
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  userId,
  userLocation,
  userPreferences,
  onProjectSelect,
  limit = 5,
  className = ''
}) => {
  const [recommendations, setRecommendations] = useState<ProjectMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载智能推荐
  const loadRecommendations = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const { recommendations: recs, error: recError } = await ProjectService.getCollaborationRecommendations(
        userId,
        userLocation || undefined,
        limit
      );

      if (recError) {
        setError('获取推荐失败');
        console.error('推荐加载失败:', recError);
        return;
      }

      setRecommendations(recs);
    } catch (error) {
      setError('获取推荐失败');
      console.error('推荐加载异常:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    loadRecommendations();
  }, [userId, userLocation, userPreferences]);

  // 获取匹配分数颜色
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-gray-600 bg-gray-100';
  };

  // 获取协作兼容性描述
  const getCompatibilityDescription = (compatibility: number) => {
    if (compatibility >= 80) return '高度匹配';
    if (compatibility >= 60) return '较好匹配';
    if (compatibility >= 40) return '一般匹配';
    return '低匹配度';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center">
          <RefreshCw className="w-5 h-5 animate-spin text-primary-500 mr-2" />
          <span className="text-gray-600">正在分析推荐...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={loadRecommendations}
            className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Star className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <div className="font-medium">暂无推荐项目</div>
          <div className="text-sm mt-1">
            完善您的协作偏好设置以获得更好的推荐
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* 标题 */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Star className="w-5 h-5 text-primary-500" />
            <h3 className="font-semibold text-gray-900">智能推荐</h3>
          </div>
          <button
            onClick={loadRecommendations}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="刷新推荐"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          基于您的协作偏好和位置推荐的项目
        </p>
      </div>

      {/* 推荐列表 */}
      <div className="divide-y">
        {recommendations.map((match, index) => {
          const project = match.project;
          const scoreColor = getScoreColor(match.matchScore);
          
          return (
            <div
              key={project.id}
              className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onProjectSelect?.(project)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* 项目标题和匹配分数 */}
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 truncate">
                      {project.title}
                    </h4>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${scoreColor}`}>
                      {match.matchScore}% 匹配
                    </div>
                  </div>

                  {/* 项目描述 */}
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {project.description}
                  </p>

                  {/* 项目信息 */}
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span>{project.city || project.location || '位置未知'}</span>
                    </div>
                    {match.distance !== undefined && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{match.distance.toFixed(1)}km</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>{getCompatibilityDescription(match.collaborationCompatibility)}</span>
                    </div>
                  </div>

                  {/* 推荐原因 */}
                  {match.reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {match.reasons.slice(0, 2).map((reason, reasonIndex) => (
                        <span
                          key={reasonIndex}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary-50 text-primary-700"
                        >
                          {reason}
                        </span>
                      ))}
                      {match.reasons.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{match.reasons.length - 2} 个原因
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* 排名指示器 */}
                <div className="ml-4 flex items-center">
                  <div className="flex items-center space-x-1 text-xs text-gray-400">
                    <TrendingUp className="w-3 h-3" />
                    <span>#{index + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            显示 {recommendations.length} 个推荐项目
          </span>
          <button
            onClick={loadRecommendations}
            className="text-primary-600 hover:text-primary-700 transition-colors"
          >
            查看更多推荐
          </button>
        </div>
      </div>
    </div>
  );
};