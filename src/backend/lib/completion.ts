/**
 * Calculates the course completion percentage.
 * Returns Math.round((completed / total) * 100), clamped to [0, 100].
 * Returns 0 when total === 0.
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0;
  const raw = Math.round((completed / total) * 100);
  return Math.min(100, Math.max(0, raw));
}
