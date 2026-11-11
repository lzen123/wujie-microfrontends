import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'node:path'

// Vue3 子应用配置，与 react-subapp 类似：
// - 开发端口 8002，开启 CORS；
// - 生产部署到 /micro/vue-subapp/；
// - modulePreloadPolyfill 关闭以简化体积。
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  return {
    plugins: [vue()],
    base: isProd ? '/micro/vue-subapp/' : '/',
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') }
    },
    server: {
      port: 8002,
      strictPort: true,
      host: '0.0.0.0',
      cors: true,
      origin: 'http://localhost:8002',
      headers: { 'Access-Control-Allow-Origin': '*' }
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: false
    }
  }
})
