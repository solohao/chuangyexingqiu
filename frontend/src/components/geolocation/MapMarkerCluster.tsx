// 地图标记聚合组件

import React, { useEffect, useRef, useState } from 'react';
import { ProjectWithLocation } from '../../types/geolocation.types';
import { loadAMapScript } from '../../config/amap.config';

interface MapMarkerClusterProps {
  projects: ProjectWithLocation[];
  center?: [number, number];
  zoom?: number;
  onMarkerClick?: (project: ProjectWithLocation) => void;
  onMapBoundsChange?: (bounds: any) => void;
  clustering?: boolean;
  height?: string;
  className?: string;
}

export const MapMarkerCluster: React.FC<MapMarkerClusterProps> = ({
  projects,
  center = [116.397428, 39.90923],
  zoom = 10,
  onMarkerClick,
  onMapBoundsChange,
  clustering = true,
  height = '500px',
  className = ''
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const clusterRef = useRef<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadAMapScript();
        
        if (!mapContainerRef.current) return;

        const map = new window.AMap.Map(mapContainerRef.current, {
          center: center,
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

        // 监听地图边界变化
        if (onMapBoundsChange) {
          map.on('moveend', () => {
            const bounds = map.getBounds();
            onMapBoundsChange(bounds);
          });

          map.on('zoomend', () => {
            const bounds = map.getBounds();
            onMapBoundsChange(bounds);
          });
        }

        mapInstanceRef.current = map;
        setLoading(false);

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

  // 更新项目标记
  useEffect(() => {
    if (!mapInstanceRef.current || loading) return;

    updateMarkers();
  }, [projects, clustering, loading]);

  // 更新标记
  const updateMarkers = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 清除旧标记
    if (markersRef.current.length > 0) {
      map.remove(markersRef.current);
      markersRef.current = [];
    }

    // 清除旧聚合
    if (clusterRef.current) {
      clusterRef.current.setMap(null);
      clusterRef.current = null;
    }

    // 创建新标记
    const markers = projects
      .filter(project => project.geolocation?.location)
      .map(project => {
        const { latitude, longitude } = project.geolocation!.location;
        
        // 根据协作模式选择不同的标记样式
        const markerStyle = getMarkerStyle(project);
        
        const marker = new window.AMap.Marker({
          position: [longitude, latitude],
          title: project.title,
          icon: new window.AMap.Icon({
            image: markerStyle.icon,
            size: new window.AMap.Size(markerStyle.size.width, markerStyle.size.height),
            imageOffset: new window.AMap.Pixel(-markerStyle.size.width/2, -markerStyle.size.height)
          }),
          anchor: 'bottom-center',
          extData: { project }
        });

        // 添加点击事件
        marker.on('click', () => {
          if (onMarkerClick) {
            onMarkerClick(project);
          }
        });

        return marker;
      });

    markersRef.current = markers;

    if (clustering && markers.length > 0) {
      // 使用聚合功能
      try {
        // 加载聚合插件
        window.AMap.plugin(['AMap.MarkerCluster'], () => {
          const cluster = new window.AMap.MarkerCluster(map, markers, {
            gridSize: 80,
            maxZoom: 15,
            averageCenter: true,
            styles: [
              {
                url: createClusterIcon(20, '#3B82F6'),
                size: new window.AMap.Size(40, 40),
                offset: new window.AMap.Pixel(-20, -20),
                textColor: '#fff',
                textSize: 12
              },
              {
                url: createClusterIcon(30, '#1D4ED8'),
                size: new window.AMap.Size(50, 50),
                offset: new window.AMap.Pixel(-25, -25),
                textColor: '#fff',
                textSize: 14
              },
              {
                url: createClusterIcon(40, '#1E40AF'),
                size: new window.AMap.Size(60, 60),
                offset: new window.AMap.Pixel(-30, -30),
                textColor: '#fff',
                textSize: 16
              }
            ]
          });

          clusterRef.current = cluster;
        });
      } catch (error) {
        console.warn('聚合插件加载失败，使用普通标记:', error);
        map.add(markers);
      }
    } else {
      // 不使用聚合，直接添加标记
      map.add(markers);
    }

    // 自动调整视野以包含所有标记
    if (markers.length > 0) {
      map.setFitView(markers, false, [20, 20, 20, 20]);
    }
  };

  // 根据项目协作模式获取标记样式
  const getMarkerStyle = (project: ProjectWithLocation) => {
    const collaborationMode = project.geolocation?.collaborationPreference.mode || 'location_flexible';
    const locationType = project.geolocation?.locationSettings.type || 'hybrid';

    let color = '#3B82F6'; // 默认蓝色
    let icon = '🏢';

    // 根据协作模式设置颜色
    switch (collaborationMode) {
      case 'local_only':
        color = '#EF4444'; // 红色
        break;
      case 'remote_friendly':
        color = '#10B981'; // 绿色
        break;
      case 'location_flexible':
        color = '#8B5CF6'; // 紫色
        break;
    }

    // 根据位置类型设置图标
    switch (locationType) {
      case 'physical':
        icon = '🏢';
        break;
      case 'remote':
        icon = '💻';
        break;
      case 'hybrid':
        icon = '🔄';
        break;
    }

    return {
      icon: createMarkerIcon(icon, color),
      size: { width: 32, height: 32 }
    };
  };

  // 创建标记图标
  const createMarkerIcon = (emoji: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // 绘制背景圆圈
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(16, 16, 14, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制白色边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 绘制emoji
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(emoji, 16, 16);

    return canvas.toDataURL();
  };

  // 创建聚合图标
  const createClusterIcon = (size: number, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // 绘制背景圆圈
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
    ctx.fill();

    // 绘制白色边框
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();

    return canvas.toDataURL();
  };

  return (
    <div className={`relative ${className}`} style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      
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
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 font-semibold mb-2">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              刷新页面
            </button>
          </div>
        </div>
      )}

      {/* 图例 */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-medium text-gray-700 mb-2">协作模式</div>
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>仅限本地</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>远程友好</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>位置灵活</span>
          </div>
        </div>
      </div>

      {/* 项目统计 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
        <div className="font-medium text-gray-700">
          显示 {projects.filter(p => p.geolocation?.location).length} 个项目
        </div>
        {clustering && projects.length > 10 && (
          <div className="text-gray-500 mt-1">
            使用聚合显示
          </div>
        )}
      </div>
    </div>
  );
};