// Feature: taco-driving-school
// Property 13: Next lesson calculation returns the nearest future entry
// Validates: Requirements 8.3

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { getNextLesson } from '@/backend/lib/schedule';

const uuidArb = fc.uuid();

// Generate a time string "HH:MM"
const timeArb = fc
  .tuple(fc.integer({ min: 0, max: 23 }), fc.integer({ min: 0, max: 59 }))
  .map(([h, m]) => `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

// Generate a date string "YYYY-MM-DD" between 2024 and 2027
const dateArb = fc
  .date({ min: new Date('2024-01-01'), max: new Date('2027-12-31') })
  .map((d) => d.toISOString().split('T')[0]);

const entryArb = fc
  .tuple(uuidArb, dateArb, timeArb, timeArb)
  .filter(([, , start, end]) => start < end)
  .map(([id, scheduled_date, start_time, end_time]) => ({
    id,
    instructor_id: 'inst-1',
    student_id: null,
    scheduled_date,
    start_time,
    end_time,
  }));

describe('Property 13: Next lesson calculation returns the nearest future entry', () => {
  test('returns null for an empty list', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2027-12-31') }),
        (now) => {
          return getNextLesson([], now) === null;
        },
      ),
      { numRuns: 50 },
    );
  });

  test('returned entry is always strictly in the future', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 1, maxLength: 20 }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2027-12-31') }),
        (entries, now) => {
          const result = getNextLesson(entries, now);
          if (result === null) return true; // no future entries — valid
          const entryTime = new Date(`${result.scheduled_date}T${result.start_time}`);
          return entryTime > now;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('returned entry has the smallest future start time', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 1, maxLength: 20 }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2027-12-31') }),
        (entries, now) => {
          const result = getNextLesson(entries, now);
          if (result === null) return true;

          const resultTime = new Date(`${result.scheduled_date}T${result.start_time}`);

          // No other future entry should have an earlier start time
          const futureEntries = entries.filter(
            (e) => new Date(`${e.scheduled_date}T${e.start_time}`) > now,
          );
          return futureEntries.every((e) => {
            const t = new Date(`${e.scheduled_date}T${e.start_time}`);
            return t >= resultTime;
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  test('returns null when all entries are in the past', () => {
    fc.assert(
      fc.property(
        fc.array(entryArb, { minLength: 1, maxLength: 10 }),
        (entries) => {
          // Use a "now" far in the future so all entries are past
          const farFuture = new Date('2028-01-01');
          return getNextLesson(entries, farFuture) === null;
        },
      ),
      { numRuns: 100 },
    );
  });
});
