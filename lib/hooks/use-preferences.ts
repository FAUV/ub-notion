'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import type { UserPreferences } from '@/lib/validations/schemas';

const DEFAULT_USER_ID = 'default_user';

async function fetchPreferences(): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', DEFAULT_USER_ID)
    .maybeSingle();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  if (!data) {
    return {
      theme: 'system' as const,
      timezone: 'America/Santiago',
      default_view: 'dashboard',
      notifications_enabled: true,
    };
  }

  const record = data as any;

  return {
    theme: (record.theme || 'system') as 'light' | 'dark' | 'system',
    timezone: record.timezone || 'America/Santiago',
    default_view: record.default_view || 'dashboard',
    notifications_enabled: record.notifications_enabled ?? true,
  };
}

async function updatePreferences(preferences: Partial<UserPreferences>) {
  const { data: existing } = await supabase
    .from('user_preferences')
    .select('id')
    .eq('user_id', DEFAULT_USER_ID)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabase
      .from('user_preferences')
      .update(preferences as any)
      .eq('user_id', DEFAULT_USER_ID)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: DEFAULT_USER_ID,
        ...preferences,
      } as any)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export function usePreferences() {
  return useQuery({
    queryKey: ['preferences'],
    queryFn: fetchPreferences,
    staleTime: Infinity,
  });
}

export function useUpdatePreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePreferences,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
    },
  });
}
