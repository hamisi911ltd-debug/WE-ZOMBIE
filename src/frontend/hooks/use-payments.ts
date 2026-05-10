import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPaymentsFn, createPaymentFn, updatePaymentFn, deletePaymentFn } from '@/backend/lib/api-payments';
import { useAuth } from '@/backend/lib/auth-context';

export type Payment = any;

/**
 * Fetches payments based on the current user's role.
 * - Admins fetch all payments.
 * - Students fetch only their own payments via filterPaymentsForUser.
 *
 * Implements Requirements 6.1, 6.3, 6.4
 */
export function usePayments(userId?: string) {
  const { user } = useAuth();
  const effectiveUserId = userId ?? user?.id;

  return useQuery({
    queryKey: ['payments', effectiveUserId],
    queryFn: async (): Promise<Payment[]> => {
      const data = await getPaymentsFn({ userId: effectiveUserId });
      return data as Payment[];
    },
    enabled: !!effectiveUserId,
  });
}

/**
 * Mutation hook to create a new payment record.
 * Invalidates ['payments'] on success.
 *
 * Implements Requirement 6.1
 */
export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPayment: any) => {
      const created = await createPaymentFn(newPayment);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

/**
 * Mutation hook to update an existing payment by ID.
 * Invalidates ['payments'] on success.
 *
 * Implements Requirement 6.3
 */
export function useUpdatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: any) => {
      const updated = await updatePaymentFn(updates);
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}

/**
 * Mutation hook to delete a payment by ID.
 * Invalidates ['payments'] on success.
 */
export function useDeletePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deletePaymentFn(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}
