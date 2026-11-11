import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { setupWujie } from './micro/register'
import './styles/global.css'

// 先初始化 Wujie（预加载、生命周期、插件等），再挂载基座
setupWujie()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
