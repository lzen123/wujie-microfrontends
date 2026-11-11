import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

// React 子应用配置
// - 独立访问基路径是 /，由基座代理 /subapp-react 到 8001；
// - 生产构建后静态资源部署到 /micro/react-subapp/ 下，因此 base 在生产环境改为子路径；
// - 必须设置 output.modulePreload 路径正确，并开启 cors 供基座 fetch HTML；
// - Wujie 要求子应用资源支持跨域，server.cors = true。
export default defineConfig(({ mode }) => {
  const isProd = mode === 'production'
  return {
    plugins: [react()],
    base: isProd ? '/micro/react-subapp/' : '/',
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') }
    },
    server: {
      port: 8001,
      strictPort: true,
      host: '0.0.0.0',
      cors: true,
      origin: 'http://localhost:8001',
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      sourcemap: false,
      // 让资源以相对路径引用，避免部署到不同基路径出错
      assetsDir: 'assets'
    }
  }
})
