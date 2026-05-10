// src/lib/upload-button-context.ts

export type UploadButtonContext = 'students' | 'payments' | 'courses' | 'schedule' | 'default';

export const CONTEXT_LABELS: Record<UploadButtonContext, string> = {
  students: 'Enroll Student',
  payments: 'New Payment',
  courses: 'Add New Course',
  schedule: 'Add Schedule Entry',
  default: 'Add Item',
};

/**
 * Returns the context key for the Universal Upload Button based on the current pathname.
 * Used to determine which dialog to open when the button is activated.
 */
export function getUploadButtonContextKey(pathname: string): UploadButtonContext {
  if (pathname.startsWith('/students')) return 'students';
  if (pathname.startsWith('/payments')) return 'payments';
  if (pathname.startsWith('/courses')) return 'courses';
  if (pathname.startsWith('/schedule')) return 'schedule';
  return 'default';
}

/**
 * Returns the action label for the Universal Upload Button based on the current pathname.
 * Maps each route section to its context-appropriate action label per Requirements 2.2–2.5.
 */
export function getUploadButtonContext(pathname: string): string {
  return CONTEXT_LABELS[getUploadButtonContextKey(pathname)];
}
