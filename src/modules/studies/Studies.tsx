import { useMemo, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { importCSV } from '../../data/importCsv'
import { ViewBar } from '../../components/shell/ViewBar'
import { useStudiesQuery, studyKeys } from '../../data/studies'
import { Timeline } from '../../components/timeline/Timeline'

function calculateRiceScore(reach?: number, impact?: number, confidence?: number, effort?: number) {
  if (!reach || !impact || !confidence || !effort) return 0
  if (effort === 0) return 0
  return Math.round(((reach * impact * confidence) / effort) * 10) / 10
}

export default function Page() {
  const [active, setActive] = useState<'rice'|'timeline'>('rice')
  const queryClient = useQueryClient()
  const { data: studies = [], isLoading } = useStudiesQuery()

  const enrichedStudies = useMemo(() =>
    studies.map(study => ({ ...study, rice: calculateRiceScore(study.reach, study.impact, study.confidence, study.effort) }))
      .sort((a, b) => b.rice - a.rice),
  [studies])

  const avgScore = useMemo(() => {
    if (!enrichedStudies.length) return 0
    const sum = enrichedStudies.reduce((acc, study) => acc + study.rice, 0)
    return Math.round((sum / enrichedStudies.length) * 10) / 10
  }, [enrichedStudies])

  const timelineItems = useMemo(() =>
    enrichedStudies
      .filter(study => study.startDate && study.endDate)
      .map(study => ({
        id: study.id,
        name: study.name,
        startDate: study.startDate!,
        endDate: study.endDate!,
        category: study.kind
      })),
  [enrichedStudies])

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importCSV('studies', text)
    await queryClient.invalidateQueries({ queryKey: studyKeys.all })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Estudios</h1>
        <div className="flex items-center gap-2">
          <label className="btn cursor-pointer">
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={onImport} />
          </label>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total iniciativas</header>
          <p className="text-2xl font-semibold mt-2">{enrichedStudies.length}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Promedio RICE</header>
          <p className="text-2xl font-semibold mt-2">{avgScore}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">En curso</header>
          <p className="text-2xl font-semibold mt-2">{enrichedStudies.filter(study => study.status === 'En curso').length}</p>
        </article>
      </section>

      <ViewBar items={[
        { key: 'rice', label: 'RICE' },
        { key: 'timeline', label: 'Cronograma' }
      ]} active={active} onChange={setActive} />

      {isLoading && <div className="card p-4 text-sm opacity-80">Cargando estudios...</div>}

      {active === 'rice' && (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Estudio</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Reach</th>
                <th className="px-4 py-3 font-medium">Impact</th>
                <th className="px-4 py-3 font-medium">Confidence</th>
                <th className="px-4 py-3 font-medium">Effort</th>
                <th className="px-4 py-3 font-medium">RICE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {enrichedStudies.map(study => (
                <tr key={study.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-3">
                    <div className="font-medium">{study.name}</div>
                    {study.summary && <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{study.summary}</div>}
                  </td>
                  <td className="px-4 py-3">{study.kind}</td>
                  <td className="px-4 py-3">{study.status}</td>
                  <td className="px-4 py-3">{study.reach ?? '—'}</td>
                  <td className="px-4 py-3">{study.impact ?? '—'}</td>
                  <td className="px-4 py-3">{study.confidence ?? '—'}</td>
                  <td className="px-4 py-3">{study.effort ?? '—'}</td>
                  <td className="px-4 py-3 font-semibold">{study.rice}</td>
                </tr>
              ))}
              {!enrichedStudies.length && !isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-sm opacity-70">No hay estudios registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {active === 'timeline' && (
        <Timeline items={timelineItems} emptyMessage="Agrega fechas de inicio y fin para visualizar el cronograma." />
      )}
    </div>
  )
}
