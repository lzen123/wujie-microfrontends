/// <reference types="vite/client" />

// 与 react-subapp 一致：声明 Wujie 注入的全局对象与生命周期钩子
interface WujieBus {
  $on?: (event: string, callback: (...args: any[]) => void) => void
  $off?: (event: string, callback?: (...args: any[]) => void) => void
  $emit?: (event: string, ...args: any[]) => void
}

interface WujieInstance {
  props?: Record<string, any>
  bus?: WujieBus
  [key: string]: any
}

interface Window {
  __POWERED_BY_WUJIE__?: boolean
  __WUJIE_MOUNT?: () => void
  __WUJIE_UNMOUNT?: () => void
  $wujie?: WujieInstance
}
