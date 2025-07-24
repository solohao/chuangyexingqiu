// 高德地图配置
export const AMAP_CONFIG = {
  key: '06afa29e4221725ca2023e64fb991fd8', // 高德地图API密钥
  version: '2.0',
  plugins: [
    'AMap.ToolBar',
    'AMap.Scale',
    'AMap.HawkEye',
    'AMap.MapType',
    'AMap.Geolocation',
    'AMap.Marker',
    'AMap.InfoWindow',
    'AMap.AdvancedInfoWindow',
    'AMap.AutoComplete',
    'AMap.PlaceSearch',
  ],
  securityJsCode: '', // 如需要安全密钥，可在此处添加
  serviceHost: '', // 如需要自定义服务器地址，可在此处添加
}

// 地图默认配置
export const DEFAULT_MAP_OPTIONS = {
  zoom: 4, // 默认缩放级别-中国视图
  center: [104.0, 34.5], // 默认中心点（中国地理中心）
  viewMode: '3D', // 默认为3D视图
  pitch: 0, // 默认俯仰角度
  mapStyle: 'amap://styles/normal', // 默认样式
}

// 项目标记样式
export const PROJECT_MARKER_STYLE = {
  normal: {
    icon: '/markers/project-marker.svg', // 普通状态图标
    size: [32, 32],
    offset: [-16, -32],
  },
  hover: {
    icon: '/markers/project-marker-hover.svg', // 悬停状态图标
    size: [36, 36],
    offset: [-18, -36],
  },
  active: {
    icon: '/markers/project-marker-active.svg', // 选中状态图标
    size: [40, 40],
    offset: [-20, -40],
  },
}

// 项目类型对应的颜色
export const PROJECT_TYPE_COLORS = {
  tech: '#0EA5E9', // 科技项目
  social: '#8B5CF6', // 社会企业
  culture: '#F59E0B', // 文化创意
  finance: '#10B981', // 金融科技
  education: '#6366F1', // 教育科技
  health: '#EC4899', // 健康医疗
  environment: '#22C55E', // 环保项目
  other: '#6B7280', // 其他类型
}

// 加载高德地图脚本
export const loadAMapScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.AMap) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.async = true
    script.src = `https://webapi.amap.com/maps?v=${AMAP_CONFIG.version}&key=${AMAP_CONFIG.key}&plugin=${AMAP_CONFIG.plugins.join(',')}`
    script.onerror = reject
    script.onload = () => resolve()
    document.head.appendChild(script)
  })
}

// 高德地图类型声明（简化版）
declare global {
  interface Window {
    AMap: any
  }
}
