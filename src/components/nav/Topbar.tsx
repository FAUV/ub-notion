
import { useState } from 'react'
import { Search, Sun, Moon } from 'lucide-react'
import { toggleTheme } from '../../utils/theme'

export function Topbar() {
  const [q, setQ] = useState('')
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 backdrop-blur">
      <div className="container-padded py-2 flex items-center gap-3">
        <form className="relative flex-1 max-w-xl" onSubmit={e=>e.preventDefault()}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Buscar..." aria-label="Buscar"
            className="w-full pl-9 input" />
        </form>
        <button className="btn-ghost" aria-label="Cambiar tema" onClick={toggleTheme}>
          <Sun className="h-5 w-5 hidden dark:block" />
          <Moon className="h-5 w-5 block dark:hidden" />
        </button>
        <a href="/" className="btn">Nuevo</a>
      </div>
    </header>
  )
}
