
import { db } from './db'

export interface OutboxItem {
  type: 'task.upsert' | 'project.upsert' | 'task.delete' | 'project.delete'
  payload: unknown
  ts: number
  id?: number
}

export async function enqueue(item: OutboxItem) {
  await db.outbox.add({ ...item, ts: Date.now() })
}

export async function dequeueBatch(limit = 50) {
  const all = await db.outbox.orderBy('id').limit(limit).toArray()
  await db.outbox.bulkDelete(all.map(i => i.id!))
  return all
}
