import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/backend/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

type UpdateProfileInput = {
  userId: string;
  updates: TablesUpdate<'profiles'>;
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
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // PGRST116 = no rows found — return null instead of throwing
        if (error.code === 'PGRST116') return null;
        throw error;
      }

      return data;
    },
    enabled: !!userId,
  });
}

/**
 * Mutation hook to update a profile record.
 * If an avatarFile is provided, uploads it to the 'avatars' storage bucket
 * and sets avatar_url on the profile.
 * Invalidates ['profile', userId] on success.
 *
 * Implements Requirements 4.3, 4.5
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, updates, avatarFile }: UpdateProfileInput) => {
      let avatarUrl: string | undefined;

      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `${userId}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        avatarUrl = publicUrlData.publicUrl;
      }

      const profileUpdates: TablesUpdate<'profiles'> = {
        ...updates,
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });
    },
  });
}
