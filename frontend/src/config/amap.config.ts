// 高德地图配置
export const AMAP_CONFIG = {
  key: import.meta.env.VITE_AMAP_KEY || '',
  version: '2.0',
  plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Geolocation', 'AMap.MarkerCluster'],
  // 默认地图配置
  mapOptions: {
    zoom: 10,
    center: [116.397428, 39.90923], // 北京天安门
    mapStyle: 'amap://styles/normal',
  }
};

// 项目类型颜色配置
export const PROJECT_TYPE_COLORS = {
  startup: '#FF6B6B',
  tech: '#3B82F6',
  environment: '#10B981',
  education: '#F59E0B',
  health: '#EF4444',
  finance: '#8B5CF6',
  social: '#EC4899',
  culture: '#F97316',
  other: '#6B7280',
  default: '#6B7280'
};

// 项目标记样式
export const PROJECT_MARKER_STYLE = {
  normal: {
    icon: '/markers/project-marker.svg',
    size: { width: 32, height: 32 }
  },
  hover: {
    icon: '/markers/project-marker-hover.svg',
    size: { width: 36, height: 36 }
  },
  active: {
    icon: '/markers/project-marker-active.svg',
    size: { width: 40, height: 40 }
  },
  compatible: {
    icon: '/markers/project-marker-compatible.svg',
    size: { width: 34, height: 34 }
  }
};

// 默认地图选项
export const DEFAULT_MAP_OPTIONS = {
  zoom: 10,
  center: [116.397428, 39.90923],
  mapStyle: 'amap://styles/normal',
  resizeEnable: true,
  rotateEnable: true,
  pitchEnable: true,
  zoomEnable: true,
  dragEnable: true
};

// 加载高德地图脚本
export const loadAMapScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.AMap) {
      // 检查必要的插件是否已加载
      if (window.AMap.MarkerCluster) {
        resolve();
        return;
      }
    }

    const script = document.createElement('script');
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${AMAP_CONFIG.key}&plugin=${AMAP_CONFIG.plugins.join(',')}`;
    script.async = true;
    script.onload = () => {
      // 等待插件完全加载
      const checkPlugins = () => {
        if (window.AMap && window.AMap.Map) {
          console.log('高德地图加载成功');
          if (window.AMap.MarkerCluster) {
            console.log('MarkerCluster 插件加载成功');
          } else {
            console.warn('MarkerCluster 插件未加载，聚合功能将不可用');
          }
          resolve();
        } else {
          setTimeout(checkPlugins, 50);
        }
      };
      checkPlugins();
    };
    script.onerror = () => reject(new Error('Failed to load AMap script'));
    document.head.appendChild(script);
  });
};

// 声明全局 AMap 类型
declare global {
  interface Window {
    AMap: any;
  }
}

export default AMAP_CONFIG;