// Feature: taco-driving-school
// Property 8: Students only see their own payment records
// Validates: Requirements 6.4

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { filterPaymentsForUser } from '@/backend/lib/payments';

const uuidArb = fc.uuid();

const paymentArb = fc
  .tuple(uuidArb, uuidArb, fc.float({ min: 1, max: 9999, noNaN: true }))
  .map(([id, user_id, amount]) => ({
    id,
    user_id,
    amount,
    due_date: '2025-01-01',
    status: 'pending' as const,
    created_at: '2025-01-01T00:00:00Z',
    updated_at: '2025-01-01T00:00:00Z',
    proof_url: null,
  }));

describe('Property 8: Students only see their own payment records', () => {
  test('filterPaymentsForUser returns only records matching the given userId', () => {
    fc.assert(
      fc.property(
        fc.array(paymentArb, { minLength: 0, maxLength: 30 }),
        uuidArb,
        (payments, userId) => {
          const result = filterPaymentsForUser(payments, userId);
          return result.every((p) => p.user_id === userId);
        },
      ),
      { numRuns: 100 },
    );
  });

  test('no payment belonging to another user is included', () => {
    fc.assert(
      fc.property(
        fc.array(paymentArb, { minLength: 0, maxLength: 30 }),
        uuidArb,
        (payments, userId) => {
          const result = filterPaymentsForUser(payments, userId);
          const resultIds = new Set(result.map((p) => p.id));
          // Payments from other users must not appear
          const otherUserPayments = payments.filter((p) => p.user_id !== userId);
          return otherUserPayments.every((p) => !resultIds.has(p.id));
        },
      ),
      { numRuns: 100 },
    );
  });

  test('all own payments are included (no omissions)', () => {
    fc.assert(
      fc.property(
        fc.array(paymentArb, { minLength: 0, maxLength: 30 }),
        uuidArb,
        (payments, userId) => {
          const result = filterPaymentsForUser(payments, userId);
          const resultIds = new Set(result.map((p) => p.id));
          const ownPayments = payments.filter((p) => p.user_id === userId);
          return ownPayments.every((p) => resultIds.has(p.id));
        },
      ),
      { numRuns: 100 },
    );
  });
});
