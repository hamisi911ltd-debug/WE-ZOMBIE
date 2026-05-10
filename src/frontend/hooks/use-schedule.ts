import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/backend/lib/auth-context';
import { filterScheduleForUser } from '@/backend/lib/schedule';
import type { AppRole } from '@/backend/types/domain';
import { getScheduleFn, createScheduleFn, updateScheduleFn, deleteScheduleFn } from '@/backend/lib/api-schedule';

export type ScheduleEntry = {
  id: string;
  instructorId: string;
  studentId: string | null;
  moduleId: string | null;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  createdAt: string;
};

/**
 * Fetches schedule entries scoped by the user's role.
 * Falls back to useAuth() if userId/role are not provided.
 *
 * Implements Requirements 7.1, 7.3, 7.4, 7.5
 */
export function useScheduleEntries(userId?: string, role?: AppRole) {
  const { user, roles } = useAuth();

  const effectiveUserId = userId ?? user?.id;
  const effectiveRole = role ?? (roles[0] as AppRole | undefined);

  return useQuery({
    queryKey: ['schedule-entries', effectiveUserId, effectiveRole],
    queryFn: async (): Promise<ScheduleEntry[]> => {
      const entries = await getScheduleFn({ query: { userId: effectiveUserId } });

      if (!effectiveUserId || !effectiveRole) {
        return entries as unknown as ScheduleEntry[];
      }

      return filterScheduleForUser(entries as any, effectiveUserId, effectiveRole) as unknown as ScheduleEntry[];
    },
    enabled: !!effectiveUserId,
  });
}

/**
 * Mutation hook to create a new schedule entry.
 * Invalidates ['schedule-entries'] on success.
 *
 * Implements Requirement 7.1
 */
export function useCreateScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newEntry: any) => {
      return await createScheduleFn({ data: newEntry });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-entries'] });
    },
  });
}

/**
 * Mutation hook to update an existing schedule entry by ID.
 * Invalidates ['schedule-entries'] on success.
 *
 * Implements Requirement 7.5
 */
export function useUpdateScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      return await updateScheduleFn({ id, updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-entries'] });
    },
  });
}

/**
 * Mutation hook to delete a schedule entry by ID.
 * Invalidates ['schedule-entries'] on success.
 *
 * Implements Requirement 7.5
 */
export function useDeleteScheduleEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteScheduleFn({ id });
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-entries'] });
    },
  });
}

