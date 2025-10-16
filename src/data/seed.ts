import { addDays, format } from 'date-fns'
import type {
  ContentItem,
  Project,
  Sprint,
  Study,
  Task,
  Area,
  Goal,
  Habit,
  Note,
  Resource,
  MeetingNote,
  CRMContact,
  CalendarEvent,
  JournalEntry
} from '../domain/types'
import { db } from './db'

const today = new Date()

const sampleProjects: Project[] = [
  {
    id: 'proj-brand-refresh',
    name: 'Brand & App Refresh',
    status: 'Active',
    priority: 'Alta',
    startDate: format(addDays(today, -21), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 30), 'yyyy-MM-dd'),
    progress: 48,
    risk: 'Medio',
    program: 'Estrategia digital'
  },
  {
    id: 'proj-growth-labs',
    name: 'Growth Labs 2025',
    status: 'Plan',
    priority: 'Media',
    startDate: format(addDays(today, 14), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 60), 'yyyy-MM-dd'),
    budget: 120000,
    risk: 'Bajo',
    program: 'Innovación'
  },
  {
    id: 'proj-support-ai',
    name: 'AI Support Automation',
    status: 'At Risk',
    priority: 'Alta',
    startDate: format(addDays(today, -7), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 45), 'yyyy-MM-dd'),
    progress: 22,
    risk: 'Alto',
    program: 'Operaciones'
  }
]

const sampleTasks: Task[] = [
  {
    id: 'task-design-system',
    title: 'Actualizar tokens del diseño para modo oscuro',
    status: 'In Progress',
    priority: 'Alta',
    assignee: 'Ana López',
    projectId: 'proj-brand-refresh',
    sprintId: 'sprint-oct',
    dueDate: format(addDays(today, 5), 'yyyy-MM-dd'),
    tags: ['Design System', 'UI'],
    startDate: format(addDays(today, -6), 'yyyy-MM-dd')
  },
  {
    id: 'task-accessibility-audit',
    title: 'Auditoría de accesibilidad WCAG AA',
    status: 'Review',
    priority: 'Alta',
    assignee: 'Carlos Pérez',
    projectId: 'proj-brand-refresh',
    sprintId: 'sprint-oct',
    dueDate: format(addDays(today, 2), 'yyyy-MM-dd'),
    tags: ['A11y'],
    estimateHours: 16
  },
  {
    id: 'task-onboarding-flow',
    title: 'Rediseñar onboarding mobile',
    status: 'To Do',
    priority: 'Media',
    assignee: 'María Estrada',
    projectId: 'proj-growth-labs',
    sprintId: 'sprint-nov',
    dueDate: format(addDays(today, 21), 'yyyy-MM-dd'),
    tags: ['UX Research', 'Mobile'],
    dependencies: ['task-design-system']
  },
  {
    id: 'task-playbook-ai',
    title: 'Documentar playbook de respuesta inteligente',
    status: 'In Progress',
    priority: 'Alta',
    assignee: 'Laura Gómez',
    projectId: 'proj-support-ai',
    sprintId: 'sprint-oct',
    dueDate: format(addDays(today, 9), 'yyyy-MM-dd'),
    tags: ['AI', 'CX']
  },
  {
    id: 'task-metrics-dashboard',
    title: 'Dashboard de métricas para Growth Labs',
    status: 'Done',
    priority: 'Media',
    assignee: 'Javier Ortiz',
    projectId: 'proj-growth-labs',
    sprintId: 'sprint-sep',
    dueDate: format(addDays(today, -3), 'yyyy-MM-dd'),
    endDate: format(addDays(today, -4), 'yyyy-MM-dd'),
    tags: ['Data', 'BI']
  },
  {
    id: 'task-qa-automation',
    title: 'Configurar pruebas E2E críticas',
    status: 'Review',
    priority: 'Alta',
    assignee: 'Luis Ramírez',
    projectId: 'proj-support-ai',
    sprintId: 'sprint-oct',
    dueDate: format(addDays(today, 4), 'yyyy-MM-dd'),
    tags: ['QA', 'Automation']
  }
]

const sampleSprints: Sprint[] = [
  {
    id: 'sprint-sep',
    name: 'Sprint Septiembre',
    startDate: format(addDays(today, -35), 'yyyy-MM-dd'),
    endDate: format(addDays(today, -21), 'yyyy-MM-dd'),
    capacityHours: 240
  },
  {
    id: 'sprint-oct',
    name: 'Sprint Octubre',
    startDate: format(addDays(today, -7), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 7), 'yyyy-MM-dd'),
    capacityHours: 260
  },
  {
    id: 'sprint-nov',
    name: 'Sprint Noviembre',
    startDate: format(addDays(today, 14), 'yyyy-MM-dd'),
    endDate: format(addDays(today, 28), 'yyyy-MM-dd'),
    capacityHours: 250
  }
]

