/// <reference types="vite/client" />

// Wujie 无界会注入到子应用沙箱 window 上的全局对象与生命周期钩子。
// 这里集中声明，避免 strict 模式下出现 "Property does not exist on type Window"。

interface WujieBus {
  $on?: (event: string, callback: (...args: any[]) => void) => void
  $off?: (event: string, callback?: (...args: any[]) => void) => void
  $emit?: (event: string, ...args: any[]) => void
}

interface WujieInstance {
  /** 基座通过 props 下发的数据 */
  props?: Record<string, any>
  /** 事件总线：与基座、其它子应用通信 */
  bus?: WujieBus
  [key: string]: any
}

interface Window {
  /** 是否被 Wujie 加载（子应用据此判断独立运行 / 沙箱运行） */
  __POWERED_BY_WUJIE__?: boolean
  /** Wujie 调用的挂载钩子，子应用需在此实现 mount */
  __WUJIE_MOUNT?: () => void
  /** Wujie 调用的卸载钩子，子应用需在此实现 unmount */
  __WUJIE_UNMOUNT?: () => void
  /** Wujie 注入的运行时对象（含 props / bus / 沙箱信息） */
  $wujie?: WujieInstance
}
