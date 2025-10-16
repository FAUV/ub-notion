import { useQuery } from '@tanstack/react-query'
import type { Habit } from '../domain/types'
import { db } from './db'

export const habitKeys = {
  all: ['habits'] as const
}

async function getHabits(): Promise<Habit[]> {
  return db.habits.orderBy('title').toArray()
}

export function useHabitsQuery() {
  return useQuery({
    queryKey: habitKeys.all,
    queryFn: getHabits,
    staleTime: 60_000
  })
}