const sampleStudies: Study[] = [
  {
    id: 'study-ux-helios',
    name: 'Benchmark UX helicoidal',
    kind: 'Benchmark',
    status: 'En curso',
    priority: 'Alta',
    reach: 3,
    impact: 3,
    confidence: 2,
    effort: 2,
    startDate: format(addDays(today, -10), 'yyyy-MM-dd'),
    dueDate: format(addDays(today, 10), 'yyyy-MM-dd'),
    summary: 'Comparativa de flujos clave en apps líderes EU/Latam.',
    tags: ['Benchmark', 'Mobile']
  },
  {
    id: 'study-ux-latam',
    name: 'Diarios de uso Latinoamérica',
    kind: 'UX Research',
    status: 'Idea',
    priority: 'Media',
    reach: 2,
    impact: 3,
    confidence: 2,
    effort: 3,
    tags: ['Research']
  }
]

const sampleContent: ContentItem[] = [
  {
    id: 'content-design-kit',
    title: 'Kit de diseño ub-notion 2025',
    kind: 'Documento',
    status: 'Revisión',
    projectId: 'proj-brand-refresh',
    dueDate: format(addDays(today, 12), 'yyyy-MM-dd'),
    owner: 'Ana López',
    url: 'https://example.com/design-kit'
  },
  {
    id: 'content-ai-demo',
    title: 'Demo interactiva IA soporte',
    kind: 'Presentación',
    status: 'Borrador',
    projectId: 'proj-support-ai',
    owner: 'Laura Gómez'
  }
]

const sampleAreas: Area[] = [
  { id: 'area-product', name: 'Producto', icon: '🚀', vision: 'Lanzar experiencias memorables', focus: 'Reducir churn', status: 'Active' },
  { id: 'area-crecimiento', name: 'Crecimiento', icon: '📈', vision: 'Duplicar adquisición orgánica', focus: 'SEO & Contenido', status: 'Active' },
  { id: 'area-personal', name: 'Personal', icon: '🌱', vision: 'Vida equilibrada', focus: 'Bienestar', status: 'Active' }
]

const sampleGoals: Goal[] = [
  { id: 'goal-nps', title: 'Elevar NPS a 60', areaId: 'area-product', status: 'In Progress', dueDate: format(addDays(today, 75), 'yyyy-MM-dd'), impact: 4, confidence: 3, progress: 40, horizon: 'Q4' },
  { id: 'goal-seo', title: 'Top 3 en keywords core', areaId: 'area-crecimiento', status: 'In Progress', dueDate: format(addDays(today, 50), 'yyyy-MM-dd'), impact: 5, confidence: 3, progress: 55, horizon: 'Q4' },
  { id: 'goal-healthy', title: 'Entrenar 4 días por semana', areaId: 'area-personal', status: 'In Progress', impact: 3, confidence: 4, progress: 60, horizon: 'Year' }
]

const sampleHabits: Habit[] = [
  { id: 'habit-standup', title: 'Daily Standup', cadence: 'Daily', areaId: 'area-product', metric: 'Cumplimiento', streak: 12, lastChecked: format(today, 'yyyy-MM-dd') },
  { id: 'habit-writing', title: 'Escribir 500 palabras', cadence: 'Daily', areaId: 'area-crecimiento', metric: 'Palabras', streak: 6, lastChecked: format(addDays(today, -1), 'yyyy-MM-dd') },
  { id: 'habit-yoga', title: 'Yoga matutino', cadence: 'Weekly', areaId: 'area-personal', metric: 'Sesiones', streak: 4, lastChecked: format(addDays(today, -2), 'yyyy-MM-dd') }
]

const sampleNotes: Note[] = [
  { id: 'note-roadmap', title: 'Principios de Roadmap', areaId: 'area-product', summary: 'Lineamientos para priorizar features.', tags: ['roadmap', 'prioritización'], lastEdited: format(addDays(today, -5), 'yyyy-MM-dd') },
  { id: 'note-brand', title: 'Narrativa de marca 2025', areaId: 'area-crecimiento', summary: 'Mensajes y pilares clave.', tags: ['brand', 'storytelling'], lastEdited: format(addDays(today, -2), 'yyyy-MM-dd') },
  { id: 'note-rutina', title: 'Rutina matutina ideal', areaId: 'area-personal', summary: 'Checklist para iniciar el día.', tags: ['hábitos'], lastEdited: format(addDays(today, -1), 'yyyy-MM-dd') }
]

const sampleResources: Resource[] = [
  { id: 'resource-brief', title: 'Brief UX Onboarding', category: 'UX', url: 'https://example.com/brief.pdf', owner: 'María Estrada', tags: ['ux', 'onboarding'], areaId: 'area-product' },
  { id: 'resource-growth', title: 'Playbook de Growth', category: 'Estrategia', url: 'https://example.com/growth', owner: 'Carlos Pérez', tags: ['growth'], areaId: 'area-crecimiento' },
  { id: 'resource-salud', title: 'Plan Nutricional', category: 'Salud', owner: 'Laura Gómez', tags: ['health'], areaId: 'area-personal' }
]

