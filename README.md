# AllData 数据中台 · Wujie 微前端示例工程

一个基于 **Vite + React 18 基座 + Wujie 无界引擎** 的微前端骨架，演示如何把图片中这种「顶部状态条 + 左侧菜单 + 顶部 Tab 页签 + 内容区二级导航」的后台布局落地为多技术栈子应用架构，并配套一个 React 18 子应用、一个 Vue 3 子应用作为示例。

---

## 一、目录结构

```
wujie-microfrontends/
├── package.json                # 根包：公共 devDependencies + 聚合脚本
├── pnpm-workspace.yaml         # pnpm monorepo 工作区声明
├── tsconfig.base.json          # TS 基础配置（被各 app 继承）
└── apps/
    ├── main-app/               # 基座：React 18 + Vite + TS，端口 8000
    │   ├── vite.config.ts
    │   └── src/
    │       ├── main.tsx        # 入口：先 setupWujie() 再挂 React
    │       ├── App.tsx         # 路由
    │       ├── config/subapps.ts   # 子应用注册表 & 菜单配置
    │       ├── micro/register.ts   # Wujie 预加载/生命周期/插件
    │       ├── layouts/MainLayout.tsx
    │       └── components/
    │           ├── Header.tsx  # 顶部状态条
    │           ├── Sider.tsx   # 左侧菜单（仅前三项）
    │           ├── TabsBar.tsx # 顶部 Tab 页签
    │           ├── SubNav.tsx  # 内容区二级导航
    │           └── MicroView.tsx   # WujieReact 容器
    ├── react-subapp/           # React 18 子应用，端口 8001
    │   └── src/
    │       ├── main.tsx        # 同时兼容「独立运行」与「Wujie 运行」两种入口
    │       └── App.tsx
    └── vue-subapp/             # Vue 3 子应用，端口 8002
        └── src/
            ├── main.ts
            └── App.vue
```

---

## 二、快速启动

前置条件：`node >= 18`、`pnpm >= 8`。

```bash
# 1. 安装依赖（monorepo 根目录执行一次即可）
pnpm install

# 2. 同时启动基座 + 两个子应用
pnpm dev
# 或者分别启动
pnpm dev:main     # http://localhost:8000
pnpm dev:react    # http://localhost:8001
pnpm dev:vue      # http://localhost:8002

# 3. 构建
pnpm build
```

访问 `http://localhost:8000` 即可看到和截图一致的后台布局：
- 点击左侧「首页」：基座原生页面；
- 点击「数据源平台」：通过 Wujie 动态加载 React 子应用；
- 点击「数据汇聚平台」：通过 Wujie 动态加载 Vue3 子应用；
- 打开的菜单会出现在顶部 Tab 栏，Tab 可关闭；
- Tab 下方是二级导航条（静态示例，可按需替换为子应用自报）。

---

## 三、Wujie 无界引擎是如何接入的？

### 1. 基座侧

`apps/main-app/src/micro/register.ts` 中对每个子应用调用 `setupApp({ name, url, alive, preload, plugins, props, lifecycle })`：

| 配置项 | 作用 |
| --- | --- |
| `name` | 子应用唯一 key，决定 WebComponent 标签名 & 沙箱 key |
| `url`  | 子应用入口地址（开发期是 dev server，生产期是静态资源 URL） |
| `exec` | 是否在沙箱中执行 JS（必须 true） |
| `alive` | 是否保活——切走不销毁实例，保留 store / 表单状态 |
| `degrade` | 浏览器不支持 Proxy 时降级到快照沙箱 |
| `plugins.jsBeforeLoaders` | 在子应用 HTML 执行前注入代码（用于打标、polyfill） |
| `props` | 下发给子应用的公共数据（路由前缀、平台信息、公共方法） |
| `beforeLoad/afterMount/...` | 生命周期钩子，用于 loading、埋点 |
| `preloadApp` | 浏览器空闲时预加载子应用资源，首次打开无白屏 |

布局组件 `MicroView.tsx` 使用 `wujie-react` 提供的 `<WujieReact />` 组件挂载子应用——它会被渲染成 `<wujie-xxx />` 这样一个 WebComponent，内部自动完成 iframe 沙箱创建、HTML 抓取、JS 执行、样式隔离。

### 2. 子应用侧

React 子应用 `react-subapp/src/main.tsx`、Vue 子应用 `vue-subapp/src/main.ts` 都按同一模式写入口：

