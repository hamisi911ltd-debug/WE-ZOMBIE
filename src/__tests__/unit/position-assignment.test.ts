import { describe, it, expect } from 'vitest';
import { getNextPosition, reorderPositions } from '@/backend/lib/position';

describe('getNextPosition', () => {
  it('returns 0 for an empty list', () => {
    expect(getNextPosition([])).toBe(0);
  });

  it('returns max + 1 for a single-element list', () => {
    expect(getNextPosition([5])).toBe(6);
  });

  it('returns max + 1 for a multi-element list', () => {
    expect(getNextPosition([0, 1, 2, 3])).toBe(4);
  });

  it('handles non-contiguous positions', () => {
    expect(getNextPosition([0, 5, 10])).toBe(11);
  });

  it('handles a list with a single zero', () => {
    expect(getNextPosition([0])).toBe(1);
  });
});

describe('reorderPositions', () => {
  const items = [
    { id: 'a', position: 0 },
    { id: 'b', position: 1 },
    { id: 'c', position: 2 },
    { id: 'd', position: 3 },
  ];

  it('moves an item forward and reassigns contiguous positions', () => {
    const result = reorderPositions(items, 0, 2);
    expect(result.map((i) => i.id)).toEqual(['b', 'c', 'a', 'd']);
    expect(result.map((i) => i.position)).toEqual([0, 1, 2, 3]);
  });

  it('moves an item backward and reassigns contiguous positions', () => {
    const result = reorderPositions(items, 3, 1);
    expect(result.map((i) => i.id)).toEqual(['a', 'd', 'b', 'c']);
    expect(result.map((i) => i.position)).toEqual([0, 1, 2, 3]);
  });

  it('does not mutate the original array', () => {
    const original = [...items];
    reorderPositions(items, 0, 2);
    expect(items).toEqual(original);
  });

  it('handles moving to the same index (no-op)', () => {
    const result = reorderPositions(items, 1, 1);
    expect(result.map((i) => i.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(result.map((i) => i.position)).toEqual([0, 1, 2, 3]);
  });

  it('works with a single-item list', () => {
    const single = [{ id: 'x', position: 0 }];
    const result = reorderPositions(single, 0, 0);
    expect(result).toEqual([{ id: 'x', position: 0 }]);
  });
});
