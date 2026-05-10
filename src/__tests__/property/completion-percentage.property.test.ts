// Feature: taco-driving-school
// Property 6: Course completion percentage is mathematically correct and bounded
// Validates: Requirements 5.3, 8.4

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { calculateCompletionPercentage } from '@/backend/lib/completion';

describe('Property 6: Course completion percentage is mathematically correct and bounded', () => {
  test('result is always in the range [0, 100]', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10000 }),
        fc.integer({ min: 0, max: 10000 }),
        (completed, total) => {
          const result = calculateCompletionPercentage(completed, total);
          return result >= 0 && result <= 100;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('result equals Math.round((completed / total) * 100) when 0 <= completed <= total', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 1, max: 1000 }),
        (completed, total) => {
          fc.pre(completed <= total);
          const result = calculateCompletionPercentage(completed, total);
          const expected = Math.round((completed / total) * 100);
          return result === expected;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('returns 0 when total is 0', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 1000 }), (completed) => {
        return calculateCompletionPercentage(completed, 0) === 0;
      }),
      { numRuns: 50 },
    );
  });

  test('returns 100 when completed equals total (for any positive total)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 1000 }), (total) => {
        return calculateCompletionPercentage(total, total) === 100;
      }),
      { numRuns: 50 },
    );
  });

  test('result is always an integer', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (completed, total) => {
          const result = calculateCompletionPercentage(completed, total);
          return Number.isInteger(result);
        },
      ),
      { numRuns: 100 },
    );
  });
});