const sampleMeetings: MeetingNote[] = [
  { id: 'meet-product', title: 'Weekly Product Sync', date: format(addDays(today, -1), 'yyyy-MM-dd'), attendees: ['Ana', 'Carlos', 'Laura'], notes: 'Alinear roadmap Q4', followUps: ['Ana: mockups v2', 'Carlos: analizar métricas'], projectId: 'proj-brand-refresh' },
  { id: 'meet-growth', title: 'Growth Office Hours', date: format(addDays(today, -3), 'yyyy-MM-dd'), attendees: ['María', 'Javier'], notes: 'Planificar experimentos SEO', followUps: ['María: keyword gap'], projectId: 'proj-growth-labs' }
]

const sampleContacts: CRMContact[] = [
  { id: 'contact-1', name: 'Sofía Ríos', company: 'Acme Corp', role: 'CTO', status: 'Active', lastContact: format(addDays(today, -5), 'yyyy-MM-dd'), nextStep: 'Enviar demo IA', tags: ['enterprise', 'alto valor'] },
  { id: 'contact-2', name: 'Tomás Vidal', company: 'Startify', role: 'Founder', status: 'Lead', lastContact: format(addDays(today, -2), 'yyyy-MM-dd'), nextStep: 'Agendar workshop', tags: ['startup'] },
  { id: 'contact-3', name: 'Lucía Herrera', company: 'ConsultingX', role: 'Product Lead', status: 'Dormant', lastContact: format(addDays(today, -40), 'yyyy-MM-dd'), nextStep: 'Enviar novedades', tags: ['partner'] }
]

const sampleCalendar: CalendarEvent[] = [
  { id: 'event-weekly-review', title: 'Weekly Review', date: format(addDays(today, 1), 'yyyy-MM-dd'), category: 'Review' },
  { id: 'event-goals', title: 'Goal Planning', date: format(addDays(today, 7), 'yyyy-MM-dd'), category: 'Planning' },
  { id: 'event-focus', title: 'Deep Work Sprint', date: format(addDays(today, 2), 'yyyy-MM-dd'), category: 'Focus', relatedTaskId: 'task-design-system' }
]

const sampleJournal: JournalEntry[] = [
  { id: 'journal-today', date: format(today, 'yyyy-MM-dd'), mood: 'Bien', highlights: 'Presentación con equipo de growth', challenges: 'Bloqueo técnico en automatización', reflections: 'Mantener foco y delegar QA' },
  { id: 'journal-yesterday', date: format(addDays(today, -1), 'yyyy-MM-dd'), mood: 'Excelente', highlights: 'Sprint review positiva', challenges: 'Muchas reuniones', reflections: 'Bloquear mañana para deep work' }
]

let seeded = false

export async function seedDatabase() {
  if (seeded) return
  if (typeof window === 'undefined' || !('indexedDB' in window)) return

  const [
    projects,
    tasks,
    sprints,
    studies,
    content,
    areas,
    goals,
    habits,
    notes,
    resources,
    meetings,
    contacts,
    calendar,
    journal
  ] = await Promise.all([
    db.projects.count(),
    db.tasks.count(),
    db.sprints.count(),
    db.studies.count(),
    db.content.count(),
    db.areas.count(),
    db.goals.count(),
    db.habits.count(),
    db.notes.count(),
    db.resources.count(),
    db.meetings.count(),
    db.contacts.count(),
    db.calendar.count(),
    db.journal.count()
  ])

  const promises: Promise<unknown>[] = []
  if (projects === 0) promises.push(db.projects.bulkAdd(sampleProjects))
  if (tasks === 0) promises.push(db.tasks.bulkAdd(sampleTasks))
  if (sprints === 0) promises.push(db.sprints.bulkAdd(sampleSprints))
  if (studies === 0) promises.push(db.studies.bulkAdd(sampleStudies))
  if (content === 0) promises.push(db.content.bulkAdd(sampleContent))
  if (areas === 0) promises.push(db.areas.bulkAdd(sampleAreas))
  if (goals === 0) promises.push(db.goals.bulkAdd(sampleGoals))
  if (habits === 0) promises.push(db.habits.bulkAdd(sampleHabits))
  if (notes === 0) promises.push(db.notes.bulkAdd(sampleNotes))
  if (resources === 0) promises.push(db.resources.bulkAdd(sampleResources))
  if (meetings === 0) promises.push(db.meetings.bulkAdd(sampleMeetings))
  if (contacts === 0) promises.push(db.contacts.bulkAdd(sampleContacts))
  if (calendar === 0) promises.push(db.calendar.bulkAdd(sampleCalendar))
  if (journal === 0) promises.push(db.journal.bulkAdd(sampleJournal))

  if (promises.length) {
    await Promise.all(promises)
  }

  seeded = true
}
