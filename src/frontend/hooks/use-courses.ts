import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/backend/lib/auth-context';
import { coursesAPI } from '@/lib/api-client';

export type Course = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
};

export function useCourses() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      return await coursesAPI.getAll();
    },
    enabled: !!user,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCourse: any) => {
      return await coursesAPI.create(newCourse);
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
      return await coursesAPI.update(updates.id, updates);
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
      return await coursesAPI.update(courseId, { archived: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      return await coursesAPI.delete(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

