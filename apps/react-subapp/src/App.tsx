import React, { useEffect, useState } from 'react'
import './styles/app.css'

// wujie 会在沙箱 window 上注入 $wujie 对象，
// 独立运行时 window.$wujie 不存在，用 || {} 兜底
const wujie = (window as any).$wujie || {}
const props = wujie.props || {}

function App() {
  const [msgFromBase, setMsgFromBase] = useState<string>('（暂无消息）')

  useEffect(() => {
    // 1) 生命周期钩子：保活模式下 activated/deactivated 会反复触发
    wujie.bus?.$on?.('base:hello', (msg: string) => {
      setMsgFromBase(String(msg))
    })
    console.log('[react-subapp] mounted')
    return () => {
      wujie.bus?.$off?.('base:hello')
      console.log('[react-subapp] unmounted')
    }
  }, [])

  const sendToBase = () => {
    // 子 -> 主：通过 bus 广播事件
    wujie.bus?.$emit?.('subapp:msg', { from: 'react-subapp', time: Date.now() })
  }

  return (
    <div className="sub-root">
      <div className="sub-title">数据源平台 · React 子应用示例</div>
      <p className="sub-desc">
        本页面由 React 18 + Vite 构建，通过 Wujie 无界引擎加载；JS 运行在 iframe 沙箱中、
        样式在 WebComponent 内天然隔离。
      </p>

      <div className="sub-card">
        <h3>基座下发的 props</h3>
        <pre>{JSON.stringify({ platform: props.platform, basename: props.basename }, null, 2)}</pre>
      </div>

      <div className="sub-card">
        <h3>与基座通信</h3>
        <p style={{ fontSize: 13, marginBottom: 8 }}>基座消息：{msgFromBase}</p>
        <button className="sub-btn" onClick={sendToBase}>向基座发送消息</button>
        <button className="sub-btn" onClick={() => props.navigate?.('/')}>调用基座跳转回首页</button>
      </div>

      <div className="sub-card">
        <h3>说明</h3>
        <ul style={{ paddingLeft: 18, fontSize: 13, lineHeight: 1.8, color: '#374151' }}>
          <li>独立访问端口：8001，开发期由基座 8000 代理 /subapp-react → 8001</li>
          <li>支持独立运行（http://localhost:8001）也支持被基座加载</li>
          <li>alive=true 切走时不销毁，状态保留（可在下方放个输入框试验）</li>
        </ul>
        <input
          placeholder="输入任意文字，切走再回来验证保活"
          style={{ marginTop: 8, padding: '6px 8px', width: 320, border: '1px solid #d1d5db', borderRadius: 4 }}
        />
      </div>
    </div>
  )
}

export default App
