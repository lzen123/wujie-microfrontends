import { setupApp, preloadApp, bus } from 'wujie'
import { subAppConfigs } from '../config/subapps'

/**
 * 初始化 Wujie：为每个子应用注册默认配置 + 生命周期钩子
 * 这里我们只配置通用项（沙箱、保活、插件、通信总线），
 * 具体渲染由 react 侧的 <WujieReact /> 组件负责。
 */
export function setupWujie() {
  // 全局事件总线：基座 -> 子应用；子应用也能 window.$wujie.bus.$emit 回传
  bus.$on('base:user-info', (user: unknown) => {
    // eslint-disable-next-line no-console
    console.log('[基座] 收到用户信息更新广播：', user)
  })

  subAppConfigs.forEach((cfg) => {
    setupApp({
      name: cfg.name,
      url: cfg.entry,
      // 开启 wujie 无界方案：WebComponent + iframe 沙箱，样式天然隔离
      exec: true,
      alive: cfg.alive,
      // 降级模式：iframe 失败时用 proxy 快照
      degrade: window.Proxy === undefined,
      // 插件：可以给子应用注入全局脚本/样式
      plugins: [
        {
          // 子应用运行前注入公共上下文
          jsBeforeLoaders: [
            {
              content: `window.__POWERED_BY_WUJIE__ = true;`
            }
          ]
        }
      ],
      props: {
        // 下发给子应用的公共数据：基座路由跳转、事件总线等
        platform: 'AllData-数据中台',
        basename: cfg.activeWhen
      },
      // 生命周期：做埋点、加载态控制
      beforeLoad: () => console.log(`[wujie] 准备加载 ${cfg.name}`),
      beforeMount: () => console.log(`[wujie] 即将挂载 ${cfg.name}`),
      afterMount: () => console.log(`[wujie] 挂载完成 ${cfg.name}`),
      activated: () => console.log(`[wujie] 激活（保活） ${cfg.name}`),
      deactivated: () => console.log(`[wujie] 失活（保活） ${cfg.name}`)
    })

    // 预加载：配置了 preload 的子应用在主应用 idle 时提前拉取 HTML/JS
    // 浏览器空闲时预加载，首屏只加载当前要用的，切换几乎无感
    if (cfg.preload) {
      requestIdleCallback(
        () => {
          preloadApp({ name: cfg.name })
        },
        { timeout: 1500 }
      )
    }
  })
}
