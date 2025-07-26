import React, { useState, useEffect } from 'react';
import { Briefcase, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ProjectFilters as ProjectFiltersType,
  ProjectViewMode,
  ProjectSortBy,
  Project,
  ProjectType,
  ProjectStage,
  ProjectStatus,
  FundingStage
} from '../../types/project.types';
import { ProjectService, ProjectSortOptions } from '../../services/project.service';
import { Tables } from '../../types/supabase.types';
import ProjectFilters from '../../components/specialized/ProjectFilters';
import ProjectViewControls from '../../components/specialized/ProjectViewControls';
import ProjectCardEnhanced from '../../components/specialized/ProjectCardEnhanced';
import ProjectTableView from '../../components/specialized/ProjectTableView';
import SavedSearches from '../../components/specialized/SavedSearches';

// 转换 Supabase 项目数据为组件期望的格式
const convertSupabaseProjectToProject = (supabaseProject: Tables<'projects'>): Project => {
  return {
    id: supabaseProject.id,
    title: supabaseProject.title,
    description: supabaseProject.description,
    type: supabaseProject.type as ProjectType,
    stage: supabaseProject.stage as ProjectStage,
    status: (supabaseProject.status || 'active') as ProjectStatus,

    // 基本信息
    founder: supabaseProject.founder_name,
    founderId: supabaseProject.founder_id || '',
    foundedAt: supabaseProject.created_at || '',
    location: supabaseProject.location || '',
    position: [supabaseProject.longitude || 0, supabaseProject.latitude || 0] as [number, number],

    // 团队信息
    team: [], // 这里可以后续扩展
    teamSize: supabaseProject.team_size || 1,
    maxTeamSize: supabaseProject.max_team_size || 10,
    seekingRoles: supabaseProject.seeking_roles || [],

    // 融资信息
    funding: {
      stage: (supabaseProject.funding_stage || 'pre-seed') as FundingStage,
      raised: supabaseProject.funding_raised || 0,
      seeking: supabaseProject.funding_target || 0,
      equity: 0 // 这个字段在 Supabase 中没有，可以后续添加
    },

    // 项目进展
    progress: {
      percentage: supabaseProject.progress_percentage || 0,
      milestones: [] // 这里可以后续扩展
    },

    // 媒体资源
    images: supabaseProject.images || [],
    videos: supabaseProject.video_url ? [supabaseProject.video_url] : undefined,
    demoUrl: supabaseProject.demo_url || undefined,

    // 标签和分类
    tags: supabaseProject.tags || [],
    skills: supabaseProject.skills || [],

    // 统计数据
    views: supabaseProject.views || 0,
    likes: supabaseProject.likes || 0,
    comments: supabaseProject.comments_count || 0,
    followers: supabaseProject.bookmarks || 0, // 使用 bookmarks 作为 followers 的替代

    // 联系信息
    contact: {
      email: supabaseProject.contact_email || '',
      phone: supabaseProject.contact_phone || undefined,
      website: supabaseProject.website_url || undefined,
      social: supabaseProject.social_links as any || {}
    },

    // 时间戳
    createdAt: supabaseProject.created_at || '',
    updatedAt: supabaseProject.updated_at || ''
  };
};

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [likedProjects, setLikedProjects] = useState<Set<string>>(new Set());
  const [bookmarkedProjects, setBookmarkedProjects] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // 获取项目数据
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const sortOptions: ProjectSortOptions = {
        field: sortBy === 'latest' ? 'created_at' :
          sortBy === 'popular' ? 'views' :
            sortBy === 'funding' ? 'funding_raised' :
              sortBy === 'progress' ? 'progress_percentage' : 'created_at',
        ascending: false
      };

      // 转换筛选器格式以匹配API
      const apiFilters = {
        search: filters.search,
        type: filters.type !== 'all' ? filters.type : undefined,
        stage: filters.stage !== 'all' ? filters.stage : undefined,
        funding_stage: filters.fundingStage !== 'all' ? filters.fundingStage : undefined,
        location: filters.location || undefined,
        min_team_size: filters.teamSize.min,
        max_team_size: filters.teamSize.max,
        skills: filters.skills,
        tags: filters.tags
      };

      const { projects: fetchedProjects, total: totalCount, error } = await ProjectService.getProjects(
        apiFilters,
        sortOptions,
        currentPage,
        itemsPerPage
      );

      if (error) {
        console.error('获取项目列表失败:', error);
        return;
      }

      const convertedProjects = fetchedProjects.map(convertSupabaseProjectToProject);
      setProjects(convertedProjects);
      setTotal(totalCount);
    } catch (error) {
      console.error('获取项目列表异常:', error);
    } finally {
      setLoading(false);
    }
  };



  // 监听筛选条件和排序变化
  useEffect(() => {
    fetchProjects();
  }, [filters, sortBy, currentPage]);

  // 监听页面焦点，当从其他页面返回时刷新项目列表
  useEffect(() => {
    const handleFocus = () => {
      fetchProjects();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // 分页逻辑
  const totalPages = Math.ceil(total / itemsPerPage);

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
  const handleLike = async (projectId: string) => {
    try {
      const { error } = await ProjectService.likeProject(projectId);
      if (error) {
        console.error('点赞失败:', error);
        return;
      }

      setLikedProjects((prev: Set<string>) => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) {
          newSet.delete(projectId);
        } else {
          newSet.add(projectId);
        }
        return newSet;
      });

      // 刷新项目列表以更新点赞数
      fetchProjects();
    } catch (error) {
      console.error('点赞异常:', error);
    }
  };

  // 处理收藏
  const handleBookmark = async (projectId: string) => {
    try {
      const { error } = await ProjectService.bookmarkProject(projectId);
      if (error) {
        console.error('收藏失败:', error);
        return;
      }

      setBookmarkedProjects((prev: Set<string>) => {
        const newSet = new Set(prev);
        if (newSet.has(projectId)) {
          newSet.delete(projectId);
        } else {
          newSet.add(projectId);
        }
        return newSet;
      });

      // 刷新项目列表以更新收藏数
      fetchProjects();
    } catch (error) {
      console.error('收藏异常:', error);
    }
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
            className={`px-3 py-2 text-sm border border-gray-200 rounded-lg ${page === currentPage
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

        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            onClick={fetchProjects}
            disabled={loading}
            className="btn btn-outline flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            刷新
          </button>

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
        totalCount={total}
        currentPage={currentPage}
        totalPages={totalPages}
      />



      {/* 加载状态 */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="text-gray-500 mt-4">加载中...</p>
        </div>
      ) : (
        <>
          {/* 项目列表 */}
          {viewMode === 'table' ? (
            <ProjectTableView
              projects={projects}
              onLike={handleLike}
              onBookmark={handleBookmark}
              likedProjects={likedProjects}
              bookmarkedProjects={bookmarkedProjects}
            />
          ) : (
            <div className={`grid gap-6 ${viewMode === 'grid'
              ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1'
              }`}>
              {projects.map((project: any) => (
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
          {projects.length === 0 && !loading && (
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
        </>
      )}

      {/* 分页 */}
      <Pagination />
    </div>
  );
};

export default ProjectsPage; 