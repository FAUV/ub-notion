
import { enqueue, dequeueBatch } from './outbox'
import { api } from '../api/client'

let syncing = false
let intervalId: number | undefined
const isBrowser = typeof window !== 'undefined'

function isOnline() {
  if (typeof navigator === 'undefined') return true
  return navigator.onLine
}

export async function syncNow() {
  if (syncing) return
  syncing = true
  try {
    const batch = await dequeueBatch(100)
    for (const item of batch) {
      try {
        if (!isOnline()) {
          await enqueue(item)
          continue
        }
        await api('/sync', { method: 'POST', body: JSON.stringify(item) })
      } catch (e) {
        console.error('Sync failed on item, requeue', e)
        await enqueue(item) // requeue
      }
    }
  } finally {
    syncing = false
  }
}
export function scheduleSync(intervalMs = 5000) {
  if (!isBrowser) return
  if (intervalId) return
  intervalId = window.setInterval(syncNow, intervalMs)
  void syncNow()

  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      void syncNow()
    }
  }

  window.addEventListener('online', syncNow)
  document.addEventListener('visibilitychange', handleVisibility)
}
