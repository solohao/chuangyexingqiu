// 寻找协作伙伴快捷搜索组件

import React, { useState } from 'react';
import { Search, MapPin, Users, Zap, Filter } from 'lucide-react';
import { 
  GeoLocation, 
  GeoSearchParams, 
  CollaborationPreference,
  COLLABORATION_MODES 
} from '../../types/geolocation.types';

interface FindCollaboratorsProps {
  onSearch: (params: GeoSearchParams) => void;
  currentLocation?: GeoLocation | null;
  userPreferences?: CollaborationPreference;
  className?: string;
}

export const FindCollaborators: React.FC<FindCollaboratorsProps> = ({
  onSearch,
  currentLocation,
  userPreferences,
  className = ''
}) => {
  const [quickSearchMode, setQuickSearchMode] = useState<'nearby' | 'remote' | 'skills' | 'custom'>('nearby');
  const [searchQuery, setSearchQuery] = useState('');
  const [customRadius, setCustomRadius] = useState(10);

  // 快速搜索选项
  const quickSearchOptions = [
    {
      mode: 'nearby' as const,
      label: '附近协作',
      icon: MapPin,
      description: '寻找附近的协作伙伴',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      mode: 'remote' as const,
      label: '远程协作',
      icon: Users,
      description: '寻找远程协作伙伴',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      mode: 'skills' as const,
      label: '技能匹配',
      icon: Zap,
      description: '基于技能寻找伙伴',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    {
      mode: 'custom' as const,
      label: '自定义搜索',
      icon: Filter,
      description: '自定义搜索条件',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ];

  // 执行搜索
  const handleSearch = () => {
    let searchParams: GeoSearchParams = {
      query: searchQuery
    };

    switch (quickSearchMode) {
      case 'nearby':
        if (currentLocation) {
          searchParams = {
            ...searchParams,
            center: currentLocation,
            radius: customRadius,
            collaborationMode: COLLABORATION_MODES.LOCAL_ONLY
          };
        }
        break;

      case 'remote':
        searchParams = {
          ...searchParams,
          collaborationMode: COLLABORATION_MODES.REMOTE_FRIENDLY
        };
        break;

      case 'skills':
        // 技能匹配搜索
        searchParams = {
          ...searchParams,
          collaborationMode: 'all'
        };
        break;

      case 'custom':
        // 使用用户偏好
        if (userPreferences) {
          searchParams = {
            ...searchParams,
            collaborationMode: userPreferences.mode,
            radius: userPreferences.maxDistance,
            center: currentLocation || undefined
          };
        }
        break;
    }

    onSearch(searchParams);
  };

  // 智能推荐搜索
  const handleSmartSearch = () => {
    if (userPreferences && currentLocation) {
      const smartParams: GeoSearchParams = {
        center: currentLocation,
        collaborationMode: userPreferences.mode,
        radius: userPreferences.maxDistance || 50,
        meetingPreference: userPreferences.meetingPreference
      };
      onSearch(smartParams);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 ${className}`}>
      {/* 标题 */}
      <div className="flex items-center space-x-2 mb-4">
        <Search className="w-5 h-5 text-primary-500" />
        <h3 className="font-semibold text-gray-900">寻找协作伙伴</h3>
      </div>

      {/* 搜索输入框 */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="输入技能、项目类型或关键词..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
      </div>

      {/* 快速搜索选项 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {quickSearchOptions.map((option) => {
          const IconComponent = option.icon;
          const isSelected = quickSearchMode === option.mode;
          
          return (
            <button
              key={option.mode}
              onClick={() => setQuickSearchMode(option.mode)}
              className={`
                flex items-center space-x-2 p-3 rounded-lg border transition-all duration-200 text-left
                ${isSelected 
                  ? `${option.borderColor} ${option.bgColor} shadow-sm` 
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <IconComponent className={`w-4 h-4 ${isSelected ? option.color : 'text-gray-400'}`} />
              <div className="flex-1">
                <div className={`font-medium text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {option.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 附近搜索的距离设置 */}
      {quickSearchMode === 'nearby' && currentLocation && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            搜索半径: {customRadius} 公里
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={customRadius}
            onChange={(e) => setCustomRadius(parseInt(e.target.value))}
            className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-blue-600 mt-1">
            <span>1km</span>
            <span>100km</span>
          </div>
        </div>
      )}

      {/* 搜索按钮 */}
      <div className="flex space-x-2">
        <button
          onClick={handleSearch}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>开始搜索</span>
        </button>
        
        {userPreferences && currentLocation && (
          <button
            onClick={handleSmartSearch}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
            title="基于您的偏好智能搜索"
          >
            <Zap className="w-4 h-4" />
            <span>智能搜索</span>
          </button>
        )}
      </div>

      {/* 搜索提示 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600">
          <div className="font-medium mb-1">搜索提示:</div>
          <ul className="text-xs space-y-1">
            <li>• 使用具体的技能关键词，如 "React"、"UI设计"</li>
            <li>• 尝试项目类型，如 "创业项目"、"开源项目"</li>
            <li>• 搜索行业领域，如 "金融科技"、"教育"</li>
            {currentLocation && (
              <li>• 附近搜索会优先显示距离较近的项目</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};