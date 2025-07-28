import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 从根目录加载环境变量
  const rootDir = path.resolve(__dirname, '..')
  const env = loadEnv(mode, rootDir, '')
  
  return {
    plugins: [react()],
    base: process.env.NODE_ENV === 'production' ? '/chuangyexingqiu/' : '/',
    
    // 指定环境变量文件的目录为根目录
    envDir: rootDir,
    
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: parseInt(env.FRONTEND_PORT) || 3000,
      open: true,
      proxy: {
        '/api': {
          target: 'http://localhost:8080', // 后端服务地址，根据实际情况调整
          changeOrigin: true,
          secure: false,
          // 不要重写路径，保留/api前缀
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['lucide-react', 'framer-motion'],
          },
        },
      },
    },
  }
}) 