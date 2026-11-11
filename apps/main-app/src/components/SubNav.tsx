interface SubNavProps {
  items: { key: string; label: string; icon: string }[]
  activeKey: string
  onChange: (key: string) => void
}

export default function SubNav({ items, activeKey, onChange }: SubNavProps) {
  return (
    <nav className="subnav-bar">
      {items.map((n) => (
        <span
          key={n.key}
          className={`subnav-item ${activeKey === n.key ? 'active' : ''}`}
          onClick={() => onChange(n.key)}
        >
          <span>{n.icon}</span>
          <span>{n.label}</span>
        </span>
      ))}
    </nav>
  )
}
