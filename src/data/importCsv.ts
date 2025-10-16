import Papa from 'papaparse'
import { db } from './db'
import type { Project, Task, Sprint, Study, ContentItem, TaskStatus, ProjectStatus } from '../domain/types'

type Row = Record<string, string>

const norm = (value?: string) => (value ?? '').trim()

const PRIORITY_VALUES = new Set(['Alta', 'Media', 'Baja'])
const PROJECT_RISK_VALUES = new Set(['Bajo', 'Medio', 'Alto'])
const TASK_SEVERITY_VALUES = new Set(['S1', 'S2', 'S3'])
const STUDY_STATUS_VALUES = new Set(['Idea', 'En curso', 'Revisión', 'Publicado', 'Archivado'])
const STUDY_KIND_VALUES = new Set(['Benchmark', 'UX Research', 'Whitepaper', 'Otro'])
const CONTENT_STATUS_VALUES = new Set(['Borrador', 'Revisión', 'Publicado', 'Archivado'])
const CONTENT_KIND_VALUES = new Set(['Presentación', 'Artículo', 'Documento', 'Otro'])

function normTaskStatus(source?: string): TaskStatus {
  const value = norm(source).toLowerCase()
  if (!value) return 'To Do'
  if (['to do', 'todo', 'por hacer', 'pendiente', 'nuevo', 'new', 'backlog'].includes(value)) return 'To Do'
  if (['in progress', 'en progreso', 'en curso', 'doing', 'wip'].includes(value)) return 'In Progress'
  if (['review', 'para revisión', 'revision', 'en revisión'].includes(value)) return 'Review'
  if (['done', 'hecho', 'completado', 'cerrado', 'finalizado'].includes(value)) return 'Done'
  if (['blocked', 'bloqueado'].includes(value)) return 'Blocked'
  if (['archived', 'archivado'].includes(value)) return 'Archived'
  return 'To Do'
}

function normProjectStatus(source?: string): ProjectStatus {
  const value = norm(source).toLowerCase()
  if (!value) return 'Active'
  if (['plan', 'planificado', 'planification', 'planning'].includes(value)) return 'Plan'
  if (['active', 'en progreso', 'activo'].includes(value)) return 'Active'
  if (['on hold', 'pausado', 'en pausa'].includes(value)) return 'On Hold'
  if (['at risk', 'en riesgo', 'riesgo'].includes(value)) return 'At Risk'
  if (['done', 'hecho', 'completado', 'cerrado', 'finalizado'].includes(value)) return 'Done'
  return 'Active'
}

const toNumber = (value?: string) => {
  const trimmed = norm(value)
  return trimmed ? Number(trimmed) : undefined
}

const toBoolean = (value?: string) => norm(value).toLowerCase() === 'true'

const toProjectPriority = (value?: string): Project['priority'] => {
  const normalized = norm(value)
  return PRIORITY_VALUES.has(normalized) ? (normalized as Project['priority']) : undefined
}

const toProjectRisk = (value?: string): Project['risk'] => {
  const normalized = norm(value)
  return PROJECT_RISK_VALUES.has(normalized) ? (normalized as Project['risk']) : 'Bajo'
}

const toTaskPriority = (value?: string): Task['priority'] => {
  const normalized = norm(value)
  return PRIORITY_VALUES.has(normalized) ? (normalized as Task['priority']) : undefined
}

const toTaskSeverity = (value?: string): Task['severity'] => {
  const normalized = norm(value).toUpperCase()
  return TASK_SEVERITY_VALUES.has(normalized) ? (normalized as Task['severity']) : 'S3'
}

const toStudyStatus = (value?: string): Study['status'] => {
  const normalized = norm(value)
  return STUDY_STATUS_VALUES.has(normalized) ? (normalized as Study['status']) : 'Idea'
}

const toStudyKind = (value?: string): Study['kind'] => {
  const normalized = norm(value)
  return STUDY_KIND_VALUES.has(normalized) ? (normalized as Study['kind']) : 'Otro'
}

const toContentStatus = (value?: string): ContentItem['status'] => {
  const normalized = norm(value)
  return CONTENT_STATUS_VALUES.has(normalized) ? (normalized as ContentItem['status']) : 'Borrador'
}

const toContentKind = (value?: string): ContentItem['kind'] => {
  const normalized = norm(value)
  return CONTENT_KIND_VALUES.has(normalized) ? (normalized as ContentItem['kind']) : 'Documento'
}

