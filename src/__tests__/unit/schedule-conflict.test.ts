import { describe, it, expect } from 'vitest';
import { hasScheduleConflict } from '@/backend/lib/schedule';
import type { ScheduleEntry } from '@/backend/lib/schedule';

function makeEntry(overrides: Partial<ScheduleEntry> & { start_time: string; end_time: string }): ScheduleEntry {
  return {
    id: 'entry-1',
    instructor_id: 'inst-1',
    student_id: null,
    scheduled_date: '2024-06-15',
    ...overrides,
  };
}

describe('hasScheduleConflict', () => {
  // Overlapping intervals
  it('detects overlap when B starts during A', () => {
    const a = makeEntry({ start_time: '09:00', end_time: '10:00' });
    const b = makeEntry({ start_time: '09:30', end_time: '10:30' });
    expect(hasScheduleConflict(a, b)).toBe(true);
  });

  it('detects overlap when A starts during B', () => {
    const a = makeEntry({ start_time: '09:30', end_time: '10:30' });
    const b = makeEntry({ start_time: '09:00', end_time: '10:00' });
    expect(hasScheduleConflict(a, b)).toBe(true);
  });

  // Contained interval
  it('detects conflict when B is fully contained within A', () => {
    const a = makeEntry({ start_time: '09:00', end_time: '11:00' });
    const b = makeEntry({ start_time: '09:30', end_time: '10:30' });
    expect(hasScheduleConflict(a, b)).toBe(true);
  });

  it('detects conflict when A is fully contained within B', () => {
    const a = makeEntry({ start_time: '09:30', end_time: '10:30' });
    const b = makeEntry({ start_time: '09:00', end_time: '11:00' });
    expect(hasScheduleConflict(a, b)).toBe(true);
  });

  // Adjacent intervals (no conflict — half-open)
  it('returns false for adjacent intervals (A ends when B starts)', () => {
    const a = makeEntry({ start_time: '09:00', end_time: '10:00' });
    const b = makeEntry({ start_time: '10:00', end_time: '11:00' });
    expect(hasScheduleConflict(a, b)).toBe(false);
  });

  it('returns false for adjacent intervals (B ends when A starts)', () => {
    const a = makeEntry({ start_time: '10:00', end_time: '11:00' });
    const b = makeEntry({ start_time: '09:00', end_time: '10:00' });
    expect(hasScheduleConflict(a, b)).toBe(false);
  });

  // Non-overlapping intervals
  it('returns false when A is entirely before B', () => {
    const a = makeEntry({ start_time: '08:00', end_time: '09:00' });
    const b = makeEntry({ start_time: '10:00', end_time: '11:00' });
    expect(hasScheduleConflict(a, b)).toBe(false);
  });

  it('returns false when A is entirely after B', () => {
    const a = makeEntry({ start_time: '12:00', end_time: '13:00' });
    const b = makeEntry({ start_time: '09:00', end_time: '10:00' });
    expect(hasScheduleConflict(a, b)).toBe(false);
  });

  // Different dates never conflict
  it('returns false when entries are on different dates', () => {
    const a = makeEntry({ scheduled_date: '2024-06-15', start_time: '09:00', end_time: '10:00' });
    const b = makeEntry({ scheduled_date: '2024-06-16', start_time: '09:00', end_time: '10:00' });
    expect(hasScheduleConflict(a, b)).toBe(false);
  });

  // Same entry (exact same times)
  it('detects conflict when an entry is compared with itself', () => {
    const a = makeEntry({ start_time: '09:00', end_time: '10:00' });
    expect(hasScheduleConflict(a, a)).toBe(true);
  });
});
