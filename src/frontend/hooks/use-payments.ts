import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/backend/integrations/supabase/client';
import { useAuth } from '@/backend/lib/auth-context';
import { filterPaymentsForUser } from '@/backend/lib/payments';
import type { Tables, TablesInsert, TablesUpdate } from '@/backend/integrations/supabase/types';

export type Payment = Tables<'payments'>;

/**
 * Fetches payments based on the current user's role.
 * - Admins fetch all payments.
 * - Students fetch only their own payments via filterPaymentsForUser.
 *
 * Implements Requirements 6.1, 6.3, 6.4
 */
export function usePayments(userId?: string) {
  const { hasRole, user } = useAuth();
  const isAdmin = hasRole('admin') || hasRole('instructor');

  return useQuery({
    queryKey: ['payments', userId],
    queryFn: async (): Promise<Payment[]> => {
      const { data, error } = await supabase.from('payments').select('*');

      if (error) throw error;
      const payments = data ?? [];

      // Admins see all payments
      if (isAdmin) {
        return payments;
      }

      // Students see only their own payments
      const effectiveUserId = userId ?? user?.id;
      if (!effectiveUserId) return [];

      return filterPaymentsForUser(payments, effectiveUserId);
    },
    enabled: !!user,
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
    mutationFn: async (newPayment: TablesInsert<'payments'>) => {
      const { data, error } = await supabase
        .from('payments')
        .insert(newPayment)
        .select()
        .single();

      if (error) throw error;
      return data;
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
    mutationFn: async ({ id, ...updates }: TablesUpdate<'payments'> & { id: string }) => {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
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
      const { error } = await supabase.from('payments').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    },
  });
}
