import { useQuery } from '@tanstack/react-query'
import type { Note } from '../domain/types'
import { db } from './db'

export const noteKeys = {
  all: ['notes'] as const
}

async function getNotes(): Promise<Note[]> {
  return db.notes.orderBy('title').toArray()
}

export function useNotesQuery() {
  return useQuery({
    queryKey: noteKeys.all,
    queryFn: getNotes,
    staleTime: 60_000
  })
}
