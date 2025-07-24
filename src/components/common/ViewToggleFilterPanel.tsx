import React, { useState } from 'react';
import { MapPin, Users, DollarSign, RefreshCw, Layers, Map, Grid, Filter, X, Check } from 'lucide-react';

interface ViewToggleFilterPanelProps {
  viewMode: 'map' | 'grid';
  onViewModeChange: (mode: 'map' | 'grid') => void;
  filters: {
    projectType: string;
    teamSize: string;
    fundingStage: string;
  };
  onFilterChange: (filterType: string, value: string) => void;
  onRefresh: () => void;
  onLocateMe: () => void;
}

const ViewToggleFilterPanel: React.FC<ViewToggleFilterPanelProps> = ({
  viewMode,
  onViewModeChange,
  filters,
  onFilterChange,
  onRefresh,
  onLocateMe,
}) => {
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  return (
    <div className="absolute top-4 right-4 z-10">
      <div className="flex flex-col gap-2">
        {/* 主控制面板 */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-lg">
          {/* 视图切换按钮组 */}
          <div className="flex rounded-md overflow-hidden border border-gray-200">
            <button
              onClick={() => onViewModeChange('map')}
              className={`px-3 py-1.5 flex items-center ${
                viewMode === 'map'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="地图视图"
            >
              <Map className="w-4 h-4 mr-1.5" />
              <span className="text-sm font-medium">地图</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-3 py-1.5 flex items-center ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="列表视图"
            >
              <Grid className="w-4 h-4 mr-1.5" />
              <span className="text-sm font-medium">列表</span>
            </button>
          </div>

          <div className="h-6 border-l border-gray-300/80 mx-1"></div>

          {/* 筛选和定位按钮 */}
          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-3 py-1.5 flex items-center rounded-md ${
              showFilterPanel || Object.values(filters).some(v => v !== '')
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
            aria-label="筛选"
          >
            <Filter className="w-4 h-4 mr-1.5" />
            <span className="text-sm font-medium">筛选</span>
            {Object.values(filters).some(v => v !== '') && (
              <span className="ml-1.5 flex items-center justify-center w-5 h-5 bg-white text-primary-600 rounded-full text-xs font-bold">
                {Object.values(filters).filter(v => v !== '').length}
              </span>
            )}
          </button>

          {viewMode === 'map' && (
            <button
              onClick={onLocateMe}
              className="px-3 py-1.5 flex items-center rounded-md bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              aria-label="我的位置"
            >
              <MapPin className="w-4 h-4 mr-1.5" />
              <span className="text-sm font-medium">我的位置</span>
            </button>
          )}

          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 hover:text-primary-600 bg-white rounded-md border border-gray-200"
            aria-label="刷新"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* 展开的筛选面板 */}
        {showFilterPanel && (
          <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-lg animate-fadeIn">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-800">高级筛选</h3>
              <button
                onClick={() => setShowFilterPanel(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* 项目类型筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Layers className="w-4 h-4 inline-block mr-1.5" />
                  项目类型
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "", label: "全部" },
                    { value: "tech", label: "科技" },
                    { value: "social", label: "社会企业" },
                    { value: "culture", label: "文化创意" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange('projectType', option.value)}
                      className={`px-3 py-1.5 text-sm rounded-md flex items-center justify-center ${
                        filters.projectType === option.value
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {filters.projectType === option.value && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 团队规模筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <Users className="w-4 h-4 inline-block mr-1.5" />
                  团队规模
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "", label: "全部" },
                    { value: "1-5人", label: "1-5人" },
                    { value: "5-10人", label: "5-10人" },
                    { value: "10人以上", label: "10人以上" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange('teamSize', option.value)}
                      className={`px-3 py-1.5 text-sm rounded-md flex items-center justify-center ${
                        filters.teamSize === option.value
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {filters.teamSize === option.value && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 融资阶段筛选 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  <DollarSign className="w-4 h-4 inline-block mr-1.5" />
                  融资阶段
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "", label: "全部" },
                    { value: "种子轮", label: "种子轮" },
                    { value: "天使轮", label: "天使轮" },
                    { value: "A轮", label: "A轮" },
                    { value: "B轮及以上", label: "B轮及以上" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => onFilterChange('fundingStage', option.value)}
                      className={`px-3 py-1.5 text-sm rounded-md flex items-center justify-center ${
                        filters.fundingStage === option.value
                          ? 'bg-primary-100 text-primary-700 border border-primary-200'
                          : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {filters.fundingStage === option.value && (
                        <Check className="w-3 h-3 mr-1" />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 重置按钮 */}
              {Object.values(filters).some(v => v !== '') && (
                <div className="pt-2">
                  <button
                    onClick={() => {
                      onFilterChange('projectType', '');
                      onFilterChange('teamSize', '');
                      onFilterChange('fundingStage', '');
                    }}
                    className="w-full py-2 text-sm text-primary-600 hover:text-primary-700 border border-primary-300 rounded-md bg-white hover:bg-primary-50"
                  >
                    重置筛选条件
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewToggleFilterPanel; 