import { useQuery } from '@tanstack/react-query'
import type { CRMContact } from '../domain/types'
import { db } from './db'

export const contactKeys = {
  all: ['contacts'] as const
}

async function getContacts(): Promise<CRMContact[]> {
  return db.contacts.orderBy('name').toArray()
}

export function useContactsQuery() {
  return useQuery({
    queryKey: contactKeys.all,
    queryFn: getContacts,
    staleTime: 60_000
  })
}
