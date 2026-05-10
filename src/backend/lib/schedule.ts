import type { AppRole } from '../types/domain';

export type ScheduleEntry = {
  id: string;
  instructor_id: string;
  student_id: string | null;
  scheduled_date: string;
  start_time: string;
  end_time: string;
};

/**
 * Determines whether two schedule entries have a time conflict.
 *
 * Uses half-open interval overlap: startA < endB && startB < endA.
 * Entries on different dates can never conflict.
 *
 * Requirements: 7.2
 */
export function hasScheduleConflict(entryA: ScheduleEntry, entryB: ScheduleEntry): boolean {
  if (entryA.scheduled_date !== entryB.scheduled_date) {
    return false;
  }

  return entryA.start_time < entryB.end_time && entryB.start_time < entryA.end_time;
}

/**
 * Filters schedule entries based on the user's role.
 *
 * - 'admin'      → all entries
 * - 'student'    → entries where student_id matches userId
 * - 'instructor' → entries where instructor_id matches userId
 *
 * Requirements: 7.3, 7.4
 */
export function filterScheduleForUser(
  entries: ScheduleEntry[],
  userId: string,
  role: AppRole,
): ScheduleEntry[] {
  if (role === 'admin') {
    return entries;
  }

  if (role === 'student') {
    return entries.filter((entry) => entry.student_id === userId);
  }

  // instructor
  return entries.filter((entry) => entry.instructor_id === userId);
}

/**
 * Returns the next upcoming lesson strictly after `now`, or null if none exist.
 *
 * Combines scheduled_date and start_time into a datetime for comparison.
 *
 * Requirements: 8.3
 */
export function getNextLesson(entries: ScheduleEntry[], now: Date): ScheduleEntry | null {
  let nextEntry: ScheduleEntry | null = null;
  let nextTime: Date | null = null;

  for (const entry of entries) {
    const entryTime = new Date(`${entry.scheduled_date}T${entry.start_time}`);

    if (entryTime <= now) {
      continue;
    }

    if (nextTime === null || entryTime < nextTime) {
      nextEntry = entry;
      nextTime = entryTime;
    }
  }

  return nextEntry;
}
