import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/backend/integrations/supabase/types';

export type Module = Tables<'modules'>;

/**
 * Fetches modules for a given course, ordered by position ascending.
 *
 * Implements Requirements 3.2, 3.3
 */
export function useModules(courseId: string) {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async (): Promise<Module[]> => {
      const { data, error } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!courseId,
  });
}

/**
 * Mutation hook to create a new module.
 * Invalidates ['modules', courseId] on success.
 *
 * Implements Requirement 3.2
 */
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newModule: TablesInsert<'modules'>) => {
      const { data, error } = await supabase
        .from('modules')
        .insert(newModule)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.course_id] });
    },
  });
}

/**
 * Mutation hook to update an existing module by ID.
 * Invalidates ['modules', courseId] on success.
 *
 * Implements Requirement 3.3
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'modules'> & { id: string }) => {
      const { data, error } = await supabase
        .from('modules')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.course_id] });
    },
  });
}

type ReorderModulesInput = {
  courseId: string;
  items: Array<{ id: string; position: number }>;
};

/**
 * Mutation hook to reorder modules by batch-updating their positions.
 * Invalidates ['modules', courseId] on success.
 *
 * Implements Requirement 3.3
 */
export function useReorderModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, items }: ReorderModulesInput) => {
      const updates = await Promise.all(
        items.map(({ id, position }) =>
          supabase
            .from('modules')
            .update({ position })
            .eq('id', id)
            .eq('course_id', courseId)
            .select()
            .single(),
        ),
      );

      const firstError = updates.find((r) => r.error);
      if (firstError?.error) throw firstError.error;

      return updates.map((r) => r.data);
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
    },
  });
}
