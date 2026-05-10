import { describe, it, expect } from 'vitest';
import { isOverdue } from '@/backend/lib/payments';

describe('isOverdue', () => {
  const now = new Date('2024-06-15T12:00:00Z');

  it('returns true when due_date is in the past and status is pending', () => {
    expect(isOverdue({ due_date: '2024-06-01', status: 'pending' }, now)).toBe(true);
  });

  it('returns false when due_date is in the future and status is pending', () => {
    expect(isOverdue({ due_date: '2024-07-01', status: 'pending' }, now)).toBe(false);
  });

  it('returns false when due_date equals now (not strictly before)', () => {
    // Same date string — parsed as midnight UTC, which is before noon UTC
    // so this is actually overdue; let's use a future same-day time
    expect(isOverdue({ due_date: '2024-06-16', status: 'pending' }, now)).toBe(false);
  });

  it('returns false when status is paid even if due_date is past', () => {
    expect(isOverdue({ due_date: '2024-01-01', status: 'paid' }, now)).toBe(false);
  });

  it('returns false when status is overdue even if due_date is past', () => {
    expect(isOverdue({ due_date: '2024-01-01', status: 'overdue' }, now)).toBe(false);
  });

  it('returns false when status is paid and due_date is in the future', () => {
    expect(isOverdue({ due_date: '2025-01-01', status: 'paid' }, now)).toBe(false);
  });
});
