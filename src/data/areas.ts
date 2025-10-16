import { useQuery } from '@tanstack/react-query'
import type { Area } from '../domain/types'
import { db } from './db'

export const areaKeys = {
  all: ['areas'] as const
}

async function getAreas(): Promise<Area[]> {
  return db.areas.orderBy('name').toArray()
}

export function useAreasQuery() {
  return useQuery({
    queryKey: areaKeys.all,
    queryFn: getAreas,
    staleTime: 60_000
  })
}
