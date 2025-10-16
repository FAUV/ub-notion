import { useMemo } from 'react'
import { differenceInCalendarDays, format } from 'date-fns'
import { useTasksQuery } from '../../data/tasks'
import { useGoalsQuery } from '../../data/goals'
import { useJournalQuery } from '../../data/journal'

const today = new Date()

export default function WeeklyReview() {
  const { data: tasks = [] } = useTasksQuery()
  const { data: goals = [] } = useGoalsQuery()
  const { data: journalEntries = [] } = useJournalQuery()

  const review = useMemo(() => {
    const completedThisWeek = tasks.filter(task => task.endDate && differenceInCalendarDays(today, new Date(task.endDate)) <= 7)
    const blocked = tasks.filter(task => task.status === 'Blocked')
    const upcomingGoals = goals.filter(goal => goal.dueDate && differenceInCalendarDays(new Date(goal.dueDate), today) <= 30)
    return { completedThisWeek, blocked, upcomingGoals }
  }, [tasks, goals])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Weekly Review</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Checklist guiado de Ultimate Brain para cerrar la semana con claridad y preparar la siguiente.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card p-4 space-y-2">
          <h2 className="text-sm font-semibold">Celebraciones</h2>
          <ul className="space-y-2 text-sm">
            {review.completedThisWeek.slice(0, 5).map(task => (
              <li key={task.id}>
                <p className="font-medium">{task.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Cerrada {task.endDate}</p>
              </li>
            ))}
            {!review.completedThisWeek.length && <li className="text-sm text-slate-500 dark:text-slate-400">Sin entregables esta semana.</li>}
          </ul>
        </article>
        <article className="card p-4 space-y-2">
          <h2 className="text-sm font-semibold">Bloqueos</h2>
          <ul className="space-y-2 text-sm">
            {review.blocked.slice(0, 5).map(task => (
              <li key={task.id} className="flex justify-between">
                <span>{task.title}</span>
                <span className="text-xs text-slate-500 dark:text-slate-400">{task.assignee ?? '—'}</span>
              </li>
            ))}
            {!review.blocked.length && <li className="text-sm text-slate-500 dark:text-slate-400">Nada bloqueado, sigue así.</li>}
          </ul>
        </article>
        <article className="card p-4 space-y-2">
          <h2 className="text-sm font-semibold">Próximos 30 días</h2>
          <ul className="space-y-2 text-sm">
            {review.upcomingGoals.map(goal => (
              <li key={goal.id}>
                <p className="font-medium">{goal.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Entrega {goal.dueDate}</p>
              </li>
            ))}
            {!review.upcomingGoals.length && <li className="text-sm text-slate-500 dark:text-slate-400">Sin entregas próximas.</li>}
          </ul>
        </article>
      </section>

      <section className="card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Reflexiones del diario</h2>
        <ul className="space-y-2 text-sm">
          {journalEntries.slice(0, 4).map(entry => (
            <li key={entry.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">{format(new Date(entry.date), 'dd MMM')}</span>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{entry.mood ?? '—'}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Highlight: {entry.highlights ?? '—'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Reto: {entry.challenges ?? '—'}</p>
            </li>
          ))}
          {!journalEntries.length && <li className="text-sm text-slate-500 dark:text-slate-400">Añade tus reflexiones para nutrir la revisión semanal.</li>}
        </ul>
      </section>
    </div>
  )
}
