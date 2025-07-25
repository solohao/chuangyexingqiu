// 协作偏好筛选组件

import React, { useState, useEffect } from 'react';
import { Filter, MapPin, Users, Wifi, Building, Search, Star, Sliders } from 'lucide-react';
import { 
  GeoLocation, 
  GeoSearchParams, 
  CollaborationPreference,
  COLLABORATION_MODES,
  LOCATION_TYPES,
  MEETING_PREFERENCES
} from '../../types/geolocation.types';

interface CollaborationFilterProps {
  onFilterChange: (filters: GeoSearchParams) => void;
  currentLocation?: GeoLocation | null;
  userPreferences?: CollaborationPreference;
  showDistanceFilter?: boolean;
  showCollaborationMode?: boolean;
  className?: string;
}

export const CollaborationFilter: React.FC<CollaborationFilterProps> = ({
  onFilterChange,
  currentLocation,
  userPreferences,
  showDistanceFilter = true,
  showCollaborationMode = true,
  className = ''
}) => {
  const [filters, setFilters] = useState<GeoSearchParams>({
    collaborationMode: 'all',
    locationType: undefined,
    meetingPreference: undefined,
    radius: 50,
    query: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // 协作模式选项
  const collaborationModeOptions = [
    {
      value: 'all',
      label: '全部模式',
      icon: Filter,
      description: '显示所有协作模式的项目',
      color: 'text-gray-600'
    },
    {
      value: COLLABORATION_MODES.LOCAL_ONLY,
      label: '仅限本地',
      icon: MapPin,
      description: '只显示本地协作的项目',
      color: 'text-blue-600'
    },
    {
      value: COLLABORATION_MODES.REMOTE_FRIENDLY,
      label: '远程友好',
      icon: Wifi,
      description: '显示支持远程协作的项目',
      color: 'text-green-600'
    },
    {
      value: COLLABORATION_MODES.LOCATION_FLEXIBLE,
      label: '位置灵活',
      icon: Users,
      description: '显示位置灵活的项目',
      color: 'text-purple-600'
    }
  ];

  // 位置类型选项
  const locationTypeOptions = [
    {
      value: undefined,
      label: '全部类型',
      icon: Filter,
      description: '显示所有位置类型的项目'
    },
    {
      value: LOCATION_TYPES.PHYSICAL,
      label: '实体办公',
      icon: Building,
      description: '有固定办公地点的项目'
    },
    {
      value: LOCATION_TYPES.REMOTE,
      label: '远程办公',
      icon: Wifi,
      description: '完全远程办公的项目'
    },
    {
      value: LOCATION_TYPES.HYBRID,
      label: '混合模式',
      icon: Users,
      description: '线上线下结合的项目'
    }
  ];

  // 会议偏好选项
  const meetingPreferenceOptions = [
    {
      value: undefined,
      label: '全部偏好',
      description: '显示所有会议偏好的项目'
    },
    {
      value: MEETING_PREFERENCES.ONLINE,
      label: '仅线上会议',
      description: '只进行线上会议的项目'
    },
    {
      value: MEETING_PREFERENCES.OFFLINE,
      label: '仅线下会议',
      description: '只进行线下会议的项目'
    },
    {
      value: MEETING_PREFERENCES.BOTH,
      label: '线上线下都可',
      description: '支持两种会议方式的项目'
    }
  ];

  // 更新筛选条件
  const updateFilter = (key: keyof GeoSearchParams, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // 智能推荐
  const handleSmartRecommendation = () => {
    if (userPreferences && currentLocation) {
      const smartFilters: GeoSearchParams = {
        collaborationMode: userPreferences.mode,
        meetingPreference: userPreferences.meetingPreference,
        radius: userPreferences.maxDistance || 50,
        center: currentLocation
      };
      setFilters(smartFilters);
      onFilterChange(smartFilters);
    }
  };

  // 清除筛选
  const clearFilters = () => {
    const clearedFilters: GeoSearchParams = {
      collaborationMode: 'all',
      locationType: undefined,
      meetingPreference: undefined,
      radius: 50,
      query: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-4 space-y-4 ${className}`}>
      {/* 标题和操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold text-gray-900">协作筛选</h3>
        </div>
        <div className="flex items-center space-x-2">
          {userPreferences && currentLocation && (
            <button
              onClick={handleSmartRecommendation}
              className="flex items-center space-x-1 px-3 py-1 bg-primary-50 text-primary-600 rounded-md hover:bg-primary-100 transition-colors text-sm"
            >
              <Star className="w-4 h-4" />
              <span>智能推荐</span>
            </button>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-1 px-3 py-1 bg-gray-50 text-gray-600 rounded-md hover:bg-gray-100 transition-colors text-sm"
          >
            <Sliders className="w-4 h-4" />
            <span>{showAdvanced ? '简化' : '高级'}</span>
          </button>
        </div>
      </div>

      {/* 搜索框 */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={filters.query || ''}
          onChange={(e) => updateFilter('query', e.target.value)}
          placeholder="搜索项目或地点..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
        />
      </div>

      {/* 协作模式筛选 */}
      {showCollaborationMode && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            协作模式
          </label>
          <div className="grid grid-cols-2 gap-2">
            {collaborationModeOptions.map((option) => {
              const IconComponent = option.icon;
              const isSelected = filters.collaborationMode === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => updateFilter('collaborationMode', option.value)}
                  className={`
                    flex items-center space-x-2 p-2 rounded-md border transition-colors text-sm
                    ${isSelected 
                      ? 'border-primary-500 bg-primary-50 text-primary-700' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                  `}
                >
                  <IconComponent className={`w-4 h-4 ${isSelected ? 'text-primary-500' : option.color}`} />
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 距离筛选 */}
      {showDistanceFilter && currentLocation && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            搜索半径: {filters.radius} 公里
          </label>
          <input
            type="range"
            min="1"
            max="200"
            value={filters.radius || 50}
            onChange={(e) => updateFilter('radius', parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1km</span>
            <span>200km</span>
          </div>
        </div>
      )}

      {/* 高级筛选选项 */}
      {showAdvanced && (
        <div className="space-y-4 pt-4 border-t">
          {/* 位置类型筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              位置类型
            </label>
            <select
              value={filters.locationType || ''}
              onChange={(e) => updateFilter('locationType', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {locationTypeOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* 会议偏好筛选 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              会议偏好
            </label>
            <select
              value={filters.meetingPreference || ''}
              onChange={(e) => updateFilter('meetingPreference', e.target.value || undefined)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              {meetingPreferenceOptions.map((option) => (
                <option key={option.value || 'all'} value={option.value || ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between pt-4 border-t">
        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
        >
          清除筛选
        </button>
        <div className="text-sm text-gray-500">
          {filters.collaborationMode !== 'all' || filters.locationType || filters.meetingPreference || filters.query
            ? '已应用筛选条件'
            : '显示所有项目'
          }
        </div>
      </div>
    </div>
  );
};