import { describe, it, expect } from 'vitest';
import { getNextLesson } from '@/backend/lib/schedule';
import type { ScheduleEntry } from '@/backend/lib/schedule';

function makeEntry(id: string, date: string, startTime: string, endTime: string): ScheduleEntry {
  return {
    id,
    instructor_id: 'inst-1',
    student_id: 'student-1',
    scheduled_date: date,
    start_time: startTime,
    end_time: endTime,
  };
}

describe('getNextLesson', () => {
  const now = new Date('2024-06-15T10:00:00');

  it('returns null for an empty list', () => {
    expect(getNextLesson([], now)).toBeNull();
  });

  it('returns null when all entries are in the past', () => {
    const entries = [
      makeEntry('1', '2024-06-14', '09:00', '10:00'),
      makeEntry('2', '2024-06-15', '08:00', '09:00'),
    ];
    expect(getNextLesson(entries, now)).toBeNull();
  });

  it('returns null when an entry starts exactly at now (not strictly after)', () => {
    const entries = [makeEntry('1', '2024-06-15', '10:00', '11:00')];
    expect(getNextLesson(entries, now)).toBeNull();
  });

  it('returns the single future entry', () => {
    const entries = [makeEntry('1', '2024-06-15', '11:00', '12:00')];
    expect(getNextLesson(entries, now)).toEqual(entries[0]);
  });

  it('returns the earliest future entry from multiple', () => {
    const entries = [
      makeEntry('later', '2024-06-15', '14:00', '15:00'),
      makeEntry('next', '2024-06-15', '11:00', '12:00'),
      makeEntry('soon', '2024-06-15', '12:00', '13:00'),
    ];
    const result = getNextLesson(entries, now);
    expect(result?.id).toBe('next');
  });

  it('returns the entry on the next day when today has no future entries', () => {
    const entries = [
      makeEntry('past', '2024-06-15', '09:00', '10:00'),
      makeEntry('tomorrow', '2024-06-16', '09:00', '10:00'),
    ];
    const result = getNextLesson(entries, now);
    expect(result?.id).toBe('tomorrow');
  });

  it('picks the earliest across multiple days', () => {
    const entries = [
      makeEntry('day3', '2024-06-18', '09:00', '10:00'),
      makeEntry('day1', '2024-06-16', '09:00', '10:00'),
      makeEntry('day2', '2024-06-17', '09:00', '10:00'),
    ];
    const result = getNextLesson(entries, now);
    expect(result?.id).toBe('day1');
  });
});
