// Feature: taco-driving-school
// Property 12: Schedule entries are filtered to the requesting user
// Validates: Requirements 7.3, 7.4

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { filterScheduleForUser } from '@/backend/lib/schedule';
import type { AppRole } from '@/backend/types/domain';

const uuidArb = fc.uuid();

const entryArb = fc
  .tuple(uuidArb, uuidArb, uuidArb)
  .map(([id, instructor_id, student_id]) => ({
    id,
    instructor_id,
    student_id,
    scheduled_date: '2025-06-15',
    start_time: '09:00',
    end_time: '10:00',
  }));

describe('Property 12: Schedule entries are filtered to the requesting user', () => {
  test('admin receives all entries unfiltered', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 0, maxLength: 20 }),
        uuidArb,
        (entries, userId) => {
          const result = filterScheduleForUser(entries, userId, 'admin');
          return result.length === entries.length;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('student receives only entries where student_id matches', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 0, maxLength: 20 }),
        uuidArb,
        (entries, userId) => {
          const result = filterScheduleForUser(entries, userId, 'student');
          return result.every((e) => e.student_id === userId);
        },
      ),
      { numRuns: 100 },
    );
  });

  test('instructor receives only entries where instructor_id matches', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 0, maxLength: 20 }),
        uuidArb,
        (entries, userId) => {
          const result = filterScheduleForUser(entries, userId, 'instructor');
          return result.every((e) => e.instructor_id === userId);
        },
      ),
      { numRuns: 100 },
    );
  });

  test('student result contains all entries that belong to them (no omissions)', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 0, maxLength: 20 }),
        uuidArb,
        (entries, userId) => {
          const result = filterScheduleForUser(entries, userId, 'student');
          const resultIds = new Set(result.map((e) => e.id));
          const ownEntries = entries.filter((e) => e.student_id === userId);
          return ownEntries.every((e) => resultIds.has(e.id));
        },
      ),
      { numRuns: 100 },
    );
  });

  test('instructor result contains all entries assigned to them (no omissions)', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 0, maxLength: 20 }),
        uuidArb,
        (entries, userId) => {
          const result = filterScheduleForUser(entries, userId, 'instructor');
          const resultIds = new Set(result.map((e) => e.id));
          const ownEntries = entries.filter((e) => e.instructor_id === userId);
          return ownEntries.every((e) => resultIds.has(e.id));
        },
      ),
      { numRuns: 100 },
    );
  });
});
