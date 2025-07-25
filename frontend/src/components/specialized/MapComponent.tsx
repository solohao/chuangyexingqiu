import React, { useEffect, useRef, useState, useCallback } from 'react'
import { loadAMapScript, DEFAULT_MAP_OPTIONS } from '../../config/amap.config'
import { ProjectWithLocation, GeoLocation, GeoBounds } from '../../types/geolocation.types'
import { Users, Building, Wifi } from 'lucide-react'

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: React.CSSProperties;
  projects?: ProjectWithLocation[];
  onMarkerClick?: (project: ProjectWithLocation) => void;
  onMapBoundsChange?: (bounds: GeoBounds) => void;
  hoveredProjectId?: string | null;
  clustering?: boolean;
  highlightCompatibleProjects?: boolean;
  userLocation?: GeoLocation | null;
  loading?: boolean;
}

const MapComponent: React.FC<MapComponentProps> = ({
  center = DEFAULT_MAP_OPTIONS.center,
  zoom = DEFAULT_MAP_OPTIONS.zoom,
  className = '',
  style = {},
  projects = [],
  onMarkerClick,
  onMapBoundsChange,
  hoveredProjectId,
  clustering = true,
  highlightCompatibleProjects = true,
  userLocation,
  loading: externalLoading = false,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markerClusterRef = useRef<any>(null)
  const userMarkerRef = useRef<any>(null)
  const [internalLoading, setInternalLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [currentBounds, setCurrentBounds] = useState<GeoBounds | null>(null)

  const loading = externalLoading || internalLoading

  // 获取项目类型对应的图标
  const getProjectTypeIcon = (project: ProjectWithLocation) => {
    const locationType = project.geolocation?.locationSettings?.type || 'hybrid'
    const isCompatible = highlightCompatibleProjects && project.distance !== undefined && project.distance < 50

    // 根据位置类型调整图标颜色
    const typeColors = {
      physical: '#3B82F6', // 蓝色
      remote: '#10B981',   // 绿色
      hybrid: '#8B5CF6'    // 紫色
    }

    return {
      color: typeColors[locationType],
      locationType,
      isCompatible
    }
  }

  // 创建自定义标记内容
  const createMarkerContent = (project: ProjectWithLocation) => {
    const { color, locationType } = getProjectTypeIcon(project)
    const isHovered = project.id === hoveredProjectId

    const markerSize = isHovered ? 40 : 32
    const iconSize = isHovered ? 20 : 16

    return `
      <div style="
        width: ${markerSize}px;
        height: ${markerSize}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: all 0.2s ease;
        ${isHovered ? 'transform: scale(1.1);' : ''}
      ">
        <svg width="${iconSize}" height="${iconSize}" fill="white" viewBox="0 0 24 24">
          ${locationType === 'physical' ? 
            '<path d="M3 21h18v-2H3v2zM5 7v12h4V7H5zm6 0v12h4V7h-4zm6 0v12h4V7h-4zM1 3v2h22V3H1z"/>' :
            locationType === 'remote' ?
            '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.07 2.93 1 9zm8 8l3 3 3-3c-1.65-1.66-4.34-1.66-6 0zm-4-4l2 2c2.76-2.76 7.24-2.76 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>' :
            '<path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H16c-.8 0-1.54.37-2.01.99l-2.54 3.4c-.74.99-.74 2.31 0 3.3l1.04 1.4c.38.51.97.81 1.6.81H16v4h4zm-12.5 0v-7.5h-3v-2c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5H9c0-1.85-1.15-3.5-3-3.5s-3 1.65-3 3.5v2H1.5v7.5h2z"/>'
          }
        </svg>
      </div>
    `
  }

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
        
        // 添加地图控件
        map.addControl(new window.AMap.Scale())
        map.addControl(new window.AMap.ToolBar({ position: 'RB' }))
        
        // 监听地图边界变化
        map.on('moveend', () => {
          const bounds = map.getBounds()
          if (bounds && onMapBoundsChange) {
            const geoBounds: GeoBounds = {
              northeast: {
                latitude: bounds.getNorthEast().lat,
                longitude: bounds.getNorthEast().lng
              },
              southwest: {
                latitude: bounds.getSouthWest().lat,
                longitude: bounds.getSouthWest().lng
              }
            }
            setCurrentBounds(geoBounds)
            onMapBoundsChange(geoBounds)
          }
        })

        // 监听缩放变化
        map.on('zoomend', () => {
          const bounds = map.getBounds()
          if (bounds && onMapBoundsChange) {
            const geoBounds: GeoBounds = {
              northeast: {
                latitude: bounds.getNorthEast().lat,
                longitude: bounds.getNorthEast().lng
              },
              southwest: {
                latitude: bounds.getSouthWest().lat,
                longitude: bounds.getSouthWest().lng
              }
            }
            setCurrentBounds(geoBounds)
            onMapBoundsChange(geoBounds)
          }
        })

        // 初始化聚合器（如果启用聚合且插件可用）
        if (clustering && window.AMap && window.AMap.MarkerCluster) {
          try {
            const markerCluster = new window.AMap.MarkerCluster(map, [], {
              gridSize: 80,
              maxZoom: 15,
              averageCenter: true,
              styles: [
                {
                  url: 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                      <circle cx="20" cy="20" r="18" fill="#3B82F6" stroke="white" stroke-width="2"/>
                      <text x="20" y="25" text-anchor="middle" fill="white" font-size="12" font-weight="bold">CLUSTER_COUNT</text>
                    </svg>
                  `),
                  size: new window.AMap.Size(40, 40),
                  offset: new window.AMap.Pixel(-20, -20)
                }
              ],
              renderClusterMarker: (context: any) => {
                const count = context.count
                const marker = context.marker
                
                const content = `
                  <div style="
                    width: 40px;
                    height: 40px;
                    background: #3B82F6;
                    border: 2px solid white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: bold;
                    font-size: 12px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    cursor: pointer;
                  ">
                    ${count}
                  </div>
                `
                
                marker.setContent(content)
              }
            })
            markerClusterRef.current = markerCluster
          } catch (error) {
            console.warn('MarkerCluster 初始化失败，将使用普通标记模式:', error)
            markerClusterRef.current = null
          }
        } else if (clustering) {
          console.warn('MarkerCluster 插件未加载，将使用普通标记模式')
          markerClusterRef.current = null
        }
        
        mapInstanceRef.current = map
        setInternalLoading(false)
      } catch (err) {
        console.error('地图加载失败:', err)
        setError('地图加载失败，请刷新页面重试')
        setInternalLoading(false)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy()
      }
    }
  }, [center, zoom, clustering, onMapBoundsChange])

  // 添加用户位置标记
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // 清除旧的用户位置标记
    if (userMarkerRef.current) {
      map.remove(userMarkerRef.current)
      userMarkerRef.current = null
    }

    // 添加新的用户位置标记
    if (userLocation) {
      const userMarkerContent = `
        <div style="
          width: 24px;
          height: 24px;
          background: #EF4444;
          border: 3px solid white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          position: relative;
        ">
          <div style="
            width: 8px;
            height: 8px;
            background: white;
            border-radius: 50%;
          "></div>
          <div style="
            position: absolute;
            top: -8px;
            left: 50%;
            transform: translateX(-50%);
            background: #EF4444;
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 10px;
            white-space: nowrap;
          ">
            我的位置
          </div>
        </div>
      `

      try {
        const userMarker = new window.AMap.Marker({
          position: [userLocation.longitude, userLocation.latitude],
          content: userMarkerContent,
          anchor: 'center',
          zIndex: 1000
        })

        if (map && typeof map.add === 'function') {
          map.add(userMarker)
          userMarkerRef.current = userMarker
        } else {
          console.warn('地图对象不可用，无法添加用户位置标记')
        }
      } catch (error) {
        console.error('添加用户位置标记失败:', error)
      }
    }
  }, [userLocation])

  // 添加或更新项目标记
  useEffect(() => {
    const map = mapInstanceRef.current
    const markerCluster = markerClusterRef.current
    if (!map || !projects) return

    // 清除旧标记
    if (clustering && markerCluster) {
      try {
        // 尝试不同的清除方法
        if (typeof markerCluster.clearMarkers === 'function') {
          markerCluster.clearMarkers()
        } else if (typeof markerCluster.clear === 'function') {
          markerCluster.clear()
        } else if (typeof markerCluster.setMarkers === 'function') {
          markerCluster.setMarkers([])
        }
      } catch (error) {
        console.warn('清除聚合标记失败:', error)
        map.remove(markers)
      }
    } else {
      map.remove(markers)
    }

    // 过滤有效的项目（有地理位置信息）
    const validProjects = projects.filter(project => 
      project.geolocation?.location?.latitude && 
      project.geolocation?.location?.longitude
    )

    const newMarkers = validProjects.map(project => {
      const location = project.geolocation!.location
      const position = [location.longitude, location.latitude]

      const marker = new window.AMap.Marker({
        position,
        content: createMarkerContent(project),
        anchor: 'center',
        extData: { project }
      })

      // 添加点击事件
      marker.on('click', () => {
        if (onMarkerClick) {
          onMarkerClick(project)
        }
      })

      // 添加悬停事件
      marker.on('mouseover', () => {
        // 可以在这里添加悬停效果
      })

      marker.on('mouseout', () => {
        // 可以在这里移除悬停效果
      })
      
      return marker
    })

    // 根据是否启用聚合来添加标记
    if (clustering && markerCluster) {
      try {
        // 尝试不同的添加方法
        if (typeof markerCluster.addMarkers === 'function') {
          markerCluster.addMarkers(newMarkers)
        } else if (typeof markerCluster.setMarkers === 'function') {
          markerCluster.setMarkers(newMarkers)
        } else if (typeof markerCluster.addMarker === 'function') {
          newMarkers.forEach(marker => markerCluster.addMarker(marker))
        } else {
          // 如果聚合器方法不可用，直接添加到地图
          map.add(newMarkers)
        }
      } catch (error) {
        console.warn('添加聚合标记失败:', error)
        map.add(newMarkers)
      }
    } else {
      map.add(newMarkers)
    }

    setMarkers(newMarkers)

    // 如果有项目且是首次加载，调整地图视野
    if (validProjects.length > 0 && !currentBounds) {
      const bounds = new window.AMap.Bounds()
      validProjects.forEach(project => {
        const location = project.geolocation!.location
        bounds.extend([location.longitude, location.latitude])
      })
      
      // 如果有用户位置，也包含在边界内
      if (userLocation) {
        bounds.extend([userLocation.longitude, userLocation.latitude])
      }
      
      map.setBounds(bounds, false, [20, 20, 20, 20])
    }

  }, [projects, hoveredProjectId, clustering, currentBounds, userLocation])

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

  // 创建项目信息弹窗内容
  const createInfoWindowContent = useCallback((project: ProjectWithLocation) => {
    const settings = project.geolocation?.locationSettings
    const collaboration = project.geolocation?.collaborationPreference
    
    return `
      <div style="padding: 12px; min-width: 200px; max-width: 300px;">
        <div style="font-weight: bold; font-size: 16px; margin-bottom: 8px; color: #1F2937;">
          ${project.title || '未命名项目'}
        </div>
        <div style="color: #6B7280; font-size: 14px; margin-bottom: 8px; line-height: 1.4;">
          ${project.description && project.description.length > 100 ? project.description.substring(0, 100) + '...' : (project.description || '暂无描述')}
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px;">
          <span style="background: #EBF8FF; color: #2563EB; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
            ${project.type || '未知类型'}
          </span>
          <span style="background: #F0FDF4; color: #16A34A; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
            ${project.stage || '未知阶段'}
          </span>
          ${settings?.type ? `
            <span style="background: #FEF3C7; color: #D97706; padding: 2px 6px; border-radius: 4px; font-size: 12px;">
              ${settings.type === 'physical' ? '实体办公' : settings.type === 'remote' ? '远程办公' : '混合模式'}
            </span>
          ` : ''}
        </div>
        ${collaboration?.mode ? `
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
            协作模式: ${collaboration.mode === 'local_only' ? '仅限本地' : collaboration.mode === 'remote_friendly' ? '远程友好' : '位置灵活'}
          </div>
        ` : ''}
        ${project.distance !== undefined ? `
          <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
            距离: ${project.distance.toFixed(1)} 公里
          </div>
        ` : ''}
        <div style="text-align: right; margin-top: 8px;">
          <button style="
            background: #3B82F6;
            color: white;
            border: none;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
          " onclick="window.location.href='/project/${project.id}'">
            查看详情
          </button>
        </div>
      </div>
    `
  }, [])

  // 处理标记点击，显示信息窗口
  const handleMarkerClick = useCallback((project: ProjectWithLocation) => {
    const map = mapInstanceRef.current
    if (!map) return

    const geoLocation = project.geolocation?.location
    if (!geoLocation) return

    const infoWindow = new window.AMap.InfoWindow({
      content: createInfoWindowContent(project),
      anchor: 'bottom-center',
      offset: new window.AMap.Pixel(0, -10)
    })

    infoWindow.open(map, [geoLocation.longitude, geoLocation.latitude])

    // 调用外部点击处理函数
    if (onMarkerClick) {
      onMarkerClick(project)
    }
  }, [createInfoWindowContent, onMarkerClick])

  // 更新标记点击处理函数
  useEffect(() => {
    markers.forEach(marker => {
      marker.off('click')
      marker.on('click', () => {
        const project = marker.getExtData().project
        handleMarkerClick(project)
      })
    })
  }, [markers, handleMarkerClick])

  return (
    <div className={`relative w-full h-full ${className}`} style={{ ...style, minHeight: '600px' }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <div className="text-primary-600 font-semibold">
              {externalLoading ? '加载项目数据中...' : '地图初始化中...'}
            </div>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
          <div className="text-center">
            <div className="text-red-600 font-semibold mb-2">{error}</div>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary-500 text-white rounded hover:bg-primary-600"
            >
              重新加载
            </button>
          </div>
        </div>
      )}
      
      {/* 地图控制面板 */}
      {!loading && !error && (
        <div className="absolute top-4 right-4 z-10 bg-white rounded-lg shadow-md p-2 space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Building className="w-4 h-4 text-blue-500" />
            <span>实体办公</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Wifi className="w-4 h-4 text-green-500" />
            <span>远程办公</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-purple-500" />
            <span>混合模式</span>
          </div>
          {userLocation && (
            <div className="flex items-center space-x-2 text-sm text-gray-600 pt-2 border-t">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>我的位置</span>
            </div>
          )}
        </div>
      )}

      {/* 项目统计信息 */}
      {!loading && !error && projects.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-md p-3">
          <div className="text-sm text-gray-600">
            <div className="font-medium">地图统计</div>
            <div className="mt-1 space-y-1">
              <div>总项目数: {projects.length}</div>
              <div>
                有位置信息: {projects.filter(p => p.geolocation?.location).length}
              </div>
              {currentBounds && (
                <div className="text-xs text-gray-500 mt-2">
                  当前视野范围内的项目
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  )
}

export default MapComponent;
