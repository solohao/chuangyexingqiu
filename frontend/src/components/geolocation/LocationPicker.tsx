// 地图位置选择器组件

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Search, Navigation, RotateCcw, Check } from 'lucide-react';
import { GeoLocation } from '../../types/geolocation.types';
import { GeocodeService } from '../../services/geocode.service';
import { loadAMapScript } from '../../config/amap.config';

interface LocationPickerProps {
  center?: GeoLocation;
  zoom?: number;
  onLocationSelect: (location: GeoLocation, address: string) => void;
  selectedLocation?: GeoLocation;
  searchEnabled?: boolean;
  className?: string;
  height?: string;
}

export const LocationPicker: React.FC<LocationPickerProps> = ({
  center = { latitude: 39.9042, longitude: 116.4074 }, // 默认北京
  zoom = 13,
  onLocationSelect,
  selectedLocation,
  searchEnabled = true,
  className = '',
  height = '400px'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(selectedLocation || center);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadAMapScript();
        
        if (!mapContainerRef.current) return;

        const map = new window.AMap.Map(mapContainerRef.current, {
          center: [currentLocation.longitude, currentLocation.latitude],
          zoom: zoom,
          mapStyle: 'amap://styles/normal',
          resizeEnable: true,
          rotateEnable: true,
          pitchEnable: false,
          zoomEnable: true,
          dragEnable: true
        });

        // 添加控件
        map.addControl(new window.AMap.Scale());
        map.addControl(new window.AMap.ToolBar({ 
          position: 'RB',
          ruler: false,
          direction: false
        }));

        // 创建标记
        const marker = new window.AMap.Marker({
          position: [currentLocation.longitude, currentLocation.latitude],
          icon: new window.AMap.Icon({
            image: 'data:image/svg+xml;base64,' + btoa(`
              <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="8" fill="#3B82F6" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="16" r="3" fill="white"/>
              </svg>
            `),
            size: new window.AMap.Size(32, 32),
            imageOffset: new window.AMap.Pixel(-16, -16)
          }),
          anchor: 'center',
          draggable: true
        });

        map.add(marker);

        // 监听地图点击事件
        map.on('click', (e: any) => {
          const { lng, lat } = e.lnglat;
          updateLocation({ latitude: lat, longitude: lng });
        });

        // 监听标记拖拽事件
        marker.on('dragend', (e: any) => {
          const { lng, lat } = e.lnglat;
          updateLocation({ latitude: lat, longitude: lng });
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setLoading(false);

        // 获取初始地址
        if (currentLocation) {
          reverseGeocode(currentLocation);
        }

      } catch (err) {
        console.error('地图初始化失败:', err);
        setError('地图加载失败，请刷新页面重试');
        setLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, []);

  // 更新位置
  const updateLocation = async (location: GeoLocation) => {
    setCurrentLocation(location);
    
    // 更新地图中心和标记位置
    if (mapInstanceRef.current && markerRef.current) {
      const position = [location.longitude, location.latitude];
      mapInstanceRef.current.setCenter(position);
      markerRef.current.setPosition(position);
    }

    // 逆地理编码获取地址
    await reverseGeocode(location);
  };

  // 逆地理编码
  const reverseGeocode = async (location: GeoLocation) => {
    try {
      const result = await GeocodeService.reverseGeocode(location);
      if (!result.error && result.address) {
        setCurrentAddress(result.formattedAddress);
        onLocationSelect(location, result.formattedAddress);
      } else {
        setCurrentAddress('未知地址');
        onLocationSelect(location, '未知地址');
      }
    } catch (error) {
      console.error('逆地理编码失败:', error);
      setCurrentAddress('地址解析失败');
      onLocationSelect(location, '地址解析失败');
    }
  };

  // 搜索地址
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const result = await GeocodeService.geocodeAddress(searchQuery);
      
      if (!result.error && result.location) {
        await updateLocation(result.location);
        setSearchQuery('');
      } else {
        setError('地址搜索失败，请尝试其他关键词');
        setTimeout(() => setError(null), 3000);
      }
    } catch (error) {
      console.error('地址搜索失败:', error);
      setError('搜索服务暂时不可用');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // 获取当前位置
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('您的浏览器不支持定位功能');
      setTimeout(() => setError(null), 3000);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location: GeoLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
        updateLocation(location);
        setIsLocating(false);
      },
      (error) => {
        console.error('定位失败:', error);
        let errorMessage = '定位失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = '定位权限被拒绝';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = '位置信息不可用';
            break;
          case error.TIMEOUT:
            errorMessage = '定位请求超时';
            break;
        }
        setError(errorMessage);
        setTimeout(() => setError(null), 3000);
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // 重置到初始位置
  const resetLocation = () => {
    updateLocation(selectedLocation || center);
  };

  // 处理搜索框回车
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 搜索栏 */}
      {searchEnabled && (
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="搜索地址或地标..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchQuery.trim() || loading}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            搜索
          </button>
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={getCurrentLocation}
            disabled={isLocating}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 disabled:opacity-50"
          >
            <Navigation className={`w-4 h-4 mr-1 ${isLocating ? 'animate-spin' : ''}`} />
            {isLocating ? '定位中...' : '当前位置'}
          </button>
          
          <button
            onClick={resetLocation}
            className="flex items-center px-3 py-1.5 text-sm bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            重置
          </button>
        </div>

        {currentAddress && (
          <div className="flex items-center text-sm text-gray-600">
            <Check className="w-4 h-4 mr-1 text-green-500" />
            已选择位置
          </div>
        )}
      </div>

      {/* 地图容器 */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden">
        <div 
          ref={mapContainerRef} 
          style={{ height }}
          className="w-full"
        />
        
        {/* 加载状态 */}
        {loading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">地图加载中...</div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded-md p-3">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* 地图中心十字线 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="w-6 h-6">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-primary-500 transform -translate-y-1/2"></div>
            <div className="absolute left-1/2 top-0 w-0.5 h-full bg-primary-500 transform -translate-x-1/2"></div>
          </div>
        </div>
      </div>

      {/* 当前选择的地址信息 */}
      {currentAddress && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">选中位置</div>
              <div className="text-sm text-gray-600 mt-1">{currentAddress}</div>
              <div className="text-xs text-gray-500 mt-2">
                坐标: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 点击地图上的任意位置来选择项目位置</p>
        <p>💡 拖拽蓝色标记来精确调整位置</p>
        <p>💡 使用搜索功能快速定位到具体地址</p>
      </div>
    </div>
  );
};