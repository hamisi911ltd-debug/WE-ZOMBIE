import type { AppRole } from '../types/domain';

export type ScheduleEntry = {
  id: string;
  instructorId: string;
  studentId: string | null;
  scheduledDate: string;
  startTime: string;
  endTime: string;
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
  if (entryA.scheduledDate !== entryB.scheduledDate) {
    return false;
  }

  return entryA.startTime < entryB.endTime && entryB.startTime < entryA.endTime;
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
    return entries.filter((entry) => entry.studentId === userId);
  }

  // instructor
  return entries.filter((entry) => entry.instructorId === userId);
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
    const entryTime = new Date(`${entry.scheduledDate}T${entry.startTime}`);

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
