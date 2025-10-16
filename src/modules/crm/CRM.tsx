import { useMemo, useState } from 'react'
import { useContactsQuery } from '../../data/contacts'
import { ViewBar } from '../../components/shell/ViewBar'

const STAGES: ('Lead' | 'Active' | 'Dormant' | 'Archived')[] = ['Lead', 'Active', 'Dormant', 'Archived']

export default function CRM() {
  const [activeStage, setActiveStage] = useState<typeof STAGES[number]>('Lead')
  const { data: contacts = [], isLoading } = useContactsQuery()

  const metrics = useMemo(() => {
    const stageCount = STAGES.map(stage => ({ stage, count: contacts.filter(contact => contact.status === stage).length }))
    const upcoming = contacts.filter(contact => contact.nextStep)?.slice(0, 5)
    return { stageCount, upcoming }
  }, [contacts])

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">CRM Relacional</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Gestiona tus relaciones clave: leads, aliados y clientes con próximo paso claro.</p>
      </header>

      <section className="grid gap-3 md:grid-cols-4">
        {metrics.stageCount.map(item => (
          <article key={item.stage} className="card p-4">
            <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{item.stage}</span>
            <p className="text-2xl font-semibold mt-2">{item.count}</p>
          </article>
        ))}
      </section>

      <ViewBar
        items={STAGES.map(stage => ({ key: stage.toLowerCase(), label: stage }))}
        active={activeStage.toLowerCase()}
        onChange={key => setActiveStage(key.toUpperCase() as typeof STAGES[number])}
        actions={<span className="text-xs text-slate-500 dark:text-slate-400">Próximamente: pipeline drag & drop</span>}
      />

      {isLoading ? (
        <div className="card p-4 text-sm text-slate-500 dark:text-slate-400">Cargando contactos...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          {STAGES.map(stage => (
            <section key={stage} className={`card p-4 space-y-3 ${stage === activeStage ? 'ring-2 ring-brand' : ''}`}>
              <h2 className="text-sm font-semibold">{stage}</h2>
              <div className="space-y-3">
                {contacts.filter(contact => contact.status === stage).map(contact => (
                  <article key={contact.id} className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm">
                    <div className="font-medium">{contact.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{contact.company ?? '—'} · {contact.role ?? '—'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-2">Último contacto: {contact.lastContact ?? '—'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Próximo paso: {contact.nextStep ?? '—'}</div>
                  </article>
                ))}
                {!contacts.filter(contact => contact.status === stage).length && (
                  <p className="text-xs text-slate-500 dark:text-slate-500">Sin registros</p>
                )}
              </div>
            </section>
          ))}
        </div>
      )}

      <section className="card p-4 space-y-3">
        <h2 className="text-sm font-semibold">Próximos follow-ups</h2>
        <ul className="space-y-2 text-sm">
          {metrics.upcoming.map(contact => (
            <li key={contact.id} className="flex justify-between">
              <span>{contact.name}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">{contact.nextStep ?? '—'}</span>
            </li>
          ))}
          {!metrics.upcoming.length && <li className="text-sm text-slate-500 dark:text-slate-400">Define próximos pasos para mantener el momentum.</li>}
        </ul>
      </section>
    </div>
  )
}
