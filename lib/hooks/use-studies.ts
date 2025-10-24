'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { StudiesData } from '@/lib/types/entities';

const API_KEY = process.env.NEXT_PUBLIC_UB_API_KEY || '';

async function fetchStudies(search?: string): Promise<StudiesData> {
  const params = new URLSearchParams();
  if (search) params.set('q', search);

  const url = `/api/ub/studies${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch studies: ${response.statusText}`);
  }

  return response.json();
}

export function useStudies(search?: string) {
  return useQuery({
    queryKey: ['studies', search],
    queryFn: () => fetchStudies(search),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useRefreshStudies() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ['studies'] });
  };
}
