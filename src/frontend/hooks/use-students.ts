import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import type { Tables } from '@/backend/integrations/supabase/types';

export type Profile = Tables<'profiles'>;

type StudentFilter = {
  courseId?: string;
  status?: string;
};

/**
 * Fetches student profiles with optional search and filtering.
 * Debounces the search term by 300ms.
 * Filters by enrolled course or enrollment status if provided.
 *
 * Implements Requirements 4.3, 4.5, 4.6
 */
export function useStudents(search?: string, filter?: StudentFilter) {
  const [debouncedSearch, setDebouncedSearch] = useState(search ?? '');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search ?? '');
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  return useQuery({
    queryKey: ['students', debouncedSearch, filter],
    queryFn: async (): Promise<Profile[]> => {
      const needsEnrollmentJoin = !!(filter?.courseId || filter?.status);

      if (needsEnrollmentJoin) {
        // Build enrollment filter to get matching user IDs
        let enrollmentQuery = supabase
          .from('enrollments')
          .select('user_id');

        if (filter?.courseId) {
          enrollmentQuery = enrollmentQuery.eq('course_id', filter.courseId);
        }

        if (filter?.status) {
          enrollmentQuery = enrollmentQuery.eq('status', filter.status);
        }

        const { data: enrollments, error: enrollmentError } = await enrollmentQuery;
        if (enrollmentError) throw enrollmentError;

        const userIds = (enrollments ?? []).map((e) => e.user_id);

        if (userIds.length === 0) {
          return [];
        }

        // Fetch profiles for those user IDs, scoped to students via user_roles
        const { data: studentRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('user_id')
          .eq('role', 'student')
          .in('user_id', userIds);

        if (rolesError) throw rolesError;

        const studentUserIds = (studentRoles ?? []).map((r) => r.user_id);

        if (studentUserIds.length === 0) {
          return [];
        }

        let profileQuery = supabase
          .from('profiles')
          .select('*')
          .in('id', studentUserIds);

        if (debouncedSearch) {
          profileQuery = profileQuery.ilike('full_name', `%${debouncedSearch}%`);
        }

        const { data: profiles, error: profilesError } = await profileQuery;
        if (profilesError) throw profilesError;

        return profiles ?? [];
      }

      // No enrollment filter — fetch all student profiles via user_roles
      const { data: studentRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'student');

      if (rolesError) throw rolesError;

      const studentUserIds = (studentRoles ?? []).map((r) => r.user_id);

      if (studentUserIds.length === 0) {
        return [];
      }

      let profileQuery = supabase
        .from('profiles')
        .select('*')
        .in('id', studentUserIds);

      if (debouncedSearch) {
        profileQuery = profileQuery.ilike('full_name', `%${debouncedSearch}%`);
      }

      const { data: profiles, error: profilesError } = await profileQuery;
      if (profilesError) throw profilesError;

      return profiles ?? [];
    },
  });
}

import { useMutation, useQueryClient } from '@tanstack/react-query';

/**
 * Mutation hook to update a student's profile (name, phone).
 * Invalidates ['students'] on success.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, full_name, phone }: { id: string; full_name?: string; phone?: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ full_name, phone })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}
