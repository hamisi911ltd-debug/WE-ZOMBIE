import type { PaymentStatus } from '@/backend/types/domain';

/**
 * Filters a list of payment records to only those belonging to the given user.
 * Requirement 6.4
 */
export function filterPaymentsForUser<T extends { user_id: string }>(
  payments: T[],
  userId: string,
): T[] {
  return payments.filter((payment) => payment.user_id === userId);
}

/**
 * Returns true if the payment is past its due date and still pending.
 * Requirement 6.6
 */
export function isOverdue(
  payment: { due_date: string; status: PaymentStatus },
  now: Date,
): boolean {
  if (payment.status !== 'pending') {
    return false;
  }
  const dueDate = new Date(payment.due_date);
  return dueDate < now;
}

/**
 * Generates a human-readable receipt string for a paid payment.
 * Requirement 6.5
 */
export function generateReceiptContent(
  payment: { id: string; amount: number; due_date: string; created_at: string },
  studentName: string,
): string {
  const paymentDate = new Date(payment.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedAmount = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(payment.amount);

  return [
    '========================================',
    '         TACO DRIVING SCHOOL',
    '              RECEIPT',
    '========================================',
    `Receipt ID:   ${payment.id}`,
    `Student:      ${studentName}`,
    `Payment Date: ${paymentDate}`,
    `Amount:       ${formattedAmount}`,
    '========================================',
    'Thank you for your payment!',
  ].join('\n');
}
