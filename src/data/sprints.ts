import { useQuery } from '@tanstack/react-query'
import type { Sprint } from '../domain/types'
import { db } from './db'

export const sprintKeys = {
  all: ['sprints'] as const
}

async function getSprints(): Promise<Sprint[]> {
  return db.sprints.orderBy('startDate').toArray()
}

export function useSprintsQuery() {
  return useQuery({
    queryKey: sprintKeys.all,
    queryFn: getSprints,
    staleTime: 60_000
  })
}
