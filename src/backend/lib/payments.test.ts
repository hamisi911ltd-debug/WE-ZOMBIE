import { describe, it, expect } from 'vitest';
import {
  filterPaymentsForUser,
  isOverdue,
  generateReceiptContent,
} from './payments';

// ---------------------------------------------------------------------------
// filterPaymentsForUser
// ---------------------------------------------------------------------------
describe('filterPaymentsForUser', () => {
  const payments = [
    { id: '1', user_id: 'alice', amount: 100 },
    { id: '2', user_id: 'bob', amount: 200 },
    { id: '3', user_id: 'alice', amount: 150 },
  ];

  it('returns only records matching the given userId', () => {
    const result = filterPaymentsForUser(payments, 'alice');
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.user_id === 'alice')).toBe(true);
  });

  it('returns an empty array when no records match', () => {
    expect(filterPaymentsForUser(payments, 'charlie')).toEqual([]);
  });

  it('returns an empty array for an empty input list', () => {
    expect(filterPaymentsForUser([], 'alice')).toEqual([]);
  });

  it('preserves the full record shape (generic)', () => {
    const result = filterPaymentsForUser(payments, 'bob');
    expect(result[0]).toEqual({ id: '2', user_id: 'bob', amount: 200 });
  });
});

// ---------------------------------------------------------------------------
// isOverdue
// ---------------------------------------------------------------------------
describe('isOverdue', () => {
  const now = new Date('2024-06-01');

  it('returns true when due_date is in the past and status is pending', () => {
    expect(isOverdue({ due_date: '2024-05-01', status: 'pending' }, now)).toBe(true);
  });

  it('returns false when due_date is in the future and status is pending', () => {
    expect(isOverdue({ due_date: '2024-07-01', status: 'pending' }, now)).toBe(false);
  });

  it('returns false when due_date is today (not strictly before now)', () => {
    expect(isOverdue({ due_date: '2024-06-01', status: 'pending' }, now)).toBe(false);
  });

  it('returns false when status is paid even if due_date is in the past', () => {
    expect(isOverdue({ due_date: '2024-05-01', status: 'paid' }, now)).toBe(false);
  });

  it('returns false when status is overdue even if due_date is in the past', () => {
    // Already marked overdue — the function only flags pending payments
    expect(isOverdue({ due_date: '2024-05-01', status: 'overdue' }, now)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateReceiptContent
// ---------------------------------------------------------------------------
describe('generateReceiptContent', () => {
  const payment = {
    id: 'pay-001',
    amount: 250,
    due_date: '2024-06-15',
    created_at: '2024-05-20T10:30:00Z',
  };
  const studentName = 'Jane Doe';

  it('contains the student name', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain(studentName);
  });

  it('contains the formatted payment amount', () => {
    const receipt = generateReceiptContent(payment, studentName);
    // Amount should appear in some currency format
    expect(receipt).toContain('250');
  });

  it('contains the payment date derived from created_at', () => {
    const receipt = generateReceiptContent(payment, studentName);
    // The year from created_at should appear
    expect(receipt).toContain('2024');
  });

  it('returns a non-empty string', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(typeof receipt).toBe('string');
    expect(receipt.length).toBeGreaterThan(0);
  });

  it('includes the receipt id', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain('pay-001');
  });
});
