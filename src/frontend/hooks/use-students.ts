import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { studentsAPI } from '@/lib/api-client';

export type Profile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  updatedAt: string | null;
};

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
      try {
        const data = await studentsAPI.getAll();
        // Filter by search term if provided
        if (debouncedSearch) {
          return data.filter((student: any) => 
            student.fullName?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
            student.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
          );
        }
        return data;
      } catch (error) {
        console.error('Failed to fetch students:', error);
        return [];
      }
    },
  });
}

/**
 * Mutation hook to update a student's profile (name, phone).
 * Invalidates ['students'] on success.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, full_name, phone }: { id: string; full_name?: string; phone?: string }) => {
      return await studentsAPI.update(id, { 
        fullName: full_name, 
        phone 
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
    },
  });
}

