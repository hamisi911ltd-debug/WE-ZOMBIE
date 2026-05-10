import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getLessonsFn, createLessonFn, updateLessonFn, reorderLessonsFn } from '@/backend/lib/api-lessons';

export type Lesson = {
  id: string;
  moduleId: string;
  title: string;
  body: string | null;
  lessonType: string;
  contentType: string;
  contentUrl: string | null;
  position: number;
  updatedAt: string | null;
};

/**
 * Fetches lessons for a given module, ordered by position ascending.
 *
 * Implements Requirements 3.2, 3.3
 */
export function useLessons(moduleId: string) {
  return useQuery({
    queryKey: ['lessons', moduleId],
    queryFn: async (): Promise<Lesson[]> => {
      const data = await getLessonsFn({ data: moduleId });
      return data as unknown as Lesson[];
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
    mutationFn: async (newLesson: any) => {
      return await createLessonFn({ data: newLesson });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', data.moduleId] });
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
    mutationFn: async ({ id, ...updates }: any) => {
      return await updateLessonFn({ data: { id, ...updates } });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', data.moduleId] });
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
      return await reorderLessonsFn({ data: { moduleId, items } });
    },
    onSuccess: (_, { moduleId }) => {
      queryClient.invalidateQueries({ queryKey: ['lessons', moduleId] });
    },
  });
}

