
import { useCallback, useMemo, useState } from 'react'
import { importCSV } from '../../data/importCsv'
import { ViewBar } from '../../components/shell/ViewBar'
import { KanbanPro, type KanbanChangeMeta } from '../../components/kanban/KanbanPro'
import { FilterBar, type TaskFilters } from '../../components/filters/FilterBar'
import { MonthCalendar } from '../../components/calendar/MonthCalendar'
import type { Task } from '../../domain/types'
import { useTasksQuery, useUpdateTaskStatusMutation, tasksKeys } from '../../data/tasks'
import { useQueryClient } from '@tanstack/react-query'
import type { ChangeEvent } from 'react'

export default function Page() {
  const [active, setActive] = useState('board')
  const [filters, setFilters] = useState<TaskFilters>({})
  const queryClient = useQueryClient()
  const { data: tasksData = [], isLoading } = useTasksQuery()
  const updateStatus = useUpdateTaskStatusMutation()

  const tasks = useMemo(() => {
    return tasksData.filter(task => {
      if (filters.q && !task.title.toLowerCase().includes(filters.q.toLowerCase())) return false
      if (filters.status && filters.status !== 'All' && task.status !== filters.status) return false
      if (filters.assignee && filters.assignee !== 'All' && (task.assignee ?? '').toLowerCase() !== String(filters.assignee).toLowerCase()) return false
      return true
    })
  }, [tasksData, filters])

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importCSV('tasks', text)
    await queryClient.invalidateQueries({ queryKey: tasksKeys.all })
  }

  const handleBoardChange = useCallback(async (updated: Task, meta: KanbanChangeMeta) => {
    updateStatus.mutate({ id: updated.id, status: updated.status }, {
      onError: (error) => {
        console.error('No se pudo actualizar la tarea', error, { updated, meta })
      }
    })
  }, [updateStatus])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Tareas</h1>
        <div className="flex items-center gap-2">
          <label className="btn cursor-pointer">
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={onImport} />
          </label>
        </div>
      </div>

      <ViewBar items={[
        { key: 'board', label: 'Tablero' },
        { key: 'list', label: 'Lista' },
        { key: 'calendar', label: 'Calendario' }
      ]} active={active} onChange={setActive} />

      <FilterBar onChange={setFilters} />

      {isLoading && <div className="card p-4 text-sm opacity-80">Cargando tareas...</div>}

      {active === 'board' && (
        <KanbanPro tasks={tasks} swimlaneBy="assignee" wip={{'In Progress': 5}} onChange={handleBoardChange} />
      )}
      {active === 'list' && (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Fecha límite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {tasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium">{task.title}</div>
                    {task.tags?.length ? (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {task.tags.map(tag => (
                          <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs">{tag}</span>
                        ))}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{task.status}</td>
                  <td className="px-4 py-3">{task.priority ?? '—'}</td>
                  <td className="px-4 py-3">{task.assignee ?? '—'}</td>
                  <td className="px-4 py-3">{task.dueDate ?? '—'}</td>
                </tr>
              ))}
              {!tasks.length && !isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm opacity-70">
                    No hay tareas con los filtros seleccionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {active === 'calendar' && (
        <div className="card p-4"><MonthCalendar tasks={tasks} /></div>
      )}
    </div>
  )
}
