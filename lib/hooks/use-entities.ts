'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { EntityType, Task, Project, Area, Note, Goal, Habit, Review, CalendarEvent } from '@/lib/types/entities';

const API_KEY = process.env.NEXT_PUBLIC_UB_API_KEY || '';

interface FetchOptions {
  search?: string;
  expand?: boolean;
  filters?: Record<string, string>;
}

async function fetchEntities<T>(
  entity: EntityType,
  options: FetchOptions = {}
): Promise<T[]> {
  const params = new URLSearchParams();

  if (options.search) params.set('q', options.search);
  if (options.expand) params.set('expand', 'relations');

  Object.entries(options.filters || {}).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  const url = `/api/ub/${entity}${params.toString() ? `?${params.toString()}` : ''}`;

  const response = await fetch(url, {
    headers: API_KEY ? { 'x-api-key': API_KEY } : {},
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${entity}: ${response.statusText}`);
  }

  return response.json();
}

async function createEntity(entity: EntityType, data: Record<string, any>) {
  const response = await fetch(`/api/ub/${entity}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to create ${entity}`);
  }

  return response.json();
}

async function updateEntity(
  entity: EntityType,
  id: string,
  data: Record<string, any>
) {
  const response = await fetch(`/api/ub/${entity}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
    },
    body: JSON.stringify({ data }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to update ${entity}`);
  }

  return response.json();
}

async function deleteEntity(entity: EntityType, id: string) {
  const response = await fetch(`/api/ub/${entity}/${id}`, {
    method: 'DELETE',
    headers: API_KEY ? { 'x-api-key': API_KEY } : {},
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || `Failed to delete ${entity}`);
  }

  return response.json();
}

export function useEntities<T>(entity: EntityType, options: FetchOptions = {}) {
  return useQuery({
    queryKey: [entity, options],
    queryFn: () => fetchEntities<T>(entity, options),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

export function useTasks(options: FetchOptions = {}) {
  return useEntities<Task>('tasks', options);
}

export function useProjects(options: FetchOptions = {}) {
  return useEntities<Project>('projects', options);
}

export function useAreas(options: FetchOptions = {}) {
  return useEntities<Area>('areas', options);
}

export function useNotes(options: FetchOptions = {}) {
  return useEntities<Note>('notes', options);
}

export function useGoals(options: FetchOptions = {}) {
  return useEntities<Goal>('goals', options);
}

export function useHabits(options: FetchOptions = {}) {
  return useEntities<Habit>('habits', options);
}

export function useReviews(options: FetchOptions = {}) {
  return useEntities<Review>('reviews', options);
}

export function useCalendarEvents(options: FetchOptions = {}) {
  return useEntities<CalendarEvent>('calendar', options);
}

export function useCreateEntity(entity: EntityType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, any>) => createEntity(entity, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
}

export function useUpdateEntity(entity: EntityType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, any> }) =>
      updateEntity(entity, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
}

export function useDeleteEntity(entity: EntityType) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEntity(entity, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [entity] });
    },
  });
}
