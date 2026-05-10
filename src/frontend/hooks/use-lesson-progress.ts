import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import type { Tables, TablesInsert } from '@/backend/integrations/supabase/types';

export type LessonProgress = Tables<'lesson_progress'>;

/**
 * Fetches all lesson_progress records for a user for lessons in a given course.
 * Resolves lesson IDs by joining lessons → modules → courses, then fetches progress.
 *
 * Implements Requirements 9.2, 9.3
 */
export function useLessonProgress(userId: string, courseId: string) {
  return useQuery({
    queryKey: ['lesson-progress', userId, courseId],
    queryFn: async (): Promise<LessonProgress[]> => {
      // Get all modules for the course
      const { data: modules, error: modulesError } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', courseId);

      if (modulesError) throw modulesError;

      const moduleIds = (modules ?? []).map((m) => m.id);
      if (moduleIds.length === 0) return [];

      // Get all lessons in those modules
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .in('module_id', moduleIds);

      if (lessonsError) throw lessonsError;

      const lessonIds = (lessons ?? []).map((l) => l.id);
      if (lessonIds.length === 0) return [];

      // Fetch progress records for those lessons for this user
      const { data: progress, error: progressError } = await supabase
        .from('lesson_progress')
        .select('*')
        .eq('user_id', userId)
        .in('lesson_id', lessonIds);

      if (progressError) throw progressError;

      return progress ?? [];
    },
    enabled: !!userId && !!courseId,
  });
}

type MarkLessonCompleteInput = {
  userId: string;
  lessonId: string;
};

/**
 * Mutation hook to upsert a lesson_progress record as completed.
 * Invalidates ['lesson-progress'] on success.
 *
 * Implements Requirement 9.2
 */
export function useMarkLessonComplete() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, lessonId }: MarkLessonCompleteInput) => {
      const record: TablesInsert<'lesson_progress'> = {
        user_id: userId,
        lesson_id: lessonId,
        completed: true,
        completed_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('lesson_progress')
        .upsert(record, { onConflict: 'user_id,lesson_id' })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
    },
  });
}
