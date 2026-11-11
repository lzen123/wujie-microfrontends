export default function Home() {
  return (
    <div className="subapp-placeholder" style={{ flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontSize: 18, fontWeight: 600 }}>欢迎来到 AllData 数据中台</h2>
      <p style={{ color: '#6b7280' }}>
        这是基座首页；点击左侧「数据源平台」「数据汇聚平台」将由 Wujie 动态加载 React / Vue3 子应用。
      </p>
    </div>
  )
}
