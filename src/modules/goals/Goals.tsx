import { useMemo, useState } from 'react'
import { ViewBar } from '../../components/shell/ViewBar'
import { useGoalsQuery } from '../../data/goals'
import { useAreasQuery } from '../../data/areas'

type ViewKey = 'dashboard' | 'table'

export default function Goals() {
  const [view, setView] = useState<ViewKey>('dashboard')
  const { data: goals = [], isLoading } = useGoalsQuery()
  const { data: areas = [] } = useAreasQuery()

  const metrics = useMemo(() => {
    const byStatus = goals.reduce<Record<string, number>>((acc, goal) => {
      acc[goal.status] = (acc[goal.status] ?? 0) + 1
      return acc
    }, {})
    const focusGoals = goals.filter(goal => (goal.progress ?? 0) < 80).slice(0, 3)
    const momentum = goals.reduce((acc, goal) => acc + (goal.impact ?? 0) * (goal.progress ?? 0), 0)
    const total = goals.length
    const weighted = total ? Math.round(momentum / total / 5) : 0
    return { byStatus, focusGoals, weighted }
  }, [goals])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Objetivos & OKRs</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Revisa el avance de tus objetivos estratégicos y las conexiones con áreas clave.</p>
      </header>

      <ViewBar
        items={[
          { key: 'dashboard', label: 'Panel' },
          { key: 'table', label: 'Lista' }
        ]}
        active={view}
        onChange={key => setView(key as ViewKey)}
      />

      {isLoading ? (
        <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Cargando objetivos...</div>
      ) : view === 'dashboard' ? (
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card p-4 space-y-2">
            <h2 className="text-sm font-semibold">Estado general</h2>
            <ul className="space-y-2 text-sm">
              {Object.entries(metrics.byStatus).map(([status, count]) => (
                <li key={status} className="flex justify-between"><span>{status}</span><span className="font-medium">{count}</span></li>
              ))}
            </ul>
          </article>
          <article className="card p-4 space-y-2">
            <h2 className="text-sm font-semibold">Objetivos foco</h2>
            <ul className="space-y-2 text-sm">
              {metrics.focusGoals.map(goal => (
                <li key={goal.id}>
                  <p className="font-medium">{goal.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Progreso {goal.progress ?? 0}% · Impacto {goal.impact ?? '—'}</p>
                </li>
              ))}
              {!metrics.focusGoals.length && <li className="text-sm text-slate-500 dark:text-slate-400">Todos los objetivos están encaminados.</li>}
            </ul>
          </article>
          <article className="card p-4 space-y-2">
            <h2 className="text-sm font-semibold">Momentum estratégico</h2>
            <p className="text-4xl font-semibold">{metrics.weighted}%</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Promedio ponderado (impacto x progreso / 5).</p>
          </article>
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Objetivo</th>
                <th className="px-4 py-3 font-medium">Área</th>
                <th className="px-4 py-3 font-medium">Horizon</th>
                <th className="px-4 py-3 font-medium">Impacto</th>
                <th className="px-4 py-3 font-medium">Confianza</th>
                <th className="px-4 py-3 font-medium">Progreso</th>
                <th className="px-4 py-3 font-medium">Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {goals.map(goal => (
                <tr key={goal.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium">{goal.title}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{goal.status}</div>
                  </td>
                  <td className="px-4 py-3">{areas.find(area => area.id === goal.areaId)?.name ?? '—'}</td>
                  <td className="px-4 py-3">{goal.horizon ?? '—'}</td>
                  <td className="px-4 py-3">{goal.impact ?? '—'}</td>
                  <td className="px-4 py-3">{goal.confidence ?? '—'}</td>
                  <td className="px-4 py-3">{goal.progress ?? 0}%</td>
                  <td className="px-4 py-3">{goal.dueDate ?? '—'}</td>
                </tr>
              ))}
              {!goals.length && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">No hay objetivos definidos.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
