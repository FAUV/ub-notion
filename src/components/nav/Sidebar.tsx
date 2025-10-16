import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Sun,
  CalendarCheck,
  Shapes,
  Target,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  Infinity as InfinityIcon,
  CalendarRange,
  FlaskConical,
  FileText,
  BookOpen,
  Users,
  NotebookPen,
  MessageSquare
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Panel', icon: LayoutDashboard },
  { to: '/daily', label: 'Daily Planner', icon: Sun },
  { to: '/weekly-review', label: 'Weekly Review', icon: CalendarCheck },
  { to: '/areas', label: 'Áreas', icon: Shapes },
  { to: '/goals', label: 'Objetivos', icon: Target },
  { to: '/projects', label: 'Proyectos', icon: FolderKanban },
  { to: '/tasks', label: 'Tareas', icon: CheckSquare },
  { to: '/sprints', label: 'Sprints', icon: CalendarDays },
  { to: '/habits', label: 'Hábitos', icon: InfinityIcon },
  { to: '/calendar', label: 'Calendario', icon: CalendarRange },
  { to: '/studies', label: 'Estudios', icon: FlaskConical },
  { to: '/content', label: 'Contenido', icon: FileText },
  { to: '/knowledge', label: 'Knowledge Hub', icon: BookOpen },
  { to: '/crm', label: 'Relaciones', icon: Users },
  { to: '/journal', label: 'Journal', icon: NotebookPen },
  { to: '/meetings', label: 'Reuniones', icon: MessageSquare }
]

export function Sidebar() {
  return (
    <aside className="hidden md:block w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 p-3">
      <div className="flex items-center gap-2 px-3 py-2 mb-4">
        <img src="/favicon.svg" className="h-6 w-6" alt="logo" />
        <span className="font-semibold">ub-notion</span>
      </div>
      <nav className="space-y-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon className="h-4 w-4" /> <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
