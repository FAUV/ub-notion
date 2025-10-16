
import { startOfMonth, startOfWeek, addDays, isSameMonth, isSameDay, format, parseISO } from 'date-fns'
import type { Task } from '../../domain/types'

export function MonthCalendar({ tasks, month }: { tasks: Task[]; month?: Date }) {
  const base = month ?? new Date()
  const start = startOfWeek(startOfMonth(base), { weekStartsOn: 1 })
  const days: Date[] = []
  for (let i=0; i<42; i++) days.push(addDays(start, i))

  function tasksForDay(d: Date) {
    return tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate!), d))
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(h => <div key={h} className="text-xs uppercase tracking-wide opacity-60">{h}</div>)}
      {days.map(d => (
        <div key={d.toISOString()} className={"card p-2 " + (!isSameMonth(d, base) ? "opacity-50" : "")}>
          <div className="text-xs mb-1">{format(d, 'd')}</div>
          <div className="space-y-1">
            {tasksForDay(d).map(t => (
              <div key={t.id} className="text-xs truncate rounded-md px-2 py-1 bg-slate-100 dark:bg-slate-800">{t.title}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
