import { describe, it, expect } from 'vitest';
import { generateReceiptContent } from '@/backend/lib/payments';

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

  it('contains the payment ID', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain('pay-001');
  });

  it('contains the formatted amount', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain('250');
  });

  it('contains the year from created_at', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain('2024');
  });

  it('contains the school name', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain('TACO DRIVING SCHOOL');
  });

  it('contains RECEIPT header', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain('RECEIPT');
  });

  it('returns a non-empty string', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(typeof receipt).toBe('string');
    expect(receipt.length).toBeGreaterThan(0);
  });

  it('includes a thank-you message', () => {
    const receipt = generateReceiptContent(payment, studentName);
    expect(receipt).toContain('Thank you');
  });

  it('works with different student names', () => {
    const receipt = generateReceiptContent(payment, 'John Smith');
    expect(receipt).toContain('John Smith');
    expect(receipt).not.toContain('Jane Doe');
  });
});
