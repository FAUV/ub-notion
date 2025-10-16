import { format } from 'date-fns'
import { useMemo } from 'react'
import { useTasksQuery } from '../../data/tasks'
import { useCalendarEventsQuery } from '../../data/calendarEvents'
import { useJournalQuery } from '../../data/journal'

const today = format(new Date(), 'yyyy-MM-dd')

export default function DailyPlanner() {
  const { data: tasks = [] } = useTasksQuery()
  const { data: events = [] } = useCalendarEventsQuery()
  const { data: journalEntries = [] } = useJournalQuery()

  const focusTasks = useMemo(() => tasks.filter(task => task.dueDate === today && task.status !== 'Done').slice(0, 5), [tasks])
  const backlogTasks = useMemo(() => tasks.filter(task => !task.dueDate && task.status === 'To Do').slice(0, 5), [tasks])
  const todayEvents = useMemo(() => events.filter(event => event.date === today), [events])
  const latestJournal = journalEntries[0]

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Daily Planner</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Enfócate en tus tres victorias clave, agenda y energía para hoy ({today}).</p>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Focus de hoy</h2>
          <ul className="space-y-2 text-sm">
            {focusTasks.map(task => (
              <li key={task.id} className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-2">
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{task.priority ?? '—'} · {task.status}</p>
              </li>
            ))}
            {!focusTasks.length && <li className="text-sm text-slate-500 dark:text-slate-400">No hay entregables para hoy.</li>}
          </ul>
        </article>
        <article className="card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Agenda</h2>
          <ul className="space-y-2 text-sm">
            {todayEvents.map(event => (
              <li key={event.id} className="flex justify-between">
                <span>{event.title}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{event.category}</span>
              </li>
            ))}
            {!todayEvents.length && <li className="text-sm text-slate-500 dark:text-slate-400">Día libre de eventos.</li>}
          </ul>
        </article>
        <article className="card p-4 space-y-3">
          <h2 className="text-sm font-semibold">Nota rápida</h2>
          {latestJournal ? (
            <div className="text-sm space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Mood {latestJournal.mood ?? '—'}</p>
              <p className="font-medium">Lo mejor: {latestJournal.highlights ?? '—'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reto: {latestJournal.challenges ?? '—'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reflexión: {latestJournal.reflections ?? '—'}</p>
            </div>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">Captura tu diario para empezar.</p>
          )}
        </article>
      </section>

      <section className="card p-0 overflow-x-auto">
        <header className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold">Backlog próximo</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Tareas sin fecha para mover a focos futuros.</p>
          </div>
        </header>
        <table className="min-w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Tarea</th>
              <th className="px-4 py-3 font-medium">Estado</th>
              <th className="px-4 py-3 font-medium">Prioridad</th>
              <th className="px-4 py-3 font-medium">Proyecto</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {backlogTasks.map(task => (
              <tr key={task.id}>
                <td className="px-4 py-3">{task.title}</td>
                <td className="px-4 py-3">{task.status}</td>
                <td className="px-4 py-3">{task.priority ?? '—'}</td>
                <td className="px-4 py-3">{task.projectId ?? '—'}</td>
              </tr>
            ))}
            {!backlogTasks.length && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">Backlog listo, bien hecho.</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  )
}
