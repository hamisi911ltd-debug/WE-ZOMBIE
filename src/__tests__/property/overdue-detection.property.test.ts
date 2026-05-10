// Feature: taco-driving-school
// Property 10: Overdue detection is correct for all date/status combinations
// Validates: Requirements 6.6

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { isOverdue } from '@/backend/lib/payments';
import type { PaymentStatus } from '@/backend/types/domain';

const statusArb = fc.constantFrom<PaymentStatus>('pending', 'paid', 'overdue');

const dateStringArb = fc
  .date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') })
  .map((d) => d.toISOString().split('T')[0]);

describe('Property 10: Overdue detection is correct for all date/status combinations', () => {
  test('returns true iff due_date < now AND status === pending', () => {
    fc.assert(
      fc.property(
        dateStringArb,
        statusArb,
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (dueDateStr, status, now) => {
          const payment = { due_date: dueDateStr, status };
          const result = isOverdue(payment, now);
          const dueDate = new Date(dueDateStr);
          const expected = dueDate < now && status === 'pending';
          return result === expected;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('never returns true for paid payments regardless of date', () => {
    fc.assert(
      fc.property(
        dateStringArb,
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (dueDateStr, now) => {
          return isOverdue({ due_date: dueDateStr, status: 'paid' }, now) === false;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('never returns true for overdue-status payments (only pending triggers it)', () => {
    fc.assert(
      fc.property(
        dateStringArb,
        fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }),
        (dueDateStr, now) => {
          return isOverdue({ due_date: dueDateStr, status: 'overdue' }, now) === false;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('never returns true when due_date is in the future', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2025-01-01'), max: new Date('2030-12-31') }),
        (dueDate) => {
          const pastNow = new Date('2024-01-01');
          const dueDateStr = dueDate.toISOString().split('T')[0];
          return isOverdue({ due_date: dueDateStr, status: 'pending' }, pastNow) === false;
        },
      ),
      { numRuns: 100 },
    );
  });
});
