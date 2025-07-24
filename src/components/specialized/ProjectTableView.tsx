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
  Star,
  ExternalLink
} from 'lucide-react';
import { Project } from '../../types/project.types';
import { 
  getProjectTypeName, 
  getProjectStageName, 
  getFundingStageName,
  getProjectStatusName 
} from '../../data/mockProjects';
import { PROJECT_TYPE_COLORS } from '../../config/amap.config';

interface ProjectTableViewProps {
  projects: Project[];
  onLike?: (projectId: string) => void;
  onBookmark?: (projectId: string) => void;
  likedProjects?: Set<string>;
  bookmarkedProjects?: Set<string>;
}

const ProjectTableView: React.FC<ProjectTableViewProps> = ({
  projects,
  onLike,
  onBookmark,
  likedProjects = new Set(),
  bookmarkedProjects = new Set()
}) => {
  const handleLike = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onLike?.(projectId);
  };

  const handleBookmark = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(projectId);
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

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                项目信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创始人/位置
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                阶段/状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                团队/进度
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                融资信息
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                数据统计
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project) => (
              <tr key={project.id} className="hover:bg-gray-50">
                {/* 项目信息 */}
                <td className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={project.images[0] || 'https://via.placeholder.com/60x40'}
                      alt={project.title}
                      className="w-16 h-10 object-cover rounded flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/project/${project.id}`}
                        className="text-sm font-medium text-gray-900 hover:text-primary-600 line-clamp-1"
                      >
                        {project.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="px-2 py-0.5 text-xs rounded text-white"
                          style={{ backgroundColor: PROJECT_TYPE_COLORS[project.type] || PROJECT_TYPE_COLORS.default }}
                        >
                          {getProjectTypeName(project.type)}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded ${getStatusColor(project.status)}`}>
                          {getProjectStatusName(project.status)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </td>

                {/* 创始人/位置 */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-900">
                      <Users className="w-3 h-3" />
                      <span>{project.founder}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="text-xs">{project.location}</span>
                    </div>
                  </div>
                </td>

                {/* 阶段/状态 */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="flex items-center gap-1 text-gray-900">
                      <Clock className="w-3 h-3" />
                      <span>{getProjectStageName(project.stage)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                      <TrendingUp className="w-3 h-3" />
                      <span className="text-xs">{getFundingStageName(project.funding.stage)}</span>
                    </div>
                  </div>
                </td>

                {/* 团队/进度 */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">
                      团队: {project.teamSize}/{project.maxTeamSize}人
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full">
                        <div
                          className={`h-full rounded-full ${getProgressColor(project.progress.percentage)}`}
                          style={{ width: `${project.progress.percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{project.progress.percentage}%</span>
                    </div>
                  </div>
                </td>

                {/* 融资信息 */}
                <td className="px-6 py-4">
                  <div className="text-sm">
                    <div className="text-gray-900">
                      已融: ¥{project.funding.raised}万
                    </div>
                    <div className="text-gray-500 text-xs mt-1">
                      目标: ¥{project.funding.seeking}万
                    </div>
                    <div className="text-gray-500 text-xs">
                      股权: {project.funding.equity}%
                    </div>
                  </div>
                </td>

                {/* 数据统计 */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {project.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {project.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      {project.comments}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </div>
                </td>

                {/* 操作 */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleLike(e, project.id)}
                      className={`p-1 rounded hover:bg-gray-100 ${
                        likedProjects.has(project.id) ? 'text-red-500' : 'text-gray-400'
                      }`}
                      title="点赞"
                    >
                      <Heart className="w-4 h-4" fill={likedProjects.has(project.id) ? 'currentColor' : 'none'} />
                    </button>
                    <button
                      onClick={(e) => handleBookmark(e, project.id)}
                      className={`p-1 rounded hover:bg-gray-100 ${
                        bookmarkedProjects.has(project.id) ? 'text-blue-500' : 'text-gray-400'
                      }`}
                      title="收藏"
                    >
                      <Star className="w-4 h-4" fill={bookmarkedProjects.has(project.id) ? 'currentColor' : 'none'} />
                    </button>
                    <Link
                      to={`/project/${project.id}`}
                      className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-primary-600"
                      title="查看详情"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-lg font-medium mb-2">暂无项目</div>
          <div className="text-sm">尝试调整筛选条件或搜索关键词</div>
        </div>
      )}
    </div>
  );
};

export default ProjectTableView;