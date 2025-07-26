import React from 'react';
import { 
  Grid3X3, 
  List, 
  Table, 
  ArrowUpDown,
  TrendingUp,
  Clock,
  Eye,
  Users,
  ChevronDown
} from 'lucide-react';
import { ProjectViewMode, ProjectSortBy } from '../../types/project.types';

interface ProjectViewControlsProps {
  viewMode: ProjectViewMode;
  sortBy: ProjectSortBy;
  onViewModeChange: (mode: ProjectViewMode) => void;
  onSortChange: (sort: ProjectSortBy) => void;
  totalCount: number;
  currentPage?: number;
  totalPages?: number;
}

const ProjectViewControls: React.FC<ProjectViewControlsProps> = ({
  viewMode,
  sortBy,
  onViewModeChange,
  onSortChange,
  totalCount,
  currentPage = 1,
  totalPages = 1
}) => {
  const [showSortDropdown, setShowSortDropdown] = React.useState(false);

  const sortOptions: { value: ProjectSortBy; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: 'latest', label: '最新发布', icon: Clock },
    { value: 'popular', label: '最受欢迎', icon: Eye },
    { value: 'funding', label: '融资金额', icon: TrendingUp },
    { value: 'progress', label: '项目进度', icon: ArrowUpDown },
    { value: 'team-completion', label: '团队完整度', icon: Users }
  ];

  const getSortLabel = (sort: ProjectSortBy) => {
    return sortOptions.find(option => option.value === sort)?.label || '最新发布';
  };

  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* 左侧：结果统计 */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          共找到 <span className="font-medium text-gray-900">{totalCount}</span> 个项目
        </span>
        {totalPages > 1 && (
          <span className="text-sm text-gray-500">
            第 {currentPage} / {totalPages} 页
          </span>
        )}
      </div>

      {/* 右侧：视图控制和排序 */}
      <div className="flex items-center gap-3">
        {/* 排序选择 */}
        <div className="relative">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{getSortLabel(sortBy)}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          {showSortDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowSortDropdown(false)}
              />
              <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-40">
                <div className="p-1">
                  {sortOptions.map(option => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        onClick={() => {
                          onSortChange(option.value);
                          setShowSortDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                          sortBy === option.value ? 'bg-primary-50 text-primary-600' : 'text-gray-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* 视图模式切换 */}
        <div className="flex items-center border border-gray-200 rounded-lg">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-primary-100 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="网格视图"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 border-l border-gray-200 ${
              viewMode === 'list'
                ? 'bg-primary-100 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="列表视图"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('table')}
            className={`p-2 border-l border-gray-200 ${
              viewMode === 'table'
                ? 'bg-primary-100 text-primary-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
            title="表格视图"
          >
            <Table className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectViewControls;