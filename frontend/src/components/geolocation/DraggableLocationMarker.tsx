// 可拖拽的位置标记组件

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Move, Check, RotateCcw } from 'lucide-react';
import { GeoLocation } from '../../types/geolocation.types';
import { GeocodeService } from '../../services/geocode.service';
import { loadAMapScript } from '../../config/amap.config';

interface DraggableLocationMarkerProps {
  initialLocation: GeoLocation;
  onLocationChange: (location: GeoLocation, address: string) => void;
  zoom?: number;
  height?: string;
  showControls?: boolean;
  showAddressInfo?: boolean;
  className?: string;
}

export const DraggableLocationMarker: React.FC<DraggableLocationMarkerProps> = ({
  initialLocation,
  onLocationChange,
  zoom = 15,
  height = '300px',
  showControls = true,
  showAddressInfo = true,
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<GeoLocation>(initialLocation);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isUpdatingAddress, setIsUpdatingAddress] = useState(false);

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadAMapScript();
        
        if (!mapContainerRef.current) return;

        const map = new window.AMap.Map(mapContainerRef.current, {
          center: [initialLocation.longitude, initialLocation.latitude],
          zoom: zoom,
          mapStyle: 'amap://styles/normal',
          resizeEnable: true,
          rotateEnable: false,
          pitchEnable: false,
          zoomEnable: true,
          dragEnable: true
        });

        // 创建可拖拽标记
        const marker = new window.AMap.Marker({
          position: [initialLocation.longitude, initialLocation.latitude],
          icon: new window.AMap.Icon({
            image: createDraggableMarkerIcon(),
            size: new window.AMap.Size(40, 40),
            imageOffset: new window.AMap.Pixel(-20, -40)
          }),
          anchor: 'bottom-center',
          draggable: true,
          cursor: 'move'
        });

        // 监听拖拽事件
        marker.on('dragstart', () => {
          setIsDragging(true);
        });

        marker.on('dragging', (e: any) => {
          const { lng, lat } = e.lnglat;
          setCurrentLocation({ latitude: lat, longitude: lng });
        });

        marker.on('dragend', async (e: any) => {
          const { lng, lat } = e.lnglat;
          const newLocation = { latitude: lat, longitude: lng };
          
          setCurrentLocation(newLocation);
          setIsDragging(false);
          
          // 获取新地址
          await updateAddress(newLocation);
        });

        map.add(marker);

        mapInstanceRef.current = map;
        markerRef.current = marker;
        setLoading(false);

        // 获取初始地址
        await updateAddress(initialLocation);

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

  // 更新地址信息
  const updateAddress = async (location: GeoLocation) => {
    setIsUpdatingAddress(true);
    try {
      const result = await GeocodeService.reverseGeocode(location);
      const address = result.error ? '地址解析失败' : result.formattedAddress;
      
      setCurrentAddress(address);
      onLocationChange(location, address);
    } catch (error) {
      console.error('地址更新失败:', error);
      setCurrentAddress('地址解析失败');
      onLocationChange(location, '地址解析失败');
    } finally {
      setIsUpdatingAddress(false);
    }
  };

  // 重置到初始位置
  const resetLocation = async () => {
    if (mapInstanceRef.current && markerRef.current) {
      const position = [initialLocation.longitude, initialLocation.latitude];
      mapInstanceRef.current.setCenter(position);
      markerRef.current.setPosition(position);
      
      setCurrentLocation(initialLocation);
      await updateAddress(initialLocation);
    }
  };

  // 确认当前位置
  const confirmLocation = () => {
    onLocationChange(currentLocation, currentAddress);
  };

  // 创建可拖拽标记图标
  const createDraggableMarkerIcon = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d')!;

    // 绘制阴影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(20, 35, 8, 3, 0, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制主体
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.arc(20, 20, 12, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制白色边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制中心点
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(20, 20, 4, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制指针
    ctx.fillStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(20, 32);
    ctx.lineTo(16, 26);
    ctx.lineTo(24, 26);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 地图容器 */}
      <div className="relative border border-gray-300 rounded-lg overflow-hidden">
        <div ref={mapContainerRef} style={{ height }} className="w-full" />
        
        {/* 加载状态 */}
        {loading && (
          <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500 mx-auto mb-2"></div>
              <div className="text-sm text-gray-600">地图加载中...</div>
            </div>
          </div>
        )}

        {/* 错误状态 */}
        {error && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <div className="text-sm text-red-600">{error}</div>
          </div>
        )}

        {/* 拖拽提示 */}
        {isDragging && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
            <Move className="w-4 h-4 inline mr-1" />
            拖拽调整位置
          </div>
        )}

        {/* 地址更新提示 */}
        {isUpdatingAddress && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-500"></div>
              <span>正在获取地址...</span>
            </div>
          </div>
        )}
      </div>

      {/* 控制按钮 */}
      {showControls && (
        <div className="flex justify-between items-center">
          <button
            onClick={resetLocation}
            className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            重置位置
          </button>

          <button
            onClick={confirmLocation}
            disabled={isDragging || isUpdatingAddress}
            className="flex items-center px-4 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4 mr-1" />
            确认位置
          </button>
        </div>
      )}

      {/* 地址信息 */}
      {showAddressInfo && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 text-primary-500 mt-0.5" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">当前位置</div>
              <div className="text-sm text-gray-600 mt-1">
                {isUpdatingAddress ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                    <span>地址解析中...</span>
                  </div>
                ) : (
                  currentAddress || '未知地址'
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                坐标: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 拖拽蓝色标记来调整项目的精确位置</p>
        <p>💡 松开鼠标后会自动获取新位置的地址信息</p>
        <p>💡 点击"重置位置"可以恢复到初始位置</p>
      </div>
    </div>
  );
};