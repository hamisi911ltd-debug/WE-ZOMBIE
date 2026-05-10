// src/types/domain.ts
export type PaymentStatus = 'pending' | 'paid' | 'overdue';
export type EnrollmentStatus = 'active' | 'completed' | 'withdrawn';
export type LessonType = 'theory' | 'practical';
export type LessonContentType = 'text' | 'video' | 'pdf';
export type AppRole = 'admin' | 'instructor' | 'student';

export interface CompletionStats {
  completedLessons: number;
  totalLessons: number;
  percentage: number;
}

export interface ScheduleConflict {
  conflictingEntryId: string;
  instructorId: string;
  date: string;
  startTime: string;
  endTime: string;
}