```ts
if (!(window as any).__POWERED_BY_WUJIE__) {
  mount()                    // 独立运行（本地调试、单独部署也行）
} else {
  window.__WUJIE_MOUNT = mount
  window.__WUJIE_UNMOUNT = unmount
  window.__WUJIE_MOUNT?.()  // wujie 触发保活激活
}
```

- 这样同一个子应用既可以独立访问（8001/8002），也可以被基座加载；
- 子应用内部通过 `window.$wujie.props` 拿到基座下发的数据，通过 `window.$wujie.bus.$emit / $on` 和基座、其他子应用通信用事件总线解耦。

### 3. 开发期 vs 生产期路径

| 环境 | 子应用入口 | 基座怎么拿到资源 |
| --- | --- | --- |
| 开发 | `http://localhost:8001/`、`http://localhost:8002/` | 子应用 dev server 开启 CORS，基座以**绝对地址直连**加载；主应用 `vite.config.ts` 里 `/subapp-react`、`/subapp-vue` 的 proxy 保留作备用 |
| 生产 | `/micro/react-subapp/`、`/micro/vue-subapp/` | Nginx/CDN 把 `/micro/*` 指向各子应用构建产物目录，入口 HTML 开启 CORS |

子应用构建时 `vite.config.ts` 的 `base` 会根据 `mode` 自动切换，部署时无需改代码。

---

## 四、通信与状态共享

本示例演示了最常用的三种通信方式：

1. **props 下发（主 → 子，初始化一次）**：如 `platform`、`basename`、`navigate` 方法。适合下发登录态、主题、工具方法。
2. **事件总线 `bus.$emit / $on`（任意方向）**：基座 broadcast 全局事件（如退出登录、主题切换），子应用也能反向 notify 基座（如打开 tab、跳转路由）。这是推荐方式，完全解耦。
3. **路由跳转回调**：子应用调用 `props.navigate('/xxx')`，基座监听后执行 react-router 的 `navigate`，让 URL 始终由基座管理，子应用不感知基座路由库。

> ❌ 不推荐通过 `window.parent.xxx` 或 redux/vuex 共享 store 来通信——会破坏技术栈无关性，升级困难。

---

## 五、架构层面的性能考量

下面这些点在示例工程里都已经落地或给出注释，可以直接照搬到生产：

### 1. 首屏：按需加载 + 空闲预加载
- Wujie 的子应用是「真正访问到菜单时才去 fetch HTML/JS」，首屏只加载基座；
- 配置 `preload: true` 的子应用在主应用 `requestIdleCallback` 中调用 `preloadApp`，用户还没点菜单，资源已经在后台拉完，点击几乎无感；
- 对比 qiankun 的「启动即注册、需手动 prefetch」，Wujie 因为使用 WebComponent + iframe，预加载后实例可直接挂，切换更快。

### 2. 切换：保活（alive）避免重复 mount
- 中后台常见场景：列表页 → 详情页 → 返回列表，希望保留查询条件、滚动位置、分页状态。
- `alive: true` 时子应用实例不会被销毁，只是 `deactivated`，切回直接触发 `activated`，DOM、内存状态都保留，体验接近 SPA 内部 keep-alive。
- 代价是内存中会常驻已打开子应用的实例；Tab 关太多时要调 `WujieReact` 的 `destroy` 彻底销毁。

### 3. JS / 样式隔离：不踩坑即性能
- Wujie 采用 **iframe 做 JS 沙箱 + WebComponent 做样式隔离**：
  - JS：子应用运行在独立 iframe 的 window 上下文里，`window/document/location` 全是代理对象，不会污染主应用，也不用像快照沙箱那样反复拷贝对象，性能接近原生；
  - CSS：WebComponent 的 ShadowRoot 天然隔离样式，子应用写全局样式也不会泄漏到基座，无需加 prefix、无需 CSS Module 兜底。
- 这意味着子应用可以用 antd / element-plus / tailwind 等任意 UI 库，不用协商命名空间，也不用手动改造。

### 4. 构建拆包
- 基座 `vite.config.ts` 里通过 `rollupOptions.output.manualChunks` 把 `react/react-dom/react-router-dom` 和 `wujie/wujie-react` 拆成独立 chunk，配合长期缓存；
- 子应用构建时如果与基座使用了相同版本的库，可以考虑通过 **externals/模块联邦** 进一步共享（见下节「进阶」），本示例为了演示「技术栈独立、互不依赖」没有启用，生产环境可以按需加。

