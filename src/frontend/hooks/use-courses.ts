import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/backend/lib/auth-context';
import { getCoursesFn, createCourseFn, updateCourseFn, archiveCourseFn } from '@/backend/lib/api-courses';

export type Course = any; // You can refine this with the schema type

export function useCourses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      return await getCoursesFn();
    },
    enabled: !!user,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCourse: any) => {
      return await createCourseFn({ data: newCourse });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: any) => {
      return await updateCourseFn({ data: updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      return await archiveCourseFn({ data: courseId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
