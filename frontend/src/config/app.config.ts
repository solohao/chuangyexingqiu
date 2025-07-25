// 应用配置
export const APP_CONFIG = {
  // 根据环境获取基础URL
  getBaseUrl: () => {
    if (import.meta.env.PROD) {
      // 生产环境 - 自定义域名
      return 'https://chuangyexingqiu.guangliangzhisuan.com';
    } else {
      // 开发环境
      return window.location.origin;
    }
  },

  // 获取完整的回调URL
  getAuthCallbackUrl: () => {
    const baseUrl = APP_CONFIG.getBaseUrl();
    return `${baseUrl}/#/auth/callback`;
  },

  // 应用信息
  app: {
    name: '创业星球',
    description: '连接独立创业者的智能匹配平台',
    version: '0.1.0',
  },

  // 环境信息
  env: {
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    mode: import.meta.env.MODE,
  }
};

export default APP_CONFIG;