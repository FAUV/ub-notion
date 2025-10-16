
export type ID = string
export type TaskStatus = 'To Do'|'In Progress'|'Review'|'Done'|'Blocked'|'Archived'
export type ProjectStatus = 'Plan'|'Active'|'On Hold'|'At Risk'|'Done'

export interface Project { id: ID; name: string; status: ProjectStatus; priority?: 'Alta'|'Media'|'Baja'; startDate?: string; endDate?: string; budget?: number; progress?: number; risk?: 'Bajo'|'Medio'|'Alto'; program?: string }
export interface Task { id: ID; title: string; status: TaskStatus; priority?: 'Alta'|'Media'|'Baja'; assignee?: string; estimateHours?: number; consumedHours?: number; type?: string; projectId?: ID; sprintId?: ID; dependencies?: ID[]; blocked?: boolean; severity?: 'S1'|'S2'|'S3'; startDate?: string; dueDate?: string; endDate?: string; tags?: string[] }
export interface Sprint { id: ID; name: string; startDate: string; endDate: string; capacityHours?: number }
export interface Study { id: ID; name: string; kind: 'Benchmark'|'UX Research'|'Whitepaper'|'Otro'; status: 'Idea'|'En curso'|'Revisión'|'Publicado'|'Archivado'; priority?: 'Alta'|'Media'|'Baja'; reach?: number; impact?: number; confidence?: number; effort?: number; startDate?: string; endDate?: string; dueDate?: string; summary?: string; tags?: string[] }
export interface ContentItem { id: ID; title: string; kind: 'Presentación'|'Artículo'|'Documento'|'Otro'; status: 'Borrador'|'Revisión'|'Publicado'|'Archivado'; projectId?: ID; dueDate?: string; owner?: string; url?: string; slug?: string }

export interface Area { id: ID; name: string; icon?: string; vision?: string; focus?: string; status?: 'Active'|'Paused'|'Archived' }
export interface Goal { id: ID; title: string; areaId?: ID; dueDate?: string; status: 'Not Started'|'In Progress'|'Completed'|'On Hold'; impact?: number; confidence?: number; progress?: number; horizon?: 'Q1'|'Q2'|'Q3'|'Q4'|'Year' }
export interface Habit { id: ID; title: string; cadence: 'Daily'|'Weekly'|'Monthly'; areaId?: ID; metric?: string; streak?: number; lastChecked?: string }
export interface Note { id: ID; title: string; areaId?: ID; tags?: string[]; summary?: string; lastEdited?: string }
export interface Resource { id: ID; title: string; category: string; url?: string; owner?: string; tags?: string[]; areaId?: ID }
export interface MeetingNote { id: ID; title: string; date: string; attendees?: string[]; notes?: string; followUps?: string[]; projectId?: ID }
export interface CRMContact { id: ID; name: string; company?: string; role?: string; status: 'Lead'|'Active'|'Dormant'|'Archived'; lastContact?: string; nextStep?: string; tags?: string[] }
export interface CalendarEvent { id: ID; title: string; date: string; category: 'Focus'|'Planning'|'Review'|'Meeting'|'Personal'; relatedTaskId?: ID; relatedProjectId?: ID }
export interface JournalEntry { id: ID; date: string; mood?: 'Excelente'|'Bien'|'Neutral'|'Bajo'; highlights?: string; challenges?: string; reflections?: string }
