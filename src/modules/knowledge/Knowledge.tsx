import { useNotesQuery } from '../../data/notes'
import { useResourcesQuery } from '../../data/resources'

export default function Knowledge() {
  const { data: notes = [], isLoading: loadingNotes } = useNotesQuery()
  const { data: resources = [], isLoading: loadingResources } = useResourcesQuery()

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Knowledge Hub</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Tu base de conocimiento viva: notas etiquetadas, documentación clave y recursos de referencia.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card p-4">
          <header className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">Notas estratégicas</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ideas, aprendizaje y documentación personal.</p>
            </div>
            <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">{notes.length}</span>
          </header>
          {loadingNotes ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando notas...</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {notes.map(note => (
                <li key={note.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  <p className="font-medium">{note.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{note.summary ?? 'Resumen pendiente'}</p>
                  {note.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1 text-xs text-slate-500 dark:text-slate-400">
                      {note.tags.map(tag => <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">#{tag}</span>)}
                    </div>
                  ) : null}
                </li>
              ))}
              {!notes.length && <li className="text-sm text-slate-500 dark:text-slate-400">Aún no hay notas capturadas.</li>}
            </ul>
          )}
        </article>

        <article className="card p-4">
          <header className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-semibold">Repositorio de recursos</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Plantillas, enlaces y assets críticos.</p>
            </div>
            <span className="text-xs rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-1">{resources.length}</span>
          </header>
          {loadingResources ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">Cargando recursos...</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {resources.map(resource => (
                <li key={resource.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{resource.title}</p>
                    <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{resource.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Owner: {resource.owner ?? '—'}</p>
                  {resource.url && (
                    <a className="text-xs text-brand font-medium" href={resource.url} target="_blank" rel="noreferrer">Abrir recurso</a>
                  )}
                  {resource.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-1 text-xs text-slate-500 dark:text-slate-400">
                      {resource.tags.map(tag => <span key={tag} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5">#{tag}</span>)}
                    </div>
                  ) : null}
                </li>
              ))}
              {!resources.length && <li className="text-sm text-slate-500 dark:text-slate-400">Añade tus recursos esenciales.</li>}
            </ul>
          )}
        </article>
      </section>
    </div>
  )
}
