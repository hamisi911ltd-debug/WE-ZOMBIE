import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enrollmentsAPI } from '@/lib/api-client';

export type Enrollment = any; // Define proper type from schema if needed

export function useEnrollments(userId?: string) {
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => {
      const data = await enrollmentsAPI.getAll();
      return data as Enrollment[];
    },
    enabled: true,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEnrollment: any) => {
      return await enrollmentsAPI.create(newEnrollment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

export function useUpdateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: any) => {
      return await enrollmentsAPI.update(updates.id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}
