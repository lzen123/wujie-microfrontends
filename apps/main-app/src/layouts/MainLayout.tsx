import { useCallback, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import Sider from '../components/Sider'
import TabsBar, { TabItem } from '../components/TabsBar'
import SubNav from '../components/SubNav'
import MicroView from '../components/MicroView'
import Home from '../pages/Home'
import { menuConfig, subAppConfigs, subNavMap } from '../config/subapps'

// key 约定：
//   home            -> 基座首页
//   micro:<name>    -> 某个子应用页签
export default function MainLayout() {
  const navigate = useNavigate()
  const location = useLocation()

  // 初始只打开首页 tab
  const [tabs, setTabs] = useState<TabItem[]>([
    { key: 'home', label: '首页', closable: false }
  ])
  const [activeTab, setActiveTab] = useState<string>('home')
  // 当前子应用内部的二级导航选中
  const [activeSubNav, setActiveSubNav] = useState<string>('')

  const openTab = useCallback((tab: TabItem, path: string) => {
    setTabs((prev) => (prev.find((t) => t.key === tab.key) ? prev : [...prev, tab]))
    setActiveTab(tab.key)
    navigate(path)
  }, [navigate])

  const closeTab = useCallback((key: string) => {
    setTabs((prev) => {
      const next = prev.filter((t) => t.key !== key)
      if (activeTab === key) {
        const target = next[next.length - 1]
        setActiveTab(target.key)
        navigate(target.key === 'home' ? '/' : `/subapp/${target.subapp}`)
      }
      return next
    })
  }, [activeTab, navigate])

  const handleMenuChange = useCallback((key: string) => {
    const menu = menuConfig.find((m) => m.key === key)
    if (!menu) return
    if (!menu.micro) {
      openTab({ key: 'home', label: '首页', closable: false }, '/')
      setActiveSubNav('')
      return
    }
    const cfg = subAppConfigs.find((c) => c.name === menu.micro)
    if (!cfg) return
    const navItems = subNavMap[cfg.name] || []
    setActiveSubNav(navItems[0]?.key || '')
    openTab(
      { key: `micro:${cfg.name}`, label: cfg.title, closable: true, subapp: cfg.name },
      cfg.activeWhen
    )
  }, [openTab])

  const activeMenuKey = useMemo(() => {
    if (activeTab === 'home') return 'home'
    const cur = tabs.find((t) => t.key === activeTab)
    if (cur?.subapp) {
      const m = menuConfig.find((m) => m.micro === cur.subapp)
      return m?.key || 'home'
    }
    return 'home'
  }, [activeTab, tabs])

  const currentSubapp = useMemo(() => {
    const cur = tabs.find((t) => t.key === activeTab)
    return cur?.subapp || ''
  }, [activeTab, tabs])

  const subNavItems = currentSubapp ? subNavMap[currentSubapp] || [] : []

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Sider activeKey={activeMenuKey} onChange={handleMenuChange} />
        <div className="app-content">
          <TabsBar
            tabs={tabs}
            activeKey={activeTab}
            onSelect={(k) => {
              const t = tabs.find((x) => x.key === k)
              if (!t) return
              setActiveTab(k)
              if (k === 'home') navigate('/')
              else if (t.subapp) {
                const cfg = subAppConfigs.find((c) => c.name === t.subapp)
                if (cfg) navigate(cfg.activeWhen)
              }
            }}
            onClose={closeTab}
          />
          {subNavItems.length > 0 && (
            <SubNav
              items={subNavItems}
              activeKey={activeSubNav}
              onChange={(k) => {
                setActiveSubNav(k)
                // 这里可以通知子应用切换路由：bus.$emit('subapp:navigate', k)
              }}
            />
          )}
          <div className="app-content-main">
            {activeTab === 'home' ? <Home /> : null}
            {currentSubapp ? <MicroView subappName={currentSubapp} /> : null}
          </div>
        </div>
      </div>
    </div>
  )
}

// 避免 TS 报 location 未使用的告警
void location
