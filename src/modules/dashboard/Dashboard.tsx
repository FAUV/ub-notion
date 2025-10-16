import { useMemo } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, LineChart, Line, CartesianGrid } from 'recharts'
import { useTasksQuery } from '../../data/tasks'
import { useProjectsQuery } from '../../data/projects'
import type { Task, TaskStatus } from '../../domain/types'
import { addDaysStr } from '../../utils/date'

const STATUS_ORDER: TaskStatus[] = ['To Do', 'In Progress', 'Review', 'Done']
const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#6366f1', '#ef4444', '#14b8a6']

function buildStatusDistribution(tasks: Task[]) {
  return STATUS_ORDER.map((status, index) => ({
    name: status,
    value: tasks.filter(task => task.status === status).length,
    color: COLORS[index % COLORS.length]
  }))
}

function buildCumulativeFlow(tasks: Task[]) {
  return STATUS_ORDER.map(status => ({
    status,
    value: tasks.filter(task => task.status === status).length
  }))
}

function buildSevenDayBurndown(tasks: Task[]) {
  const pending = tasks.filter(task => task.status !== 'Done')
  const total = pending.length
  return Array.from({ length: 7 }).map((_, index) => {
    const day = addDaysStr(new Date().toISOString().slice(0, 10), index)
    const remaining = Math.max(total - index * Math.ceil(total / 7), 0)
    return { day, remaining }
  })
}

function buildUpcomingTasks(tasks: Task[]) {
  return tasks
    .filter(task => task.dueDate && task.status !== 'Done')
    .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
    .slice(0, 5)
}

export default function Dashboard() {
  const { data: tasks = [], isLoading: loadingTasks } = useTasksQuery()
  const { data: projects = [], isLoading: loadingProjects } = useProjectsQuery()

  const statusDistribution = useMemo(() => buildStatusDistribution(tasks), [tasks])
  const cumulativeFlow = useMemo(() => buildCumulativeFlow(tasks), [tasks])
  const burndown = useMemo(() => buildSevenDayBurndown(tasks), [tasks])
  const upcomingTasks = useMemo(() => buildUpcomingTasks(tasks), [tasks])

  const completed = tasks.filter(task => task.status === 'Done').length
  const onTrack = tasks.filter(task => task.status === 'In Progress').length

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h2 className="text-lg font-semibold">Estado del portafolio</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Visualiza cómo avanza el trabajo y dónde actuar para desbloquear al equipo.</p>
      </section>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Tareas totales</header>
          <p className="text-2xl font-semibold mt-2">{loadingTasks ? '—' : tasks.length}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Completadas</header>
          <p className="text-2xl font-semibold mt-2 text-emerald-500">{loadingTasks ? '—' : completed}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">En progreso</header>
          <p className="text-2xl font-semibold mt-2">{loadingTasks ? '—' : onTrack}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Proyectos activos</header>
          <p className="text-2xl font-semibold mt-2">{loadingProjects ? '—' : projects.filter(project => project.status === 'Active').length}</p>
        </article>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <header className="font-medium mb-2">Distribución por estado</header>
          <div className="h-64">
            <ResponsiveContainer>
              <PieChart>
                <Pie dataKey="value" data={statusDistribution} nameKey="name" label>
                  {statusDistribution.map(entry => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4">
          <header className="font-medium mb-2">Flujo acumulado</header>
          <div className="h-64">
            <ResponsiveContainer>
              <AreaChart data={cumulativeFlow}>
                <XAxis dataKey="status" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Area dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="card p-4 md:col-span-2">
          <header className="font-medium mb-2">Burn-down 7 días</header>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={burndown}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line dataKey="remaining" stroke="#ef4444" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-4">
          <header className="font-medium mb-2">Próximas entregas</header>
          <ul className="space-y-3 text-sm">
            {upcomingTasks.map(task => (
              <li key={task.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-medium">{task.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{task.assignee ?? 'Sin responsable'}</p>
                </div>
                <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs">{task.dueDate}</span>
              </li>
            ))}
            {!upcomingTasks.length && <li className="text-sm opacity-70">No hay tareas próximas.</li>}
          </ul>
        </div>
        <div className="card p-4">
          <header className="font-medium mb-2">Contexto del portafolio</header>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Monitorea la salud de los proyectos con indicadores en tiempo real, prioriza riesgos y asegúrate de
            que la capacidad del equipo se alinee con la demanda. Importa tus CSV actualizados para mantener la base
            sin conexión y sincronizar cambios con el backend cuando vuelvas a estar en línea.
          </p>
        </div>
      </div>
    </div>
  )
}
