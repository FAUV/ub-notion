
import Dexie, { Table } from 'dexie'
import type {
  Project,
  Task,
  Sprint,
  Study,
  ContentItem,
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
import type { OutboxItem } from './outbox'

class AppDB extends Dexie {
  projects!: Table<Project, string>
  tasks!: Table<Task, string>
  sprints!: Table<Sprint, string>
  studies!: Table<Study, string>
  content!: Table<ContentItem, string>
  areas!: Table<Area, string>
  goals!: Table<Goal, string>
  habits!: Table<Habit, string>
  notes!: Table<Note, string>
  resources!: Table<Resource, string>
  meetings!: Table<MeetingNote, string>
  contacts!: Table<CRMContact, string>
  calendar!: Table<CalendarEvent, string>
  journal!: Table<JournalEntry, string>
  outbox!: Table<OutboxItem, number>

  constructor() {
    super('ub-notion-db')
    this.version(3).stores({
      projects: 'id, name, status',
      tasks: 'id, title, status, projectId, sprintId, dueDate',
      sprints: 'id, name, startDate, endDate',
      studies: 'id, name, status, dueDate',
      content: 'id, title, status, projectId, dueDate',
      areas: 'id, name, status',
      goals: 'id, title, areaId, status, dueDate',
      habits: 'id, title, areaId, cadence',
      notes: 'id, title, areaId, lastEdited',
      resources: 'id, title, areaId, category',
      meetings: 'id, date, projectId',
      contacts: 'id, name, status',
      calendar: 'id, date, category',
      journal: 'id, date',
      outbox: '++id, type, ts'
    })
  }
}
export const db = new AppDB()
