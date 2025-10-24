'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { FilterConfig } from '@/lib/validations/schemas';

const DEFAULT_USER_ID = 'default_user';

export interface SavedFilter {
  id: string;
  name: string;
  entity_type: string;
  filter_config: FilterConfig;
  is_default: boolean;
}

async function fetchSavedFilters(entityType?: string): Promise<SavedFilter[]> {
  let query = supabase
    .from('saved_filters')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .order('created_at', { ascending: false });

  if (entityType) {
    query = query.eq('entity_type', entityType);
  }

  const { data, error } = await query;

  if (error) throw error;

  return (data || []).map((item) => ({
    id: item.id,
    name: item.name,
    entity_type: item.entity_type,
    filter_config: item.filter_config as FilterConfig,
    is_default: item.is_default,
  }));
}

async function createSavedFilter(input: {
  name: string;
  entity_type: string;
  filter_config: FilterConfig;
  is_default?: boolean;
}) {
  const { data, error } = await supabase
    .from('saved_filters')
    .insert({
      user_id: DEFAULT_USER_ID,
      ...input,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function updateSavedFilter(id: string, updates: Partial<SavedFilter>) {
  const { data, error } = await supabase
    .from('saved_filters')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

async function deleteSavedFilter(id: string) {
  const { error } = await supabase
    .from('saved_filters')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export function useSavedFilters(entityType?: string) {
  return useQuery({
    queryKey: ['saved-filters', entityType],
    queryFn: () => fetchSavedFilters(entityType),
  });
}

export function useCreateSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSavedFilter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
    },
  });
}

export function useUpdateSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<SavedFilter> }) =>
      updateSavedFilter(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
    },
  });
}

export function useDeleteSavedFilter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSavedFilter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-filters'] });
    },
  });
}
