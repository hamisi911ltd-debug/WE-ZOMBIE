import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfileFn, updateProfileFn } from '@/backend/lib/api-profile';

export type Profile = {
  id: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

type UpdateProfileInput = {
  userId: string;
  updates: Partial<Profile>;
  avatarFile?: File;
};

/**
 * Fetches the profile record for the given userId.
 *
 * Implements Requirements 4.3, 4.5
 */
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async (): Promise<Profile | null> => {
      const data = await getProfileFn({ data: userId });
      return data as unknown as Profile;
    },
    enabled: !!userId,
  });
}

/**
 * Mutation hook to update a profile record.
 * Invalidates ['profile', userId] on success.
 *
 * Implements Requirements 4.3, 4.5
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates, avatarFile }: UpdateProfileInput) => {
      // Note: avatarFile handling should be moved to a separate upload function if needed
      // For now, we'll just send the updates
      const res = await updateProfileFn({ data: { id: userId, ...updates } });
      return res;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
