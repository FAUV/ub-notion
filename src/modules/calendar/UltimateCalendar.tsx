import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts'
import { useCalendarEventsQuery } from '../../data/calendarEvents'
import { useTasksQuery } from '../../data/tasks'

export default function UltimateCalendar() {
  const { data: events = [] } = useCalendarEventsQuery()
  const { data: tasks = [] } = useTasksQuery()

  const cadence = useMemo(() => {
    const byDay = new Map<string, number>()
    events.forEach(event => {
      const day = event.date
      byDay.set(day, (byDay.get(day) ?? 0) + 1)
    })
    tasks.filter(task => task.dueDate).forEach(task => {
      const day = task.dueDate as string
      byDay.set(day, (byDay.get(day) ?? 0) + 1)
    })
    return Array.from(byDay.entries())
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([date, count]) => ({ date, count }))
  }, [events, tasks])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Ultimate Calendar</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Integra eventos clave, focos de trabajo y entregas para visualizar tu carga real.</p>
      </header>

      <section className="card p-4">
        <h2 className="text-sm font-semibold mb-3">Cadencia de eventos + entregas</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={cadence}>
              <XAxis dataKey="date" tickFormatter={value => format(parseISO(value), 'dd/MM')} minTickGap={32} />
              <YAxis allowDecimals={false} />
              <Tooltip labelFormatter={value => format(parseISO(String(value)), 'PPP')} />
              <Area dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-4">
          <h2 className="text-sm font-semibold mb-3">Eventos próximos</h2>
          <ul className="space-y-2 text-sm">
            {events.slice(0, 10).map(event => (
              <li key={event.id} className="flex justify-between">
                <span>{event.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{format(parseISO(event.date), 'dd MMM')} · {event.category}</span>
              </li>
            ))}
            {!events.length && <li className="text-sm text-slate-500 dark:text-slate-400">No hay eventos registrados.</li>}
          </ul>
        </article>
        <article className="card p-4">
          <h2 className="text-sm font-semibold mb-3">Entregas planificadas</h2>
          <ul className="space-y-2 text-sm">
            {tasks
              .filter(task => task.dueDate)
              .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
              .slice(0, 10)
              .map(task => (
                <li key={task.id} className="flex justify-between">
                  <span>{task.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">{task.dueDate}</span>
                </li>
              ))}
            {!tasks.filter(task => task.dueDate).length && <li className="text-sm text-slate-500 dark:text-slate-400">Define fechas para tus tareas clave.</li>}
          </ul>
        </article>
      </section>
    </div>
  )
}
