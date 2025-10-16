import { useQuery } from '@tanstack/react-query'
import type { JournalEntry } from '../domain/types'
import { db } from './db'

export const journalKeys = {
  all: ['journal'] as const
}

async function getEntries(): Promise<JournalEntry[]> {
  return db.journal.orderBy('date').reverse().toArray()
}

export function useJournalQuery() {
  return useQuery({
    queryKey: journalKeys.all,
    queryFn: getEntries,
    staleTime: 60_000
  })
}
