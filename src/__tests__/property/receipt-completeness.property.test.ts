// Feature: taco-driving-school
// Property 9: Generated receipt contains all required fields
// Validates: Requirements 6.5

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { generateReceiptContent } from '@/backend/lib/payments';

const paidPaymentArb = fc
  .tuple(
    fc.uuid(),
    fc.float({ min: 1, max: 99999, noNaN: true }),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
    fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
  )
  .map(([id, amount, dueDate, createdAt]) => ({
    id,
    amount: Math.round(amount * 100) / 100,
    due_date: dueDate.toISOString().split('T')[0],
    created_at: createdAt.toISOString(),
    status: 'paid' as const,
  }));

const studentNameArb = fc
  .tuple(
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z]+$/.test(s)),
    fc.string({ minLength: 1, maxLength: 20 }).filter((s) => /^[a-zA-Z]+$/.test(s)),
  )
  .map(([first, last]) => `${first} ${last}`);

describe('Property 9: Generated receipt contains all required fields', () => {
  test('receipt contains the student name', () => {
    fc.assert(
      fc.property(paidPaymentArb, studentNameArb, (payment, studentName) => {
        const receipt = generateReceiptContent(payment, studentName);
        return receipt.includes(studentName);
      }),
      { numRuns: 100 },
    );
  });

  test('receipt contains the payment amount', () => {
    fc.assert(
      fc.property(paidPaymentArb, studentNameArb, (payment, studentName) => {
        const receipt = generateReceiptContent(payment, studentName);
        // generateReceiptContent formats with Intl.NumberFormat (e.g. "$1,000.00")
        // Check that the formatted amount appears in the receipt
        const formatted = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(payment.amount);
        return receipt.includes(formatted);
      }),
      { numRuns: 100 },
    );
  });

  test('receipt contains the payment date (year from created_at)', () => {
    fc.assert(
      fc.property(paidPaymentArb, studentNameArb, (payment, studentName) => {
        const receipt = generateReceiptContent(payment, studentName);
        const year = new Date(payment.created_at).getFullYear().toString();
        return receipt.includes(year);
      }),
      { numRuns: 100 },
    );
  });

  test('receipt is a non-empty string', () => {
    fc.assert(
      fc.property(paidPaymentArb, studentNameArb, (payment, studentName) => {
        const receipt = generateReceiptContent(payment, studentName);
        return typeof receipt === 'string' && receipt.length > 0;
      }),
      { numRuns: 100 },
    );
  });
});
