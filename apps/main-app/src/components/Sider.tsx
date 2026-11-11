import { menuConfig } from '../config/subapps'

interface SiderProps {
  activeKey: string
  onChange: (key: string) => void
}

export default function Sider({ activeKey, onChange }: SiderProps) {
  return (
    <aside className="app-sider">
      {menuConfig.map((item) => (
        <div
          key={item.key}
          className={`menu-item ${activeKey === item.key ? 'active' : ''}`}
          onClick={() => onChange(item.key)}
        >
          <span className="icon">{item.icon}</span>
          <span>{item.title}</span>
          {item.micro && <span className="arrow">▾</span>}
        </div>
      ))}
    </aside>
  )
}
