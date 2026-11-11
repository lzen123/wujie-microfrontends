import { useMemo } from 'react'
import WujieReact from 'wujie-react'
import { getSubAppByName } from '../config/subapps'

interface MicroViewProps {
  subappName: string
  onNavChange?: (path: string) => void
}

/**
 * 子应用渲染容器：
 * - wujie-react 会把 <WujieReact /> 渲染成一个同名 webcomponent，
 *   内部用 iframe + WebComponent 做 JS/CSS 沙箱隔离；
 * - alive=true 的子应用切换时只是被 deactivate，DOM 保留；
 * - 通过 props 下发基座方法，子应用用 window.$wujie.props 接收。
 */
export default function MicroView({ subappName, onNavChange }: MicroViewProps) {
  const cfg = useMemo(() => getSubAppByName(subappName), [subappName])
  if (!cfg) {
    return <div className="subapp-placeholder">未注册的子应用：{subappName}</div>
  }
  return (
    <div className="subapp-container">
      <WujieReact
        width="100%"
        height="100%"
        name={cfg.name}
        url={cfg.entry}
        alive={cfg.alive}
        props={{
          basename: cfg.activeWhen,
          platform: 'AllData-数据中台',
          // 子应用可以调用此方法反向通知基座跳转
          navigate: (to: string) => onNavChange?.(to)
        }}
      />
    </div>
  )
}
