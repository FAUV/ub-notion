import { useMemo, useState, type ChangeEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { importCSV } from '../../data/importCsv'
import { ViewBar } from '../../components/shell/ViewBar'
import { useContentQuery, contentKeys } from '../../data/content'

function ContentGallery({ items }: { items: ReturnType<typeof useContentQuery>['data'] }) {
  if (!items?.length) {
    return <div className="card p-4 text-sm opacity-80">No hay contenidos registrados.</div>
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map(item => (
        <article key={item.id} className="card p-4 space-y-3">
          <header>
            <h3 className="font-semibold text-base leading-tight">{item.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.kind}</p>
          </header>
          <dl className="text-sm text-slate-600 dark:text-slate-300 space-y-1">
            <div className="flex justify-between">
              <dt className="font-medium">Estado</dt>
              <dd>{item.status}</dd>
            </div>
            {item.owner && (
              <div className="flex justify-between"><dt className="font-medium">Responsable</dt><dd>{item.owner}</dd></div>
            )}
            {item.dueDate && (
              <div className="flex justify-between"><dt className="font-medium">Entrega</dt><dd>{item.dueDate}</dd></div>
            )}
          </dl>
          {item.url && (
            <a href={item.url} target="_blank" rel="noreferrer" className="text-sm text-brand font-medium hover:underline">Abrir recurso</a>
          )}
        </article>
      ))}
    </div>
  )
}

export default function Page() {
  const [active, setActive] = useState<'gallery'|'list'>('gallery')
  const queryClient = useQueryClient()
  const { data: content = [], isLoading } = useContentQuery()

  const stats = useMemo(() => {
    const total = content.length
    const published = content.filter(item => item.status === 'Publicado').length
    const review = content.filter(item => item.status === 'Revisión').length
    return { total, published, review }
  }, [content])

  async function onImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    const text = await file.text()
    await importCSV('content', text)
    await queryClient.invalidateQueries({ queryKey: contentKeys.all })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Contenido</h1>
        <div className="flex items-center gap-2">
          <label className="btn cursor-pointer">
            Importar CSV
            <input type="file" accept=".csv" className="hidden" onChange={onImport} />
          </label>
        </div>
      </div>

      <section className="grid gap-3 md:grid-cols-3">
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Total activos</header>
          <p className="text-2xl font-semibold mt-2">{stats.total}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">En revisión</header>
          <p className="text-2xl font-semibold mt-2">{stats.review}</p>
        </article>
        <article className="card p-4">
          <header className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Publicados</header>
          <p className="text-2xl font-semibold mt-2 text-emerald-500">{stats.published}</p>
        </article>
      </section>

      <ViewBar items={[
        { key: 'gallery', label: 'Galería' },
        { key: 'list', label: 'Lista' }
      ]} active={active} onChange={setActive} />

      {isLoading && <div className="card p-4 text-sm opacity-80">Cargando contenidos...</div>}

      {active === 'gallery' && <ContentGallery items={content} />}

      {active === 'list' && (
        <div className="card p-0 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Proyecto</th>
                <th className="px-4 py-3 font-medium">Responsable</th>
                <th className="px-4 py-3 font-medium">Entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {content.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/60">
                  <td className="px-4 py-3">{item.title}</td>
                  <td className="px-4 py-3">{item.kind}</td>
                  <td className="px-4 py-3">{item.status}</td>
                  <td className="px-4 py-3">{item.projectId ?? '—'}</td>
                  <td className="px-4 py-3">{item.owner ?? '—'}</td>
                  <td className="px-4 py-3">{item.dueDate ?? '—'}</td>
                </tr>
              ))}
              {!content.length && !isLoading && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-sm opacity-70">No hay contenidos registrados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
