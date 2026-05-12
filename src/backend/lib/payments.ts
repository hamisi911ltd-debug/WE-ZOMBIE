import type { PaymentStatus } from '@/backend/types/domain';

/**
 * Filters a list of payment records to only those belonging to the given user.
 * Requirement 6.4
 */
export function filterPaymentsForUser<T extends { userId: string }>(
  payments: T[],
  userId: string,
): T[] {
  return payments.filter((payment) => payment.userId === userId);
}

/**
 * Returns true if the payment is past its due date and still pending.
 * Requirement 6.6
 */
export function isOverdue(
  payment: { dueDate: string; status: PaymentStatus },
  now: Date,
): boolean {
  if (payment.status !== 'pending') {
    return false;
  }
  const dueDate = new Date(payment.dueDate);
  return dueDate < now;
}

/**
 * Generates a human-readable receipt string for a paid payment.
 * Requirement 6.5
 */
export function generateReceiptContent(
  payment: { id: string; amount: number; dueDate: string; createdAt: string },
  studentName: string,
): string {
  const paymentDate = new Date(payment.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedAmount = `KES ${(payment.amount / 100).toLocaleString()}`;

  return [
    '========================================',
    '      IMMACURATE DRIVING SCHOOL',
    '              RECEIPT',
    '========================================',
    `Receipt ID:   ${payment.id}`,
    `Student:      ${studentName}`,
    `Payment Date: ${paymentDate}`,
    `Amount:       ${formattedAmount}`,
    '',
    'Juja Arcade, 1st Floor',
    'P.O Box 717-01001 Kalimoni',
    'Phone: 0721 171911',
    'Email: immacuratedriving77@gmail.com',
    '========================================',
    'Thank you for your payment!',
  ].join('\n');
}
