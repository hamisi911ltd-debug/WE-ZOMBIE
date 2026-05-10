// Feature: taco-driving-school
// Property 3: New item position is always one greater than the current maximum
// Validates: Requirements 3.2, 3.3

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { getNextPosition } from '@/backend/lib/position';

describe('Property 3: New item position is always one greater than the current maximum', () => {
  test('returns 0 for an empty list', () => {
    fc.assert(
      fc.property(fc.constant([]), (positions: number[]) => {
        return getNextPosition(positions) === 0;
      }),
      { numRuns: 10 },
    );
  });

  test('returns max + 1 for any non-empty list of non-negative integers', () => {
    const nonEmptyPositionsArb = fc.array(
      fc.integer({ min: 0, max: 1000 }),
      { minLength: 1, maxLength: 50 },
    );

    fc.assert(
      fc.property(nonEmptyPositionsArb, (positions) => {
        const expected = Math.max(...positions) + 1;
        return getNextPosition(positions) === expected;
      }),
      { numRuns: 100 },
    );
  });

  test('result is always strictly greater than every existing position', () => {
    const nonEmptyPositionsArb = fc.array(
      fc.integer({ min: 0, max: 1000 }),
      { minLength: 1, maxLength: 50 },
    );

    fc.assert(
      fc.property(nonEmptyPositionsArb, (positions) => {
        const next = getNextPosition(positions);
        return positions.every((p) => next > p);
      }),
      { numRuns: 100 },
    );
  });
});
