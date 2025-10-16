import { useQuery } from '@tanstack/react-query'
import type { Resource } from '../domain/types'
import { db } from './db'

export const resourceKeys = {
  all: ['resources'] as const
}

async function getResources(): Promise<Resource[]> {
  return db.resources.orderBy('title').toArray()
}

export function useResourcesQuery() {
  return useQuery({
    queryKey: resourceKeys.all,
    queryFn: getResources,
    staleTime: 60_000
  })
}
