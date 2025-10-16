import { useQuery } from '@tanstack/react-query'
import type { ContentItem } from '../domain/types'
import { db } from './db'

export const contentKeys = {
  all: ['content'] as const
}

async function getContent(): Promise<ContentItem[]> {
  return db.content.orderBy('title').toArray()
}

export function useContentQuery() {
  return useQuery({
    queryKey: contentKeys.all,
    queryFn: getContent,
    staleTime: 60_000
  })
}
