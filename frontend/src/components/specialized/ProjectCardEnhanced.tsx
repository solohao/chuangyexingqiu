import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  Clock, 
  Eye, 
  Heart, 
  MessageCircle,
  Star
} from 'lucide-react';
import { Project } from '../../types/project.types';
import { 
  getProjectTypeName, 
  getProjectStageName, 
  getFundingStageName,
  getProjectStatusName 
} from '../../data/mockProjects';
import { PROJECT_TYPE_COLORS } from '../../config/amap.config';

interface ProjectCardEnhancedProps {
  project: Project;
  viewMode?: 'grid' | 'list';
  onLike?: (projectId: string) => void;
  onBookmark?: (projectId: string) => void;
  isLiked?: boolean;
  isBookmarked?: boolean;
}

const ProjectCardEnhanced: React.FC<ProjectCardEnhancedProps> = ({
  project,
  viewMode = 'grid',
  onLike,
  onBookmark,
  isLiked = false,
  isBookmarked = false
}) => {
  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(project.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(project.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recruiting': return 'text-green-600 bg-green-50';
      case 'in-progress': return 'text-blue-600 bg-blue-50';
      case 'paused': return 'text-yellow-600 bg-yellow-50';
      case 'completed': return 'text-gray-600 bg-gray-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (viewMode === 'list') {
    return (
      <Link to={`/project/${project.id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-6">
          <div className="flex items-start gap-6">
            {/* 项目图片 */}
            <div className="flex-shrink-0">
              <img
                src={project.images[0] || 'https://via.placeholder.com/120x80'}
                alt={project.title}
                className="w-32 h-20 object-cover rounded-lg"
              />
            </div>

            {/* 主要信息 */}
            <div className="flex-grow min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900 truncate">
                    {project.title}
                  </h3>
                  <span
                    className="px-2 py-1 text-xs rounded-full text-white"
                    style={{ backgroundColor: PROJECT_TYPE_COLORS[project.type] || PROJECT_TYPE_COLORS.default }}
                  >
                    {getProjectTypeName(project.type)}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                    {getProjectStatusName(project.status)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleLike}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isLiked ? 'text-red-500' : 'text-gray-400'}`}
                  >
                    <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={handleBookmark}
                    className={`p-1 rounded-full hover:bg-gray-100 ${isBookmarked ? 'text-blue-500' : 'text-gray-400'}`}
                  >
                    <Star className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {project.description}
              </p>

              <div className="flex items-center gap-6 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{project.founder}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{project.location}</span>
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>{getFundingStageName(project.funding.stage)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{getProjectStageName(project.stage)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {project.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {project.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4" />
                    {project.comments}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    进度: {project.progress.percentage}%
                  </div>
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-full rounded-full ${getProgressColor(project.progress.percentage)}`}
                      style={{ width: `${project.progress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Grid 视图
  return (
    <Link to={`/project/${project.id}`} className="block">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden">
        {/* 项目图片 */}
        <div className="relative">
          <img
            src={project.images[0] || 'https://via.placeholder.com/400x200'}
            alt={project.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className="px-2 py-1 text-xs rounded-full text-white font-medium"
              style={{ backgroundColor: PROJECT_TYPE_COLORS[project.type] || PROJECT_TYPE_COLORS.default }}
            >
              {getProjectTypeName(project.type)}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(project.status)}`}>
              {getProjectStatusName(project.status)}
            </span>
          </div>
          <div className="absolute top-3 right-3 flex gap-1">
            <button
              onClick={handleLike}
              className={`p-1.5 rounded-full bg-white/80 hover:bg-white ${isLiked ? 'text-red-500' : 'text-gray-600'}`}
            >
              <Heart className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleBookmark}
              className={`p-1.5 rounded-full bg-white/80 hover:bg-white ${isBookmarked ? 'text-blue-500' : 'text-gray-600'}`}
            >
              <Star className="w-4 h-4" fill={isBookmarked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* 项目信息 */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
            {project.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {project.description}
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{project.founder}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{project.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-600">
              {getFundingStageName(project.funding.stage)} • {getProjectStageName(project.stage)}
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-600">
              <span>进度</span>
              <div className="w-16 h-2 bg-gray-200 rounded-full">
                <div
                  className={`h-full rounded-full ${getProgressColor(project.progress.percentage)}`}
                  style={{ width: `${project.progress.percentage}%` }}
                />
              </div>
              <span>{project.progress.percentage}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {project.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" />
                {project.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {project.comments}
              </span>
            </div>
            
            <div className="text-xs text-gray-400">
              {new Date(project.updatedAt).toLocaleDateString()}
            </div>
          </div>

          {/* 招募角色标签 */}
          {project.seekingRoles.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-500 mb-1">急需招募:</div>
              <div className="flex flex-wrap gap-1">
                {project.seekingRoles.slice(0, 3).map((role, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-primary-50 text-primary-600 rounded-full"
                  >
                    {role}
                  </span>
                ))}
                {project.seekingRoles.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded-full">
                    +{project.seekingRoles.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProjectCardEnhanced;