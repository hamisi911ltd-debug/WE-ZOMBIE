import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/backend/integrations/supabase/types';

export type Enrollment = Tables<'enrollments'>;

/**
 * Fetches enrollments. If userId is provided, filters by user_id.
 *
 * Implements Requirements 3.5, 5.2, 5.3
 */
export function useEnrollments(userId?: string) {
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async (): Promise<Enrollment[]> => {
      let query = supabase.from('enrollments').select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Mutation hook to create a new enrollment record.
 * Invalidates ['enrollments'] on success.
 *
 * Implements Requirement 5.2
 */
export function useCreateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEnrollment: TablesInsert<'enrollments'>) => {
      const { data, error } = await supabase
        .from('enrollments')
        .insert(newEnrollment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

/**
 * Mutation hook to update an enrollment (e.g. unenroll by setting status to 'withdrawn').
 * Invalidates ['enrollments'] on success.
 */
export function useUpdateEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Enrollment> & { id: string }) => {
      const { data, error } = await supabase
        .from('enrollments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}
