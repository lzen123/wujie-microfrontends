import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// 主应用（基座）配置
// 端口 8000；所有 /subapp-xxx 前缀代理到对应子应用开发端口，
// 生产环境由 nginx/网关做静态资源分发，子应用独立部署。
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 8000,
    host: '0.0.0.0',
    // 开发环境代理子应用资源，避免跨域
    proxy: {
      '/subapp-react': {
        target: 'http://localhost:8001',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/subapp-react/, '')
      },
      '/subapp-vue': {
        target: 'http://localhost:8002',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/subapp-vue/, '')
      }
    }
  },
  build: {
    target: 'es2020',
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'wujie': ['wujie', 'wujie-react']
        }
      }
    }
  }
})