export async function importCSV(kind: 'projects' | 'tasks' | 'sprints' | 'studies' | 'content', csvText: string) {
  const parsed = Papa.parse<Row>(csvText, { header: true })
  const rows = parsed.data.filter(Boolean)

  switch (kind) {
    case 'projects':
      await db.projects.bulkPut(rows.map(mapProject))
      break
    case 'tasks':
      await db.tasks.bulkPut(rows.map(mapTask))
      break
    case 'sprints':
      await db.sprints.bulkPut(rows.map(mapSprint))
      break
    case 'studies':
      await db.studies.bulkPut(rows.map(mapStudy))
      break
    case 'content':
      await db.content.bulkPut(rows.map(mapContent))
      break
  }
}

function mapProject(row: Row): Project {
  return {
    id: norm(row['id']) || crypto.randomUUID(),
    name: row['Nombre'] || row['Name'] || row['Título'] || 'Sin nombre',
    status: normProjectStatus(row['Estado_Normalizado'] || row['Estado'] || 'Active'),
    priority: toProjectPriority(row['Prioridad']) ?? 'Media',
    startDate: row['Inicio'] || row['Start date'] || undefined,
    endDate: row['Fin'] || row['Due date'] || undefined,
    budget: toNumber(row['Budget']),
    progress: toNumber(row['% Avance']),
    risk: toProjectRisk(row['Riesgo']),
    program: row['Programa'] || undefined
  }
}

function mapTask(row: Row): Task {
  const tags = (row['Tags'] || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)

  const dependencies = (row['Dependencias (rel)'] || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)

  return {
    id: norm(row['id']) || crypto.randomUUID(),
    title: row['Título'] || row['Title'] || row['Nombre'] || 'Sin título',
    status: normTaskStatus(row['Estado_Normalizado'] || row['Estado'] || 'To Do'),
    priority: toTaskPriority(row['Prioridad']) ?? 'Media',
    assignee: row['Responsable'] || row['Assignee'] || undefined,
    estimateHours: toNumber(row['Estimado (hrs)']),
    consumedHours: toNumber(row['Consumido (hrs)']),
    type: row['Tipo'] || undefined,
    projectId: row['Proyecto (rel)'] || undefined,
    sprintId: row['Sprint (rel)'] || undefined,
    dependencies,
    blocked: toBoolean(row['Bloqueado']),
    severity: toTaskSeverity(row['Severidad']),
    startDate: row['Inicio'] || undefined,
    dueDate: row['Due date'] || undefined,
    endDate: row['Fin'] || undefined,
    tags
  }
}

function mapSprint(row: Row): Sprint {
  return {
    id: norm(row['id']) || crypto.randomUUID(),
    name: row['Nombre'] || row['Name'] || 'Sprint',
    startDate: row['Inicio'] || '',
    endDate: row['Fin'] || '',
    capacityHours: toNumber(row['Capacidad (hrs)'])
  }
}

function mapStudy(row: Row): Study {
  const tags = (row['Tags'] || '')
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)

  return {
    id: norm(row['id']) || crypto.randomUUID(),
    name: row['Nombre'] || row['Name'] || 'Estudio',
    kind: toStudyKind(row['Tipo']),
    status: toStudyStatus(row['Estado']),
    priority: toProjectPriority(row['Prioridad']) ?? 'Media',
    reach: toNumber(row['Alcance']),
    impact: toNumber(row['Impacto']),
    confidence: toNumber(row['Confianza']),
    effort: toNumber(row['Esfuerzo']),
    startDate: row['Inicio'] || undefined,
    endDate: row['Fin'] || undefined,
    dueDate: row['Due date'] || undefined,
    summary: row['Resumen'] || undefined,
    tags
  }
}

function mapContent(row: Row): ContentItem {
  return {
    id: norm(row['id']) || crypto.randomUUID(),
    title: row['Título'] || row['Title'] || 'Contenido',
    kind: toContentKind(row['Tipo']),
    status: toContentStatus(row['Estado']),
    projectId: row['Proyecto (rel)'] || undefined,
    dueDate: row['Due date'] || undefined,
    owner: row['Owner'] || row['Propietario'] || undefined,
    url: row['URL / Archivo'] || row['URL'] || undefined,
    slug: row['SEO/Slug'] || undefined
  }
}
