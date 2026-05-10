/**
 * Returns the next available position value for a new item.
 * For a non-empty list, returns max(existingPositions) + 1.
 * For an empty list, returns 0.
 */
export function getNextPosition(existingPositions: number[]): number {
  if (existingPositions.length === 0) {
    return 0;
  }
  return Math.max(...existingPositions) + 1;
}

/**
 * Moves the item at `fromIndex` to `toIndex` in the array, then reassigns
 * contiguous `position` values (0, 1, 2, …) based on the new order.
 *
 * - Does not mutate the input array.
 * - Returns new item objects with the updated `position` field.
 */
export function reorderPositions<T extends { position: number }>(
  items: T[],
  fromIndex: number,
  toIndex: number
): T[] {
  // Work on a shallow copy to avoid mutating the original
  const reordered = [...items];

  // Remove the item from its current position and insert at the target
  const [moved] = reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);

  // Reassign contiguous position values starting at 0
  return reordered.map((item, index) => ({ ...item, position: index }));
}
