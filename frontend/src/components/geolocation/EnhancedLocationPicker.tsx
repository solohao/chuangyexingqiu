// 增强版地图位置选择器组件

import React, { useState } from 'react';
import { MapPin, Search, Layers, Maximize2, Minimize2 } from 'lucide-react';
import { GeoLocation } from '../../types/geolocation.types';
import { LocationPicker } from './LocationPicker';
import { BusinessAddressValidator } from './BusinessAddressValidator';

interface EnhancedLocationPickerProps {
  center?: GeoLocation;
  zoom?: number;
  onLocationSelect: (location: GeoLocation, address: string) => void;
  selectedLocation?: GeoLocation;
  searchEnabled?: boolean;
  showBusinessValidation?: boolean;
  showMapControls?: boolean;
  allowFullscreen?: boolean;
  className?: string;
  height?: string;
}

export const EnhancedLocationPicker: React.FC<EnhancedLocationPickerProps> = ({
  center,
  zoom,
  onLocationSelect,
  selectedLocation,
  searchEnabled = true,
  showBusinessValidation = true,
  showMapControls = true,
  allowFullscreen = true,
  className = '',
  height = '400px'
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapType, setMapType] = useState<'normal' | 'satellite'>('normal');
  const [currentAddress, setCurrentAddress] = useState('');
  const [showAddressValidation, setShowAddressValidation] = useState(false);

  // 处理位置选择
  const handleLocationSelect = (location: GeoLocation, address: string) => {
    setCurrentAddress(address);
    setShowAddressValidation(showBusinessValidation && address.trim().length > 0);
    onLocationSelect(location, address);
  };

  // 切换全屏模式
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // 切换地图类型
  const toggleMapType = () => {
    setMapType(mapType === 'normal' ? 'satellite' : 'normal');
    // 这里可以添加实际的地图类型切换逻辑
  };

  const containerClass = isFullscreen 
    ? 'fixed inset-0 z-50 bg-white' 
    : className;

  const mapHeight = isFullscreen ? '100vh' : height;

  return (
    <div className={containerClass}>
      <div className="h-full flex flex-col">
        {/* 工具栏 */}
        {showMapControls && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              <span className="font-medium text-gray-900">选择项目位置</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* 地图类型切换 */}
              <button
                onClick={toggleMapType}
                className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                title={mapType === 'normal' ? '切换到卫星图' : '切换到标准地图'}
              >
                <Layers className="w-4 h-4 mr-1" />
                {mapType === 'normal' ? '卫星' : '标准'}
              </button>

              {/* 全屏切换 */}
              {allowFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  title={isFullscreen ? '退出全屏' : '全屏显示'}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-4 h-4" />
                  ) : (
                    <Maximize2 className="w-4 h-4" />
                  )}
                </button>
              )}

              {/* 关闭按钮（仅全屏模式） */}
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  className="flex items-center px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                >
                  关闭
                </button>
              )}
            </div>
          </div>
        )}

        {/* 地图组件 */}
        <div className="flex-1">
          <LocationPicker
            center={center}
            zoom={zoom}
            onLocationSelect={handleLocationSelect}
            selectedLocation={selectedLocation}
            searchEnabled={searchEnabled}
            height={mapHeight}
          />
        </div>

        {/* 地址验证面板 */}
        {showAddressValidation && currentAddress && (
          <div className="border-t border-gray-200 bg-gray-50 p-4">
            <BusinessAddressValidator
              address={currentAddress}
              showSuggestions={true}
            />
          </div>
        )}

        {/* 使用提示 */}
        {!isFullscreen && (
          <div className="border-t border-gray-200 bg-gray-50 p-3">
            <div className="text-xs text-gray-600 space-y-1">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>点击地图选择位置</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>拖拽标记调整</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Search className="w-3 h-3 text-gray-500" />
                  <span>搜索快速定位</span>
                </div>
                {allowFullscreen && (
                  <div className="flex items-center space-x-1">
                    <Maximize2 className="w-3 h-3 text-gray-500" />
                    <span>全屏查看</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};