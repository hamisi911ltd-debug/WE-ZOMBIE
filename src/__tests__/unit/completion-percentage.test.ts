import { describe, it, expect } from 'vitest';
import { calculateCompletionPercentage } from '@/backend/lib/completion';

describe('calculateCompletionPercentage', () => {
  it('returns 0 when total is 0', () => {
    expect(calculateCompletionPercentage(0, 0)).toBe(0);
  });

  it('returns 0 when completed is 0', () => {
    expect(calculateCompletionPercentage(0, 10)).toBe(0);
  });

  it('returns 100 when all lessons are completed', () => {
    expect(calculateCompletionPercentage(10, 10)).toBe(100);
  });

  it('returns 50 for half completion', () => {
    expect(calculateCompletionPercentage(5, 10)).toBe(50);
  });

  it('rounds to nearest integer', () => {
    // 1/3 ≈ 33.33 → rounds to 33
    expect(calculateCompletionPercentage(1, 3)).toBe(33);
    // 2/3 ≈ 66.67 → rounds to 67
    expect(calculateCompletionPercentage(2, 3)).toBe(67);
  });

  it('clamps to 100 when completed exceeds total', () => {
    expect(calculateCompletionPercentage(15, 10)).toBe(100);
  });

  it('clamps to 0 for negative completed', () => {
    expect(calculateCompletionPercentage(-1, 10)).toBe(0);
  });

  it('returns 25 for 1 of 4 completed', () => {
    expect(calculateCompletionPercentage(1, 4)).toBe(25);
  });
});
