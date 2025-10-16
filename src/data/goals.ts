import { useQuery } from '@tanstack/react-query'
import type { Goal } from '../domain/types'
import { db } from './db'

export const goalKeys = {
  all: ['goals'] as const
}

async function getGoals(): Promise<Goal[]> {
  return db.goals.orderBy('title').toArray()
}

export function useGoalsQuery() {
  return useQuery({
    queryKey: goalKeys.all,
    queryFn: getGoals,
    staleTime: 60_000
  })
}
