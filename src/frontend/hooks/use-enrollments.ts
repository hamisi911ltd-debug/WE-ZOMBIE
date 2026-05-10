import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getEnrollmentsFn, createEnrollmentFn, updateEnrollmentFn } from '@/backend/lib/api-enrollments';

export type Enrollment = any; // Define proper type from schema if needed

export function useEnrollments(userId?: string) {
  return useQuery({
    queryKey: ['enrollments', userId],
    queryFn: async () => {
      const data = await getEnrollmentsFn({ userId });
      return data as Enrollment[];
    },
    enabled: true,
  });
}

export function useCreateEnrollment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newEnrollment: any) => {
      const created = await createEnrollmentFn(newEnrollment);
      return created;
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
      const updated = await updateEnrollmentFn(updates);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}
