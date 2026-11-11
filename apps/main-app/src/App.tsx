import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import Home from './pages/Home'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        {/* 首页是基座自带页面 */}
        <Route index element={<Home />} />
        {/* 微应用占位路由：实际渲染由 MainLayout 中 WujieReact 组件接管，
            这里仅用来让 URL 生效 + 触发页面切换逻辑 */}
        <Route path="subapp/*" element={null} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
