import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsAPI } from '@/lib/api-client';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        return await studentsAPI.getAll();
      } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
      }
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; role: string; action: 'add' | 'remove' }) => {
      // This would need a proper API endpoint for user role management
      console.log('Update user role:', data);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return await studentsAPI.delete(userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
