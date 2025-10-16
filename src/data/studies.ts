import { useQuery } from '@tanstack/react-query'
import type { Study } from '../domain/types'
import { db } from './db'

export const studyKeys = {
  all: ['studies'] as const
}

async function getStudies(): Promise<Study[]> {
  return db.studies.orderBy('name').toArray()
}

export function useStudiesQuery() {
  return useQuery({
    queryKey: studyKeys.all,
    queryFn: getStudies,
    staleTime: 60_000
  })
}
