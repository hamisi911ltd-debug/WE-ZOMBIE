import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLessonProgressFn, markLessonCompleteFn } from '@/backend/lib/api-progress';

export type LessonProgress = {
  userId: string;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
};

/**
 * Fetches all lesson_progress records for a user for lessons in a given course.
 *
 * Implements Requirements 9.2, 9.3
 */
export function useLessonProgress(userId: string, courseId: string) {
  return useQuery({
    queryKey: ['lesson-progress', userId, courseId],
    queryFn: async (): Promise<LessonProgress[]> => {
      const data = await getLessonProgressFn({ data: { userId, courseId } });
      return data as unknown as LessonProgress[];
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
      return await markLessonCompleteFn({ data: { userId, lessonId } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lesson-progress'] });
    },
  });
}

