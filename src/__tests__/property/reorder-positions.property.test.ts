// Feature: taco-driving-school
// Property 4: Reorder produces a contiguous, duplicate-free position sequence
// Validates: Requirements 3.8

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { reorderPositions } from '@/backend/lib/position';

describe('Property 4: Reorder produces a contiguous, duplicate-free position sequence', () => {
  // Arbitrary: array of items with positions, plus valid from/to indices
  const reorderArb = fc
    .array(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 20 })
    .chain((ids) => {
      const items = ids.map((id, i) => ({ id, position: i }));
      const indexArb = fc.integer({ min: 0, max: items.length - 1 });
      return fc.tuple(fc.constant(items), indexArb, indexArb);
    });

  test('result has the same number of items as the input', () => {
    fc.assert(
      fc.property(reorderArb, ([items, from, to]) => {
        const result = reorderPositions(items, from, to);
        return result.length === items.length;
      }),
      { numRuns: 100 },
    );
  });

  test('positions form a contiguous sequence starting at 0', () => {
    fc.assert(
      fc.property(reorderArb, ([items, from, to]) => {
        const result = reorderPositions(items, from, to);
        const positions = result.map((i) => i.position).sort((a, b) => a - b);
        return positions.every((p, idx) => p === idx);
      }),
      { numRuns: 100 },
    );
  });

  test('positions are unique (no duplicates)', () => {
    fc.assert(
      fc.property(reorderArb, ([items, from, to]) => {
        const result = reorderPositions(items, from, to);
        const positions = result.map((i) => i.position);
        return new Set(positions).size === positions.length;
      }),
      { numRuns: 100 },
    );
  });

  test('all original item ids are preserved', () => {
    fc.assert(
      fc.property(reorderArb, ([items, from, to]) => {
        const result = reorderPositions(items, from, to);
        const originalIds = new Set(items.map((i) => i.id));
        const resultIds = new Set(result.map((i) => i.id));
        return (
          originalIds.size === resultIds.size &&
          [...originalIds].every((id) => resultIds.has(id))
        );
      }),
      { numRuns: 100 },
    );
  });

  test('does not mutate the original array', () => {
    fc.assert(
      fc.property(reorderArb, ([items, from, to]) => {
        const originalSnapshot = items.map((i) => ({ ...i }));
        reorderPositions(items, from, to);
        return items.every((item, idx) => item.id === originalSnapshot[idx].id);
      }),
      { numRuns: 100 },
    );
  });
});
