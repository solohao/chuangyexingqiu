// 位置可见性设置组件

import React from 'react';
import { Eye, EyeOff, MapPin, Users, Shield, Globe } from 'lucide-react';
import { LOCATION_VISIBILITY } from '../../types/geolocation.types';

interface LocationVisibilitySettingsProps {
  visibility: 'public' | 'city_only' | 'hidden';
  onVisibilityChange: (visibility: 'public' | 'city_only' | 'hidden') => void;
  showExactAddress: boolean;
  onShowExactAddressChange: (show: boolean) => void;
  allowContactForMeetup: boolean;
  onAllowContactForMeetupChange: (allow: boolean) => void;
  locationType: 'physical' | 'remote' | 'hybrid';
  className?: string;
}

export const LocationVisibilitySettings: React.FC<LocationVisibilitySettingsProps> = ({
  visibility,
  onVisibilityChange,
  showExactAddress,
  onShowExactAddressChange,
  allowContactForMeetup,
  onAllowContactForMeetupChange,
  locationType,
  className = ''
}) => {
  const visibilityOptions = [
    {
      value: LOCATION_VISIBILITY.PUBLIC,
      label: '公开显示',
      icon: Globe,
      description: '在地图和项目列表中显示详细位置信息',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      value: LOCATION_VISIBILITY.CITY_ONLY,
      label: '仅显示城市',
      icon: MapPin,
      description: '只显示城市信息，不显示具体地址',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    {
      value: LOCATION_VISIBILITY.HIDDEN,
      label: '完全隐藏',
      icon: EyeOff,
      description: '不在地图上显示，仅在联系时透露',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 位置可见性选择 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          位置可见性设置
        </label>
        <div className="space-y-3">
          {visibilityOptions.map((option) => {
            const IconComponent = option.icon;
            const isSelected = visibility === option.value;
            
            return (
              <div
                key={option.value}
                onClick={() => onVisibilityChange(option.value as any)}
                className={`
                  p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
                  ${isSelected 
                    ? `${option.borderColor} ${option.bgColor} shadow-sm` 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <IconComponent className={`w-5 h-5 mt-0.5 ${option.color}`} />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{option.label}</div>
                      {isSelected && (
                        <div className="w-4 h-4 bg-primary-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 详细地址显示设置 */}
      {visibility !== LOCATION_VISIBILITY.HIDDEN && locationType !== 'remote' && (
        <div className="border-t pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-1">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showExactAddress}
                  onChange={(e) => onShowExactAddressChange(e.target.checked)}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-gray-900">显示详细地址</div>
                  <div className="text-sm text-gray-600">
                    在项目详情中显示完整的办公地址
                  </div>
                </div>
              </label>
            </div>
            <Eye className="w-5 h-5 text-gray-400 mt-0.5" />
          </div>
          
          {showExactAddress && visibility === LOCATION_VISIBILITY.PUBLIC && (
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-2">
                <Shield className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <div className="font-medium">隐私提醒</div>
                  <div className="mt-1">
                    显示详细地址可能会暴露您的具体位置信息。请确保您愿意公开这些信息。
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 允许联系见面设置 */}
      <div className="border-t pt-6">
        <div className="flex items-start space-x-3">
          <div className="flex-1">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowContactForMeetup}
                onChange={(e) => onAllowContactForMeetupChange(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <div>
                <div className="font-medium text-gray-900">允许联系安排见面</div>
                <div className="text-sm text-gray-600">
                  其他用户可以联系您安排线下见面或参观
                </div>
              </div>
            </label>
          </div>
          <Users className="w-5 h-5 text-gray-400 mt-0.5" />
        </div>

        {allowContactForMeetup && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <Users className="w-4 h-4 text-blue-500 mt-0.5" />
              <div className="text-sm text-blue-800">
                <div className="font-medium">协作提醒</div>
                <div className="mt-1">
                  开启此选项有助于建立更紧密的合作关系，但请注意保护个人隐私和安全。
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 设置建议 */}
      <div className="border-t pt-6">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <Shield className="w-4 h-4 text-gray-500 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">隐私建议</div>
              <div className="text-xs text-gray-600 mt-1 space-y-1">
                {locationType === 'physical' && (
                  <div>• 实体办公项目建议至少显示城市信息以便合作伙伴找到您</div>
                )}
                {locationType === 'remote' && (
                  <div>• 远程项目可以选择隐藏具体位置，只在需要时透露时区信息</div>
                )}
                {locationType === 'hybrid' && (
                  <div>• 混合模式项目建议显示主要办公城市，便于安排线下协作</div>
                )}
                <div>• 可以随时在项目设置中修改这些隐私选项</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 当前设置摘要 */}
      <div className="border-t pt-6">
        <div className="text-sm text-gray-600">
          <div className="font-medium text-gray-700 mb-2">当前设置摘要：</div>
          <ul className="space-y-1">
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>
                位置可见性: {visibilityOptions.find(opt => opt.value === visibility)?.label}
              </span>
            </li>
            {visibility !== LOCATION_VISIBILITY.HIDDEN && locationType !== 'remote' && (
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                <span>
                  详细地址: {showExactAddress ? '显示' : '隐藏'}
                </span>
              </li>
            )}
            <li className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
              <span>
                联系见面: {allowContactForMeetup ? '允许' : '不允许'}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};