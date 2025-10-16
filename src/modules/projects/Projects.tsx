import { useMemo, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { importCSV } from '../../data/importCsv'
import { ViewBar } from '../../components/shell/ViewBar'
import type { Project, ProjectStatus } from '../../domain/types'
import { Timeline } from '../../components/timeline/Timeline'
import { useProjectsQuery, projectKeys } from '../../data/projects'

const STATUS_ORDER: ProjectStatus[] = ['Plan', 'Active', 'At Risk', 'On Hold', 'Done']

function ProjectStatusBoard({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {STATUS_ORDER.map(status => {
        const items = projects.filter(project => project.status === status)
        return (
          <section key={status} className="card p-4 space-y-3">
            <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{status}</header>
            <div className="space-y-3">
              {items.map(project => (
                <article key={project.id} className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-white/60 dark:bg-slate-950/40">
                  <h3 className="font-medium text-sm leading-tight">{project.name}</h3>
                  <dl className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {project.priority && (
                      <div className="flex justify-between gap-2"><dt>Prioridad</dt><dd>{project.priority}</dd></div>
                    )}
                    {project.progress !== undefined && (
                      <div className="flex justify-between gap-2"><dt>Progreso</dt><dd>{project.progress}%</dd></div>
                    )}
                    {project.endDate && (
                      <div className="flex justify-between gap-2"><dt>Entrega</dt><dd>{project.endDate}</dd></div>
                    )}
                  </dl>
                </article>
              ))}
              {!items.length && (
                <p className="text-xs text-slate-500 dark:text-slate-500">Sin proyectos</p>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}

export default function Page() {
  const [active, setActive] = useState<'list'|'board'|'timeline'>('list')
  const queryClient = useQueryClient()
  const { data: projects = [], isLoading } = useProjectsQuery()

  const stats = useMemo(() => {
    const total = projects.length
    const active = projects.filter(project => project.status === 'Active').length
    const risk = projects.filter(project => project.status === 'At Risk').length
    const avgProgress = projects.length
      ? Math.round(projects.reduce((sum, project) => sum + (project.progress ?? 0), 0) / projects.length)
      : 0
    return { total, active, risk, avgProgress }
  }, [projects])

  const timelineItems = useMemo(() =>
    projects
      .filter(project => project.startDate && project.endDate)
      .map(project => ({
        id: project.id,
        name: project.name,
        startDate: project.startDate!,
        endDate: project.endDate!,
        category: project.program
      })),
  [projects])

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importCSV('projects', text)
    await queryClient.invalidateQueries({ queryKey: projectKeys.all })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Proyectos</h1>
        <div className="flex items-center gap-2">
          <label className="btn cursor-pointer">
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={onImport} />
          </label>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-4">
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Portafolio</header>
          <p className="text-2xl font-semibold mt-2">{stats.total}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Activos</header>
          <p className="text-2xl font-semibold mt-2">{stats.active}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">En riesgo</header>
          <p className="text-2xl font-semibold mt-2 text-amber-500">{stats.risk}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Progreso medio</header>
          <p className="text-2xl font-semibold mt-2">{stats.avgProgress}%</p>
        </article>
      </section>

      <ViewBar items={[
        { key: 'list', label: 'Lista' },
        { key: 'board', label: 'Tablero' },
        { key: 'timeline', label: 'Cronograma' }
      ]} active={active} onChange={setActive} />

      {isLoading && <div className="card p-4 text-sm opacity-80">Cargando proyectos...</div>}

      {active === 'list' && (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Proyecto</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Prioridad</th>
                <th className="px-4 py-3 font-medium">Inicio</th>
                <th className="px-4 py-3 font-medium">Fin</th>
                <th className="px-4 py-3 font-medium">Progreso</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {projects.map(project => (
                <tr key={project.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{project.name}</div>
                    {project.program && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{project.program}</div>}
                  </td>
                  <td className="px-4 py-3">{project.status}</td>
                  <td className="px-4 py-3">{project.priority ?? '—'}</td>
                  <td className="px-4 py-3">{project.startDate ?? '—'}</td>
                  <td className="px-4 py-3">{project.endDate ?? '—'}</td>
                  <td className="px-4 py-3">{project.progress !== undefined ? `${project.progress}%` : '—'}</td>
                </tr>
              ))}
              {!projects.length && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm opacity-70">No hay proyectos disponibles.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {active === 'board' && <ProjectStatusBoard projects={projects} />}

      {active === 'timeline' && (
        <Timeline items={timelineItems} emptyMessage="No hay proyectos con cronograma definido." />
      )}
    </div>
  )
}