### 5. 公共依赖共享（可选进阶）
- Wujie 本身 **不要求** 主应用和子应用共享依赖——这是它比 Module Federation 轻量的地方。
- 如果真有体积诉求（比如多个子应用都用 antd），两种做法：
  1. **external + CDN**：把 react/react-dom/antd 挂到 window，子应用通过 externals 不打包；
  2. **Vite 插件联邦**（`@originjs/vite-plugin-federation`）：做运行时模块共享。
- 推荐先走「保活 + 预加载」，实测首屏和切换体验已经接近 SPA，再考虑联邦。

### 6. 错误隔离
- 子应用运行在 iframe 沙箱中，子应用 JS 报错不会阻断基座渲染；
- Wujie 提供 `setupApp` 的 `error` 钩子，统一上报和降级（比如渲染一个「子应用加载失败」占位）。

### 7. 生产部署
- 子应用是 **纯静态资源**，各自独立构建、独立部署（可以发版互不影响）；
- 建议开启 CDN + gzip/brotli + 强缓存（文件名带 hash），HTML 用协商缓存；
- 入口 HTML 必须允许跨域（`Access-Control-Allow-Origin: *` 或指定基座域名），否则 Wujie 无法在沙箱内解析 HTML。

---

## 六、「做微前端还要不要用 monorepo？」

同一产品体系下的多个业务域

1. **基座统一**：所有子应用共享同一套头部、菜单、登录、权限、主题，如果拆成多仓，公共组件/TS 类型/请求库同步成本极高；
2. **联调频繁**：经常要「一次跑起所有子应用」联调菜单/权限/通信，monorepo 下 `pnpm dev` 一条命令起全部，polyrepo 要挨个 clone、挨个 npm i、挨个记端口；
3. **规范一致**：ESLint/Prettier/tsconfig/CI 配置能在根目录统一继承，避免 8 个子应用 8 套 lint 规则；
4. **原子提交**：改基座 API 的同时改子应用调用，能在一个 PR 里原子提交，不会出现「基座先发版、子应用全挂」的窗口；
5. **依赖去重**：pnpm workspace 会把相同版本依赖 hoist 到根目录，节省磁盘、装包更快；
6. **重构友好**：后面想把一个巨无霸子应用拆成两个、或把通用能力抽到 `packages/shared`，monorepo 下就是挪目录的事。

### 3. 这套示例采用的折中方案
- 使用 **pnpm workspaces** 做 monorepo，结构是 `apps/*`（各应用）+ 预留 `packages/*`（未来放公共组件/utils/api/类型）；
- 子应用 **保留独立运行能力**（每个 app 都能 `pnpm dev:xxx` 单独起，单独 build 独立部署）——这意味着将来某个子应用真要拆仓，直接把 `apps/react-subapp` 挪出去单独建仓即可，主应用只需要改子应用注册表里的 `entry` URL，代码零改动；
- 所以本质是 **「开发期 monorepo，运行时微前端」**：
  - 开发期：享受 monorepo 的联调/规范/类型共享红利；
  - 运行时：享受 Wujie 微前端的技术栈无关 + 独立部署 + 故障隔离红利。
- 这两者不仅不冲突，反而是企业中后台最务实的组合。

### 一句话决策表
| 场景 | 推荐 |
| --- | --- |
| 第三方/外部团队接入 | 多仓 + Wujie 接入 URL |
| 公司内部统一中后台、子应用同技术栈或类似 | **monorepo + Wujie**（本示例方案） |
| 公司内部、子应用技术栈差异极大且各成体系 | monorepo 也可以，但建议把共享依赖收敛到 `packages/shared`，不强求 UI 层统一 |
| 想做「组件级」共享而不是「应用级」组合 | 考虑 Module Federation，Wujie 也可以与之共存 |

---

## 七、后续可扩展方向

- **动态菜单 & 权限**：把 `config/subapps.ts` 的静态注册改成从后端拉取菜单 + 子应用配置，配合 RBAC 做权限渲染；
- **公共包 `packages/shared`**：放请求库、类型定义、权限指令、统一错误上报，子应用直接 `import @alldata/shared`；
- **主题/暗色模式**：通过 Wujie 的 `props` 下发主题变量 + `bus` 广播主题切换，子应用监听后切 CSS 变量；
- **子应用路由同步**：基座用 react-router 监听 URL 变化，通过 bus 通知子应用内部 vue-router / react-router 跳转，实现浏览器后退前进可用；
- **埋点 & 监控**：在基座 `afterMount`/`activated` 钩子统一上报 PV，子应用不再重复实现。
