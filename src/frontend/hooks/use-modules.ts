import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getModulesFn, createModuleFn, updateModuleFn, reorderModulesFn } from '@/backend/lib/api-modules';

export type Module = {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  position: number;
  updatedAt: string | null;
};

/**
 * Fetches modules for a given course, ordered by position ascending.
 *
 * Implements Requirements 3.2, 3.3
 */
export function useModules(courseId: string) {
  return useQuery({
    queryKey: ['modules', courseId],
    queryFn: async (): Promise<Module[]> => {
      const data = await getModulesFn({ data: courseId });
      return data as unknown as Module[];
    },
    enabled: !!courseId,
  });
}

/**
 * Mutation hook to create a new module.
 * Invalidates ['modules', courseId] on success.
 *
 * Implements Requirement 3.2
 */
export function useCreateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newModule: any) => {
      return await createModuleFn({ data: newModule });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.courseId] });
    },
  });
}

/**
 * Mutation hook to update an existing module by ID.
 * Invalidates ['modules', courseId] on success.
 *
 * Implements Requirement 3.3
 */
export function useUpdateModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      return await updateModuleFn({ data: { id, ...updates } });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['modules', data.courseId] });
    },
  });
}

type ReorderModulesInput = {
  courseId: string;
  items: Array<{ id: string; position: number }>;
};

/**
 * Mutation hook to reorder modules by batch-updating their positions.
 * Invalidates ['modules', courseId] on success.
 *
 * Implements Requirement 3.3
 */
export function useReorderModules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, items }: ReorderModulesInput) => {
      return await reorderModulesFn({ data: { courseId, items } });
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['modules', courseId] });
    },
  });
}

