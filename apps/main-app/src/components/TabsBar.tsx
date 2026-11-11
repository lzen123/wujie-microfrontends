export interface TabItem {
  key: string
  label: string
  closable: boolean
  subapp?: string
}

interface TabsBarProps {
  tabs: TabItem[]
  activeKey: string
  onSelect: (key: string) => void
  onClose: (key: string) => void
}

export default function TabsBar({ tabs, activeKey, onSelect, onClose }: TabsBarProps) {
  return (
    <div className="tabs-bar">
      {tabs.map((t) => (
        <span
          key={t.key}
          className={`tab-item ${activeKey === t.key ? 'active' : ''}`}
          onClick={() => onSelect(t.key)}
        >
          {t.label}
          {t.closable && (
            <span
              className="tab-close"
              onClick={(e) => {
                e.stopPropagation()
                onClose(t.key)
              }}
            >
              ✕
            </span>
          )}
        </span>
      ))}
    </div>
  )
}
