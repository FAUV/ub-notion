
import { QueryClient } from '@tanstack/react-query'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { persistQueryClient } from '@tanstack/react-query-persist-client'

export const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1000 * 30 } } })
if (typeof window !== 'undefined') {
  const persister = createSyncStoragePersister({ storage: window.localStorage })
  persistQueryClient({ queryClient, persister, maxAge: 1000 * 60 * 60 })
}
