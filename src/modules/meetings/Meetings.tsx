import { useMeetingsQuery } from '../../data/meetings'
import { useProjectsQuery } from '../../data/projects'

export default function Meetings() {
  const { data: meetings = [], isLoading } = useMeetingsQuery()
  const { data: projects = [] } = useProjectsQuery()

  const projectName = (projectId?: string) => projects.find(project => project.id === projectId)?.name ?? '—'

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Meeting Notes</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Centraliza acuerdos, asistentes y follow-ups para ejecutar sin fricción.</p>
      </header>

      {isLoading ? (
        <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Cargando notas de reuniones...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {meetings.map(meeting => (
            <article key={meeting.id} className="card p-4 space-y-3 text-sm">
              <header className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold">{meeting.title}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{meeting.date} · {projectName(meeting.projectId)}</p>
                </div>
              </header>
              {meeting.attendees?.length ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">Asistentes: {meeting.attendees.join(', ')}</p>
              ) : null}
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Notas</p>
                <p>{meeting.notes ?? '—'}</p>
              </div>
              {meeting.followUps?.length ? (
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1">Follow-ups</p>
                  <ul className="list-disc list-inside space-y-1">
                    {meeting.followUps.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              ) : null}
            </article>
          ))}
          {!meetings.length && <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Captura tu próxima reunión para nutrir la base.</div>}
        </div>
      )}
    </div>
  )
}
