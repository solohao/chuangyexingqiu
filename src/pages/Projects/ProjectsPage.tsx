import React, { useState, useMemo } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  ProjectFilters as ProjectFiltersType, 
  ProjectViewMode, 
  ProjectSortBy 
} from '../../types/project.types';
import { mockProjects } from '../../data/mockProjects';
import ProjectFilters from '../../components/specialized/ProjectFilters';
import ProjectViewControls from '../../components/specialized/ProjectViewControls';
import ProjectCardEnhanced from '../../components/specialized/ProjectCardEnhanced';
import ProjectTableView from '../../components/specialized/ProjectTableView';
import SavedSearches from '../../components/specialized/SavedSearches';

const ProjectsPage: React.FC = () => {
  // 状态管理
  const [filters, setFilters] = useState<ProjectFiltersType>({
    search: '',
    type: 'all',
    stage: 'all',
    fundingStage: 'all',
    location: '',
    teamSize: { min: 1, max: 50 },
    skills: [],
    tags: []
  });
  
  const [viewMode, setViewMode] = useState<ProjectViewMode>('grid');
  const [sortBy, setSortBy] = useState<ProjectSortBy>('latest');
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 筛选和排序逻辑
  const filteredAndSortedProjects = useMemo(() => {
    let filtered = mockProjects.filter(project => {
      // 搜索筛选
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = 
          project.title.toLowerCase().includes(searchLower) ||
          project.description.toLowerCase().includes(searchLower) ||
          project.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          project.skills.some(skill => skill.toLowerCase().includes(searchLower)) ||
          project.founder.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }

      // 项目类型筛选
      if (filters.type !== 'all' && project.type !== filters.type) {
        return false;
      }

      // 项目阶段筛选
      if (filters.stage !== 'all' && project.stage !== filters.stage) {
        return false;
      }

      // 融资阶段筛选
      if (filters.fundingStage !== 'all' && project.funding.stage !== filters.fundingStage) {
        return false;
      }

      // 地理位置筛选
      if (filters.location && !project.location.includes(filters.location)) {
        return false;
      }

      // 团队规模筛选
      if (project.teamSize < filters.teamSize.min || project.teamSize > filters.teamSize.max) {
        return false;
      }

      // 技能筛选
      if (filters.skills.length > 0) {
        const hasMatchingSkill = filters.skills.some(skill => 
          project.skills.includes(skill) || project.seekingRoles.includes(skill)
        );
        if (!hasMatchingSkill) return false;
      }

      return true;
    });

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'popular':
          return (b.views + b.likes + b.followers) - (a.views + a.likes + a.followers);
        case 'funding':
          return b.funding.raised - a.funding.raised;
        case 'progress':
          return b.progress.percentage - a.progress.percentage;
        case 'team-completion':
          return (b.teamSize / b.maxTeamSize) - (a.teamSize / a.maxTeamSize);
        default:
          return 0;
      }
    });

    return filtered;
  }, [filters, sortBy]);

  // 分页逻辑
  const totalPages = Math.ceil(filteredAndSortedProjects.length / itemsPerPage);
  const paginatedProjects = filteredAndSortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 重置筛选
  const handleResetFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      stage: 'all',
      fundingStage: 'all',
      location: '',
      teamSize: { min: 1, max: 50 },
      skills: [],
      tags: []
    });
    setCurrentPage(1);
  };

  // 处理筛选变化
  const handleFiltersChange = (newFilters: ProjectFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理排序变化
  const handleSortChange = (newSort: ProjectSortBy) => {
    setSortBy(newSort);
    setCurrentPage(1);
  };

  // 处理点赞
  const handleLike = (projectId: string) => {
    setLikedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // 处理收藏
  const handleBookmark = (projectId: string) => {
    setBookmarkedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  // 分页组件
  const Pagination: React.FC = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 5;
      
      if (totalPages <= maxVisible) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        if (currentPage <= 3) {
          for (let i = 1; i <= 4; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 2) {
          pages.push(1);
          pages.push('...');
          for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
        } else {
          pages.push(1);
          pages.push('...');
          for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
          pages.push('...');
          pages.push(totalPages);
        }
      }
      
      return pages;
    };

    return (
      <div className="flex items-center justify-center gap-2 mt-8">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          上一页
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && setCurrentPage(page)}
            disabled={page === '...'}
            className={`px-3 py-2 text-sm border border-gray-200 rounded-lg ${
              page === currentPage
                ? 'bg-primary-500 text-white border-primary-500'
                : page === '...'
                ? 'cursor-default'
                : 'hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          下一页
        </button>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 页面头部 */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Briefcase className="mr-2 h-8 w-8 text-primary-600" />
            创业项目市场
          </h1>
          <p className="text-gray-600 mt-2">
            系统化浏览创业项目，深度研究，精准匹配合作机会
          </p>
        </div>
        
        <div className="mt-4 md:mt-0">
          <Link
            to="/projects/create"
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            发布项目
          </Link>
        </div>
      </div>

      {/* 保存的搜索 */}
      <SavedSearches
        currentFilters={filters}
        onApplyFilters={handleFiltersChange}
      />

      {/* 筛选组件 */}
      <ProjectFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* 视图控制 */}
      <ProjectViewControls
        viewMode={viewMode}
        sortBy={sortBy}
        onViewModeChange={setViewMode}
        onSortChange={handleSortChange}
        totalCount={filteredAndSortedProjects.length}
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* 项目列表 */}
      {viewMode === 'table' ? (
        <ProjectTableView
          projects={paginatedProjects}
          onLike={handleLike}
          onBookmark={handleBookmark}
          likedProjects={likedProjects}
          bookmarkedProjects={bookmarkedProjects}
        />
      ) : (
        <div className={`grid gap-6 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {paginatedProjects.map(project => (
            <ProjectCardEnhanced
              key={project.id}
              project={project}
              viewMode={viewMode}
              onLike={handleLike}
              onBookmark={handleBookmark}
              isLiked={likedProjects.has(project.id)}
              isBookmarked={bookmarkedProjects.has(project.id)}
            />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {filteredAndSortedProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Briefcase className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无匹配的项目</h3>
          <p className="text-gray-500 mb-6">
            尝试调整筛选条件或搜索关键词，发现更多优质项目
          </p>
          <button
            onClick={handleResetFilters}
            className="btn btn-outline"
          >
            重置筛选条件
          </button>
        </div>
      )}

      {/* 分页 */}
      <Pagination />
    </div>
  );
};

export default ProjectsPage; 