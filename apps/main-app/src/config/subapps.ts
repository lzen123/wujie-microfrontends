// 子应用注册表：集中维护所有微应用元信息
// 字段含义：
//   name: 子应用唯一名称（wujie 以此作为 webcomponent 标签名 & 沙箱 key）
//   activeWhen: 命中该路径前缀时激活（与 react-router path 对齐）
//   entry:    开发环境 / 生产环境入口；生产替换为 CDN/独立部署地址
//   alive:    是否保活（切走不销毁，保留状态，体验更像 SPA）
//   preload:  是否主应用空闲时预加载子应用资源
//   props:    下发给子应用的全局数据（如登录态、主题、公共方法）
export interface SubAppConfig {
  name: string
  title: string
  activeWhen: string
  entry: string
  alive: boolean
  preload: boolean
  props?: Record<string, unknown>
}

const isDev = import.meta.env.DEV

// 左侧菜单前三项对应配置：首页是基座页面，其余挂载到对应子应用
export const menuConfig = [
  { key: 'home',     title: '首页',         icon: '🏠', micro: null },
  { key: 'datasource', title: '数据源平台', icon: '🗄️', micro: 'react-subapp' as const },
  { key: 'agg',      title: '数据汇聚平台', icon: '🔗', micro: 'vue-subapp'  as const }
]

// 每个子应用自身的二级导航示例（可由子应用自己上报，这里先静态定义用于骨架展示）
export const subNavMap: Record<string, { key: string; label: string; icon: string }[]> = {
  'react-subapp': [
    { key: 'asset',   label: '数据资产', icon: '🗂' },
    { key: 'warehouse', label: '数据仓库', icon: '📊' },
    { key: 'scheduler', label: '任务调度', icon: '⚙️' },
    { key: 'model',   label: '数据建模', icon: '🗓' }
  ],
  'vue-subapp': [
    { key: 'blood',   label: '数据血缘', icon: '🔗' },
    { key: 'integrate', label: '数据集成', icon: '🔁' },
    { key: 'config',  label: '配置中心', icon: '⚙' }
  ]
}

export const subAppConfigs: SubAppConfig[] = [
  {
    name: 'react-subapp',
    title: '高质量数据集平台',
    activeWhen: '/subapp/react',
    // 开发期直连子应用 dev server（子应用已开启 CORS），
    // 避免 Wujie 解析 HTML 内以 "/" 开头的资源时丢失路径前缀；
    // 生产期走网关/nginx 的 /micro/<name>/ 静态分发。
    entry: isDev ? 'http://localhost:8001/' : '/micro/react-subapp/',
    alive: true,
    preload: true
  },
  {
    name: 'vue-subapp',
    title: '数据源管理',
    activeWhen: '/subapp/vue',
    entry: isDev ? '/subapp-vue/' : '/micro/vue-subapp/',
    alive: true,
    preload: true
  }
]

export const getSubAppByName = (name: string) =>
  subAppConfigs.find((c) => c.name === name)
