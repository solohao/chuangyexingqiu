import React, { useState } from 'react';
import { 
  Filter, 
  X, 
  ChevronDown, 
  MapPin,
  Users,
  TrendingUp,
  Clock,
  Tag
} from 'lucide-react';
import SmartSearchBox from './SmartSearchBox';
import { ProjectFilters as ProjectFiltersType, ProjectType, ProjectStage, FundingStage } from '../../types/project.types';
import { 
  getProjectTypeName, 
  getProjectStageName, 
  getFundingStageName 
} from '../../data/mockProjects';

interface ProjectFiltersProps {
  filters: ProjectFiltersType;
  onFiltersChange: (filters: ProjectFiltersType) => void;
  onReset: () => void;
}

const ProjectFilters: React.FC<ProjectFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const projectTypes: (ProjectType | 'all')[] = ['all', 'tech', 'finance', 'education', 'health', 'environment', 'social', 'culture', 'other'];
  const projectStages: (ProjectStage | 'all')[] = ['all', 'idea', 'mvp', 'growth', 'expansion'];
  const fundingStages: (FundingStage | 'all')[] = ['all', 'pre-seed', 'seed', 'angel', 'series-a', 'series-b', 'series-c', 'ipo'];

  const cities = ['全部城市', '北京市', '上海市', '广州市', '深圳市', '杭州市', '成都市', '武汉市', '西安市', '南京市'];
  const skillOptions = ['React', 'Vue', 'Node.js', 'Python', 'Java', 'UI设计', '产品管理', '市场营销', '数据分析', 'AI算法'];

  const handleFilterChange = (key: keyof ProjectFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleSkillToggle = (skill: string) => {
    const newSkills = filters.skills.includes(skill)
      ? filters.skills.filter(s => s !== skill)
      : [...filters.skills, skill];
    handleFilterChange('skills', newSkills);
  };

  const handleTeamSizeChange = (type: 'min' | 'max', value: number) => {
    handleFilterChange('teamSize', {
      ...filters.teamSize,
      [type]: value
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.type !== 'all') count++;
    if (filters.stage !== 'all') count++;
    if (filters.fundingStage !== 'all') count++;
    if (filters.location) count++;
    if (filters.skills.length > 0) count++;
    if (filters.teamSize.min > 1 || filters.teamSize.max < 50) count++;
    return count;
  };

  const Dropdown: React.FC<{
    id: string;
    trigger: React.ReactNode;
    children: React.ReactNode;
  }> = ({ id, trigger, children }) => (
    <div className="relative">
      <button
        onClick={() => setActiveDropdown(activeDropdown === id ? null : id)}
        className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        {trigger}
        <ChevronDown className="w-4 h-4" />
      </button>
      {activeDropdown === id && (
        <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
      {/* 基础筛选行 */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* 智能搜索框 */}
        <div className="flex-grow min-w-64">
          <SmartSearchBox
            value={filters.search}
            onChange={(value) => handleFilterChange('search', value)}
            placeholder="搜索项目名称、描述、标签..."
          />
        </div>

        {/* 项目类型 */}
        <Dropdown
          id="type"
          trigger={
            <>
              <Tag className="w-4 h-4" />
              <span>{filters.type === 'all' ? '项目类型' : getProjectTypeName(filters.type as ProjectType)}</span>
            </>
          }
        >
          <div className="p-2">
            {projectTypes.map(type => (
              <button
                key={type}
                onClick={() => {
                  handleFilterChange('type', type);
                  setActiveDropdown(null);
                }}
                className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                  filters.type === type ? 'bg-primary-50 text-primary-600' : ''
                }`}
              >
                {type === 'all' ? '全部类型' : getProjectTypeName(type as ProjectType)}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* 项目阶段 */}
        <Dropdown
          id="stage"
          trigger={
            <>
              <Clock className="w-4 h-4" />
              <span>{filters.stage === 'all' ? '项目阶段' : getProjectStageName(filters.stage as ProjectStage)}</span>
            </>
          }
        >
          <div className="p-2">
            {projectStages.map(stage => (
              <button
                key={stage}
                onClick={() => {
                  handleFilterChange('stage', stage);
                  setActiveDropdown(null);
                }}
                className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                  filters.stage === stage ? 'bg-primary-50 text-primary-600' : ''
                }`}
              >
                {stage === 'all' ? '全部阶段' : getProjectStageName(stage as ProjectStage)}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* 融资阶段 */}
        <Dropdown
          id="funding"
          trigger={
            <>
              <TrendingUp className="w-4 h-4" />
              <span>{filters.fundingStage === 'all' ? '融资阶段' : getFundingStageName(filters.fundingStage as FundingStage)}</span>
            </>
          }
        >
          <div className="p-2">
            {fundingStages.map(stage => (
              <button
                key={stage}
                onClick={() => {
                  handleFilterChange('fundingStage', stage);
                  setActiveDropdown(null);
                }}
                className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                  filters.fundingStage === stage ? 'bg-primary-50 text-primary-600' : ''
                }`}
              >
                {stage === 'all' ? '全部阶段' : getFundingStageName(stage as FundingStage)}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* 地理位置 */}
        <Dropdown
          id="location"
          trigger={
            <>
              <MapPin className="w-4 h-4" />
              <span>{filters.location || '地理位置'}</span>
            </>
          }
        >
          <div className="p-2">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => {
                  handleFilterChange('location', city === '全部城市' ? '' : city);
                  setActiveDropdown(null);
                }}
                className={`block w-full text-left px-3 py-2 text-sm rounded hover:bg-gray-100 ${
                  (filters.location === city || (!filters.location && city === '全部城市')) ? 'bg-primary-50 text-primary-600' : ''
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </Dropdown>

        {/* 高级筛选切换 */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-3 py-2 text-sm border rounded-lg hover:bg-gray-50 ${
            isExpanded ? 'border-primary-500 text-primary-600' : 'border-gray-200'
          }`}
        >
          <Filter className="w-4 h-4" />
          <span>高级筛选</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary-500 text-white text-xs px-1.5 py-0.5 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {/* 重置按钮 */}
        {getActiveFiltersCount() > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
          >
            <X className="w-4 h-4" />
            <span>重置</span>
          </button>
        )}
      </div>

      {/* 高级筛选面板 */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 space-y-4">
          {/* 团队规模 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Users className="inline w-4 h-4 mr-1" />
              团队规模
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="50"
                placeholder="最小"
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                value={filters.teamSize.min}
                onChange={(e) => handleTeamSizeChange('min', parseInt(e.target.value) || 1)}
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                min="1"
                max="50"
                placeholder="最大"
                className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                value={filters.teamSize.max}
                onChange={(e) => handleTeamSizeChange('max', parseInt(e.target.value) || 50)}
              />
              <span className="text-sm text-gray-500">人</span>
            </div>
          </div>

          {/* 技能标签 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所需技能
            </label>
            <div className="flex flex-wrap gap-2">
              {skillOptions.map(skill => (
                <button
                  key={skill}
                  onClick={() => handleSkillToggle(skill)}
                  className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                    filters.skills.includes(skill)
                      ? 'bg-primary-100 border-primary-300 text-primary-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 点击外部关闭下拉菜单 */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default ProjectFilters;