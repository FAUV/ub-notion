
import { type ReactNode } from 'react'

interface ViewBarItem {
  key: string
  label: string
}

interface ViewBarProps {
  items: ViewBarItem[]
  active: string
  onChange: (key: string) => void
  actions?: ReactNode
}

export function ViewBar({ items, active, onChange, actions }: ViewBarProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="segmented" role="tablist" aria-label="Cambiar vista">
        {items.map(it => (
          <button key={it.key} role="tab" data-active={String(active===it.key)} aria-selected={active===it.key} onClick={()=>onChange(it.key)}>
            {it.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">{actions}</div>
    </div>
  )
}
