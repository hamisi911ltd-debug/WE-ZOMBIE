import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/backend/integrations/supabase/types';

export type Lesson = Tables<'lessons'>;

/**
 * Fetches lessons for a given module, ordered by position ascending.
 *
 * Implements Requirements 3.2, 3.3
 */
export function useLessons(moduleId: string) {
  return useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async (): Promise<Lesson[]> => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*')
        .eq('module_id', moduleId)
        .order('position', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!moduleId,
  });
}

/**
 * Mutation hook to create a new lesson.
 * Invalidates ['lessons', moduleId] on success.
 *
 * Implements Requirement 3.2
 */
export function useCreateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newLesson: TablesInsert<'lessons'>) => {
      const { data, error } = await supabase
        .from('lessons')
        .insert(newLesson)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', data.module_id] });
    },
  });
}

/**
 * Mutation hook to update an existing lesson by ID.
 * Invalidates ['lessons', moduleId] on success.
 *
 * Implements Requirement 3.3
 */
export function useUpdateLesson() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'lessons'> & { id: string }) => {
      const { data, error } = await supabase
        .from('lessons')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', data.module_id] });
    },
  });
}

type ReorderLessonsInput = {
  moduleId: string;
  items: Array<{ id: string; position: number }>;
};

/**
 * Mutation hook to reorder lessons by batch-updating their positions.
 * Invalidates ['lessons', moduleId] on success.
 *
 * Implements Requirement 3.3
 */
export function useReorderLessons() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, items }: ReorderLessonsInput) => {
      const updates = await Promise.all(
        items.map(({ id, position }) =>
          supabase
            .from('lessons')
            .update({ position })
            .eq('id', id)
            .eq('module_id', moduleId)
            .select()
            .single(),
        ),
      );

      const firstError = updates.find((r) => r.error);
      if (firstError?.error) throw firstError.error;

      return updates.map((r) => r.data);
    },
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
    },
  });
}
