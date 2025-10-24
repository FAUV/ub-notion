'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { queryClient } from './client';
import { ReactNode, useEffect, useState } from 'react';

const persister = typeof window !== 'undefined'
  ? createSyncStoragePersister({
      storage: window.localStorage,
      key: 'UB_QUERY_CACHE',
    })
  : undefined;

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !persister) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
        buster: 'v1',
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
