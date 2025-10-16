import { useMemo, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { addDays, differenceInCalendarDays, format, parseISO } from 'date-fns'
import { importCSV } from '../../data/importCsv'
import { ViewBar } from '../../components/shell/ViewBar'
import { useSprintsQuery, sprintKeys } from '../../data/sprints'
import { useTasksQuery } from '../../data/tasks'
import type { Sprint, Task } from '../../domain/types'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

function SprintSummary({ sprints }: { sprints: Sprint[] }) {
  const upcoming = sprints.filter(sprint => sprint.startDate && parseISO(sprint.startDate) > new Date()).length
  const running = sprints.filter(sprint => {
    if (!sprint.startDate || !sprint.endDate) return false
    const start = parseISO(sprint.startDate)
    const end = parseISO(sprint.endDate)
    const now = new Date()
    return start <= now && now <= end
  }).length
  return (
    <section className="grid gap-3 md:grid-cols-3">
      <article className="card p-4">
        <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Sprints totales</header>
        <p className="text-2xl font-semibold mt-2">{sprints.length}</p>
      </article>
      <article className="card p-4">
        <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">En curso</header>
        <p className="text-2xl font-semibold mt-2">{running}</p>
      </article>
      <article className="card p-4">
        <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Próximos</header>
        <p className="text-2xl font-semibold mt-2">{upcoming}</p>
      </article>
    </section>
  )
}

function buildBurndownData(sprint: Sprint, tasks: Task[]) {
  if (!sprint.startDate || !sprint.endDate) return []
  const start = parseISO(sprint.startDate)
  const end = parseISO(sprint.endDate)
  const totalDays = Math.max(differenceInCalendarDays(end, start), 1)
  const sprintTasks = tasks.filter(task => task.sprintId === sprint.id)
  const totalTasks = sprintTasks.length
  if (!totalTasks) return []

  return Array.from({ length: totalDays + 1 }).map((_, index) => {
    const day = addDays(start, index)
    const completed = sprintTasks.filter(task => task.status === 'Done' && task.endDate && parseISO(task.endDate) <= day).length
    const remaining = Math.max(totalTasks - completed, 0)
    const idealSlope = totalDays === 0 ? totalTasks : totalTasks / totalDays
    const ideal = Math.max(Math.round(totalTasks - idealSlope * index), 0)
    return {
      day: format(day, 'MM-dd'),
      ideal,
      remaining
    }
  })
}

export default function Page() {
  const [active, setActive] = useState<'list'|'burndown'>('list')
  const queryClient = useQueryClient()
  const { data: sprints = [], isLoading } = useSprintsQuery()
  const { data: tasks = [], isLoading: isLoadingTasks } = useTasksQuery()
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null)

  const selectedSprint = useMemo(() => {
    if (!sprints.length) return null
    const targetId = selectedSprintId ?? sprints[sprints.length - 1]?.id
    return sprints.find(sprint => sprint.id === targetId) ?? sprints[0]
  }, [selectedSprintId, sprints])

  const burndownData = useMemo(() => {
    if (!selectedSprint) return []
    return buildBurndownData(selectedSprint, tasks)
  }, [selectedSprint, tasks])

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importCSV('sprints', text)
    await queryClient.invalidateQueries({ queryKey: sprintKeys.all })
  }

  const sprintSelectId = 'sprint-select'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Sprints</h1>
        <div className="flex items-center gap-2">
          <label className="btn cursor-pointer">
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={onImport} />
          </label>
        </div>
      </div>

      <SprintSummary sprints={sprints} />

      <ViewBar items={[
        { key: 'list', label: 'Lista' },
        { key: 'burndown', label: 'Burn-down' }
      ]} active={active} onChange={view => setActive(view as 'list'|'burndown')} />

      {(isLoading || isLoadingTasks) && <div className="card p-4 text-sm opacity-80">Cargando datos de sprints...</div>}

      {active === 'list' && (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Sprint</th>
                <th className="px-4 py-3 font-medium">Inicio</th>
                <th className="px-4 py-3 font-medium">Fin</th>
                <th className="px-4 py-3 font-medium">Capacidad (hrs)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {sprints.map(sprint => (
                <tr key={sprint.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-3">{sprint.name}</td>
                  <td className="px-4 py-3">{sprint.startDate}</td>
                  <td className="px-4 py-3">{sprint.endDate}</td>
                  <td className="px-4 py-3">{sprint.capacityHours ?? '—'}</td>
                </tr>
              ))}
              {!sprints.length && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm opacity-70">No hay sprints registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {active === 'burndown' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm font-medium" htmlFor={sprintSelectId}>Sprint</label>
            <select
              className="input"
              id={sprintSelectId}
              value={selectedSprint?.id ?? ''}
              onChange={event => setSelectedSprintId(event.target.value || null)}
            >
              {sprints.map(sprint => (
                <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
              ))}
            </select>
          </div>

          {selectedSprint && burndownData.length ? (
            <div className="card p-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={burndownData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="ideal" stroke="#94a3b8" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="remaining" stroke="#0ea5e9" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="card p-4 text-sm opacity-80">No hay datos suficientes para el burn-down del sprint seleccionado.</div>
          )}
        </div>
      )}
    </div>
  )
}
