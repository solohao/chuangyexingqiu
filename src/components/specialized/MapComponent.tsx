import React, { useEffect, useRef, useState } from 'react'
import { loadAMapScript, PROJECT_MARKER_STYLE, DEFAULT_MAP_OPTIONS } from '../../config/amap.config'

// 项目数据接口
interface Project {
  id: string;
  title: string;
  type: string;
  position: [number, number];
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  projects?: Project[];
  onMarkerClick?: (project: Project) => void;
  hoveredProjectId?: string | null;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = DEFAULT_MAP_OPTIONS.center,
  zoom = DEFAULT_MAP_OPTIONS.zoom,
  className = '',
  style = {},
  projects = [],
  onMarkerClick,
  hoveredProjectId,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<any[]>([])

  // 初始化地图
  useEffect(() => {
    const initMap = async () => {
      try {
        await loadAMapScript()
        if (!mapContainerRef.current) return
        
        const map = new window.AMap.Map(mapContainerRef.current, {
          ...DEFAULT_MAP_OPTIONS,
          center,
          zoom,
        })
        
        map.addControl(new window.AMap.Scale())
        map.addControl(new window.AMap.ToolBar({ position: 'RB' }))
        
        mapInstanceRef.current = map;
        setLoading(false)
      } catch (err) {
        console.error('地图加载失败:', err)
        setError('地图加载失败，请刷新页面重试')
        setLoading(false)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }
    }
  }, []) // 仅在组件挂载时执行

  // 添加或更新项目标记
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !projects) return;

    // 清除旧标记
    map.remove(markers);

    const newMarkers = projects.map(project => {
      const isHovered = project.id === hoveredProjectId;

      const icon = new window.AMap.Icon({
        image: isHovered ? PROJECT_MARKER_STYLE.hover.icon : PROJECT_MARKER_STYLE.normal.icon,
        size: new window.AMap.Size(
          ...(isHovered ? PROJECT_MARKER_STYLE.hover.size : PROJECT_MARKER_STYLE.normal.size)
        ),
        imageOffset: new window.AMap.Pixel(0, 0),
      });

      const marker = new window.AMap.Marker({
        position: project.position,
        title: project.title,
        icon: icon,
        anchor: 'bottom-center',
        extData: { project }
      });

      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(project)
        }
      });
      
      return marker;
    });

    map.add(newMarkers);
    setMarkers(newMarkers);

  }, [projects, hoveredProjectId]);

  // 当地图容器大小变化时，调整地图大小
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // 创建一个ResizeObserver来监听容器大小变化
    const resizeObserver = new ResizeObserver(() => {
      map.resize();
    });

    // 开始观察容器
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    // 清理函数
    return () => {
      if (mapContainerRef.current) {
        resizeObserver.unobserve(mapContainerRef.current);
      }
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className={`relative w-full h-full ${className}`} style={{ ...style, minHeight: '600px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="text-primary-600 font-semibold">地图加载中...</div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-danger-600 font-semibold">{error}</div>
        </div>
      )}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  )
}

export default MapComponent;
