import { useMemo } from 'react'
import { useAreasQuery } from '../../data/areas'
import { useProjectsQuery } from '../../data/projects'
import { useGoalsQuery } from '../../data/goals'

function AreaCard({ name, icon, vision, focus, status }: { name: string; icon?: string; vision?: string; focus?: string; status?: string }) {
  return (
    <article className="card p-5 space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-2xl" role="img" aria-hidden={icon ? 'false' : 'true'}>{icon ?? '📁'}</span>
        <div>
          <h2 className="text-lg font-semibold">{name}</h2>
          {status && <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{status}</span>}
        </div>
      </div>
      {vision && <p className="text-sm text-slate-600 dark:text-slate-300">{vision}</p>}
      {focus && (
        <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs">
          <span className="font-medium">Foco actual:</span> {focus}
        </div>
      )}
    </article>
  )
}

export default function Areas() {
  const { data: areas = [], isLoading } = useAreasQuery()
  const { data: projects = [] } = useProjectsQuery()
  const { data: goals = [] } = useGoalsQuery()

  const metrics = useMemo(() => {
    const activeAreas = areas.filter(area => area.status !== 'Archived').length
    const totalGoals = goals.length
    const goalsProgress = goals.reduce((acc, goal) => acc + (goal.progress ?? 0), 0)
    const avgProgress = totalGoals ? Math.round(goalsProgress / totalGoals) : 0
    const projectsByArea = areas.map(area => ({ areaId: area.id, count: projects.filter(project => project.program === area.name).length }))
    return { activeAreas, totalGoals, avgProgress, projectsByArea }
  }, [areas, goals, projects])

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Áreas y programas</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Gestiona las áreas estratégicas de Ultimate Brain con su visión, foco actual y objetivos.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="card p-4">
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Áreas activas</span>
          <p className="text-2xl font-semibold mt-2">{metrics.activeAreas}</p>
        </article>
        <article className="card p-4">
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Objetivos vinculados</span>
          <p className="text-2xl font-semibold mt-2">{metrics.totalGoals}</p>
        </article>
        <article className="card p-4">
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Avance promedio</span>
          <p className="text-2xl font-semibold mt-2">{metrics.avgProgress}%</p>
        </article>
        <article className="card p-4">
          <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Proyectos por área</span>
          <ul className="mt-3 space-y-1 text-sm">
            {metrics.projectsByArea.map(item => (
              <li key={item.areaId} className="flex justify-between"><span>{areas.find(area => area.id === item.areaId)?.name ?? '—'}</span><span>{item.count}</span></li>
            ))}
          </ul>
        </article>
      </section>

      {isLoading ? (
        <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Cargando áreas...</div>
      ) : (
        <section className="grid gap-4 md:grid-cols-3">
          {areas.map(area => (
            <AreaCard key={area.id} {...area} />
          ))}
          {!areas.length && <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">No hay áreas registradas.</div>}
        </section>
      )}
    </div>
  )
}
