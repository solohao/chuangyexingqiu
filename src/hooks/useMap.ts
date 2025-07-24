import { useState, useEffect, useCallback } from 'react'
import { PROJECT_MARKER_STYLE } from '../config/amap.config'

interface UseMapOptions {
  map: any | null
}

interface Marker {
  id: string
  position: [number, number]
  title: string
  type: string
  icon?: string
  extData?: any
}

export function useMap({ map }: UseMapOptions) {
  const [markers, setMarkers] = useState<any[]>([])
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null)
  const [infoWindow, setInfoWindow] = useState<any | null>(null)

  // 初始化信息窗口
  useEffect(() => {
    if (map && !infoWindow && window.AMap) {
      const infoWindowInstance = new window.AMap.InfoWindow({
        offset: new window.AMap.Pixel(0, -30),
        closeWhenClickMap: true,
      })
      setInfoWindow(infoWindowInstance)
    }
  }, [map, infoWindow])

  // 清除所有标记
  const clearMarkers = useCallback(() => {
    if (map) {
      markers.forEach(marker => {
        map.remove(marker)
      })
      setMarkers([])
      setSelectedMarkerId(null)
    }
  }, [map, markers])

  // 添加标记
  const addMarkers = useCallback((markerData: Marker[]) => {
    if (!map || !window.AMap) return

    const newMarkers = markerData.map(data => {
      const { id, position, title, type, icon, extData } = data
      
      // 使用自定义图标或默认图标
      const markerIcon = icon 
        ? new window.AMap.Icon({
            size: new window.AMap.Size(32, 32),
            image: icon,
            imageSize: new window.AMap.Size(32, 32)
          })
        : new window.AMap.Icon({
            size: new window.AMap.Size(32, 32),
            image: PROJECT_MARKER_STYLE.normal.icon,
            imageSize: new window.AMap.Size(32, 32)
          })

      // 创建标记
      const marker = new window.AMap.Marker({
        position,
        title,
        icon: markerIcon,
        offset: new window.AMap.Pixel(-16, -32),
        extData: { id, type, ...extData },
        cursor: 'pointer',
        animation: 'AMAP_ANIMATION_DROP',
      })

      // 添加点击事件
      marker.on('click', () => {
        setSelectedMarkerId(id)
        
        if (infoWindow) {
          infoWindow.setContent(`
            <div class="p-2">
              <h3 class="font-bold">${title}</h3>
              <p class="text-sm">${type}</p>
            </div>
          `)
          infoWindow.open(map, position)
        }
      })

      // 添加到地图
      map.add(marker)
      return marker
    })

    setMarkers(prev => [...prev, ...newMarkers])
    return newMarkers
  }, [map, infoWindow])

  // 定位到标记
  const locateMarker = useCallback((markerId: string) => {
    const marker = markers.find(m => m.getExtData().id === markerId)
    if (marker && map) {
      map.setCenter(marker.getPosition())
      map.setZoom(15)
      setSelectedMarkerId(markerId)
      
      if (infoWindow) {
        const { title, type } = marker.getExtData()
        infoWindow.setContent(`
          <div class="p-2">
            <h3 class="font-bold">${title}</h3>
            <p class="text-sm">${type}</p>
          </div>
        `)
        infoWindow.open(map, marker.getPosition())
      }
    }
  }, [map, markers, infoWindow])

  // 设置地图中心点
  const setMapCenter = useCallback((position: [number, number], zoom?: number) => {
    if (map) {
      map.setCenter(position)
      if (zoom) {
        map.setZoom(zoom)
      }
    }
  }, [map])

  return {
    markers,
    selectedMarkerId,
    addMarkers,
    clearMarkers,
    locateMarker,
    setMapCenter,
  }
}

export default useMap
