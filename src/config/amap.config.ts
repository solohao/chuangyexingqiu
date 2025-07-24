// 高德地图配置
export const AMAP_CONFIG = {
  key: import.meta.env.VITE_AMAP_KEY || '',
  version: '2.0',
  plugins: ['AMap.Scale', 'AMap.ToolBar', 'AMap.Geolocation'],
  // 默认地图配置
  mapOptions: {
    zoom: 10,
    center: [116.397428, 39.90923], // 北京天安门
    mapStyle: 'amap://styles/normal',
  }
};

export default AMAP_CONFIG;