import { useQuery } from '@tanstack/react-query'
import type { Project } from '../domain/types'
import { db } from './db'

export const projectKeys = {
  all: ['projects'] as const
}

async function getProjects(): Promise<Project[]> {
  return db.projects.orderBy('name').toArray()
}

export function useProjectsQuery() {
  return useQuery({
    queryKey: projectKeys.all,
    queryFn: getProjects,
    staleTime: 60_000
  })
}
