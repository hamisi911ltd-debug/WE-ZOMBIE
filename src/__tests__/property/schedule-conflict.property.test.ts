// Feature: taco-driving-school
// Property 11: Schedule conflict detection correctly identifies all overlapping intervals
// Validates: Requirements 7.2

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { hasScheduleConflict } from '@/backend/lib/schedule';

// Generate a time string like "HH:MM"
const timeArb = fc
  .tuple(
    fc.integer({ min: 0, max: 23 }),
    fc.integer({ min: 0, max: 59 }),
  )
  .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

// Generate a valid entry with start < end on a given date
const entryArb = (date: string, id: string) =>
  fc
    .tuple(timeArb, timeArb)
    .filter(([start, end]) => start < end)
    .map(([start_time, end_time]) => ({
      id,
      instructor_id: 'inst-1',
      student_id: null,
      scheduled_date: date,
      start_time,
      end_time,
    }));

const DATE = '2025-06-15';

describe('Property 11: Schedule conflict detection correctly identifies all overlapping intervals', () => {
  test('returns true iff startA < endB && startB < endA (same date)', () => {
    fc.assert(
      fc.property(
        entryArb(DATE, 'a'),
        entryArb(DATE, 'b'),
        (entryA, entryB) => {
          const result = hasScheduleConflict(entryA, entryB);
          const expected =
            entryA.start_time < entryB.end_time &&
            entryB.start_time < entryA.end_time;
          return result === expected;
        },
      ),
      { numRuns: 200 },
    );
  });

  test('always returns false for entries on different dates', () => {
    fc.assert(
      fc.property(
        entryArb('2025-06-15', 'a'),
        entryArb('2025-06-16', 'b'),
        (entryA, entryB) => {
          return hasScheduleConflict(entryA, entryB) === false;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('is symmetric: conflict(A,B) === conflict(B,A)', () => {
    fc.assert(
      fc.property(
        entryArb(DATE, 'a'),
        entryArb(DATE, 'b'),
        (entryA, entryB) => {
          return (
            hasScheduleConflict(entryA, entryB) === hasScheduleConflict(entryB, entryA)
          );
        },
      ),
      { numRuns: 200 },
    );
  });

  test('adjacent intervals (A ends when B starts) do not conflict', () => {
    fc.assert(
      fc.property(
        fc.tuple(timeArb, timeArb).filter(([a, b]) => a < b),
        fc.tuple(timeArb, timeArb).filter(([a, b]) => a < b),
        ([startA, endA], [startB, endB]) => {
          // Force adjacency: endA === startB
          const entryA = {
            id: 'a',
            instructor_id: 'inst',
            student_id: null,
            scheduled_date: DATE,
            start_time: startA,
            end_time: endA,
          };
          const entryB = {
            id: 'b',
            instructor_id: 'inst',
            student_id: null,
            scheduled_date: DATE,
            start_time: endA, // adjacent
            end_time: endB < endA ? endA : endB,
          };
          // Adjacent means no overlap (half-open intervals)
          if (entryB.start_time >= entryB.end_time) return true; // skip invalid
          return hasScheduleConflict(entryA, entryB) === false;
        },
      ),
      { numRuns: 100 },
    );
  });
});
