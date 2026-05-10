import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import { useAuth } from '@/backend/lib/auth-context';
import { filterCoursesForStudent } from '@/backend/lib/course-access';
import type { Tables, TablesInsert, TablesUpdate } from '@/backend/integrations/supabase/types';

export type Course = Tables<'courses'>;

/**
 * Fetches courses based on the current user's role.
 * - Admins see all non-archived courses.
 * - Students see only the courses they are enrolled in.
 *
 * Implements Requirements 3.1, 3.5, 3.6, 5.1
 */
export function useCourses() {
  const { user, hasRole } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');

  return useQuery({
    queryKey: ['courses'],
    queryFn: async (): Promise<Course[]> => {
      // Fetch all non-archived courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      if (!courses) return [];

      // Admins and instructors see all non-archived courses
      if (isAdmin) {
        return courses;
      }

      // Students see only enrolled courses
      if (!user) return [];

      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('user_id, course_id')
        .eq('user_id', user.id);

      if (enrollmentsError) throw enrollmentsError;

      return filterCoursesForStudent(courses, enrollments ?? [], user.id);
    },
    enabled: !!user,
  });
}

/**
 * Mutation hook to create a new course.
 * Invalidates the ['courses'] query on success.
 *
 * Implements Requirement 3.1
 */
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newCourse: TablesInsert<'courses'>) => {
      const { data, error } = await supabase
        .from('courses')
        .insert(newCourse)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation hook to update an existing course by ID.
 * Invalidates the ['courses'] query on success.
 *
 * Implements Requirement 3.5
 */
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<'courses'> & { id: string }) => {
      const { data, error } = await supabase
        .from('courses')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}

/**
 * Mutation hook to archive a course by setting `archived: true`.
 * Invalidates the ['courses'] query on success.
 *
 * Implements Requirement 3.6
 */
export function useArchiveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (courseId: string) => {
      const { data, error } = await supabase
        .from('courses')
        .update({ archived: true })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
  });
}
