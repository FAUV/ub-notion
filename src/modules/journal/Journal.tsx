import { useJournalQuery } from '../../data/journal'

export default function Journal() {
  const { data: entries = [], isLoading } = useJournalQuery()

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Journal & Mood Tracker</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Reflexiones diarias vinculadas a Ultimate Brain para mantener claridad mental.</p>
      </header>

      {isLoading ? (
        <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Cargando entradas...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {entries.map(entry => (
            <article key={entry.id} className="card p-4 space-y-2">
              <header className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">{entry.date}</h2>
                <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{entry.mood ?? '—'}</span>
              </header>
              <div className="text-sm space-y-2">
                <p><span className="font-medium">Highlights:</span> {entry.highlights ?? '—'}</p>
                <p><span className="font-medium">Retos:</span> {entry.challenges ?? '—'}</p>
                <p><span className="font-medium">Reflexión:</span> {entry.reflections ?? '—'}</p>
              </div>
            </article>
          ))}
          {!entries.length && <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Comienza registrando tu primer apunte.</div>}
        </div>
      )}
    </div>
  )
}
