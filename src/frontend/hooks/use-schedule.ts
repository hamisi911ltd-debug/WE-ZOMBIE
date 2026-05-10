import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import { useAuth } from '@/backend/lib/auth-context';
import { filterScheduleForUser } from '@/backend/lib/schedule';
import type { AppRole } from '@/backend/types/domain';
import type { Tables, TablesInsert, TablesUpdate } from '@/backend/integrations/supabase/types';

export type ScheduleEntry = Tables<'schedule_entries'>;

/**
 * Fetches schedule entries scoped by the user's role.
 * Falls back to useAuth() if userId/role are not provided.
 *
 * Implements Requirements 7.1, 7.3, 7.4, 7.5
 */
export function useScheduleEntries(userId?: string, role?: AppRole) {
  const { user, roles } = useAuth();

  const effectiveUserId = userId ?? user?.id;
  const effectiveRole = role ?? (roles[0] as AppRole | undefined);

  return useQuery({
    queryKey: ['schedule-entries', effectiveUserId, effectiveRole],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const { data, error } = await supabase.from('schedule_entries').select('*');

      if (error) throw error;
      const entries = data ?? [];

      if (!effectiveUserId || !effectiveRole) {
        return entries;
      }

      return filterScheduleForUser(entries, effectiveUserId, effectiveRole);
    },
    enabled: !!effectiveUserId,
  });
}

/**
 * Mutation hook to create a new schedule entry.
 * Invalidates ['schedule-entries'] on success.
 *
 * Implements Requirement 7.1
 */
export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEntry: TablesInsert<'schedule_entries'>) => {
      const { data, error } = await supabase
        .from('schedule_entries')
        .insert(newEntry)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-entries'] });
    },
  });
}

/**
 * Mutation hook to update an existing schedule entry by ID.
 * Invalidates ['schedule-entries'] on success.
 *
 * Implements Requirement 7.5
 */
export function useUpdateScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'schedule_entries'> & { id: string }) => {
      const { data, error } = await supabase
        .from('schedule_entries')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-entries'] });
    },
  });
}

/**
 * Mutation hook to delete a schedule entry by ID.
 * Invalidates ['schedule-entries'] on success.
 *
 * Implements Requirement 7.5
 */
export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('schedule_entries').delete().eq('id', id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-entries'] });
    },
  });
}
