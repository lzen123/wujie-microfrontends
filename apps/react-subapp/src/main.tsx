import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

/**
 * 子应用入口同时支持两种模式：
 *   1) 独立运行：window.__POWERED_BY_WUJIE__ !== true，直接挂载到 #root；
 *   2) 在 Wujie 中运行：Wujie 会在沙箱里执行本脚本，并调用 window.__WUJIE_MOUNT 钩子。
 *      为了让保活（alive）生效，挂载/卸载必须挂到 __WUJIE_MOUNT / __WUJIE_UNMOUNT 上，
 *      而不是直接 mount 一次完事。
 */

let root: ReactDOM.Root | null = null

function mount() {
  const el = document.getElementById('root')
  if (!el) return
  root = ReactDOM.createRoot(el)
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
}

function unmount() {
  root?.unmount?.()
  root = null
}

// 独立运行
if (!(window as any).__POWERED_BY_WUJIE__) {
  mount()
} else {
  // wujie 生命周期
  ;(window as any).__WUJIE_MOUNT = mount
  ;(window as any).__WUJIE_UNMOUNT = unmount
  // 已在保活队列中但从未挂载过的场景，首次立即 mount
  ;(window as any).__WUJIE_MOUNT?.()
}
