// Feature: taco-driving-school
// Property 2: Universal Upload Button default action matches current route
// Validates: Requirements 2.2, 2.3, 2.4, 2.5

import { describe, test, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  getUploadButtonContext,
  getUploadButtonContextKey,
  CONTEXT_LABELS,
} from '@/backend/lib/upload-button-context';

describe('Property 2: Universal Upload Button default action matches current route', () => {
  test('returns the correct label for each known route section', () => {
    const routeSectionMap: Array<[string, string]> = [
      ['/students', 'Enroll Student'],
      ['/students/some-id', 'Enroll Student'],
      ['/payments', 'New Payment'],
      ['/payments/123', 'New Payment'],
      ['/courses', 'Add New Course'],
      ['/courses/abc/modules/xyz', 'Add New Course'],
      ['/schedule', 'Add Schedule Entry'],
      ['/schedule/entry/1', 'Add Schedule Entry'],
    ];

    fc.assert(
      fc.property(fc.constantFrom(...routeSectionMap), ([pathname, expectedLabel]) => {
        return getUploadButtonContext(pathname) === expectedLabel;
      }),
      { numRuns: 100 },
    );
  });

  test('distinct route sections produce distinct action labels', () => {
    const sections = ['students', 'payments', 'courses', 'schedule'] as const;
    const labels = sections.map((s) => CONTEXT_LABELS[s]);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(sections.length);
  });

  test('unknown routes return the default label', () => {
    const unknownRouteArb = fc
      .string({ minLength: 1 })
      .filter(
        (s) =>
          s.startsWith('/') &&
          !s.startsWith('/students') &&
          !s.startsWith('/payments') &&
          !s.startsWith('/courses') &&
          !s.startsWith('/schedule'),
      );

    fc.assert(
      fc.property(unknownRouteArb, (pathname) => {
        return getUploadButtonContextKey(pathname) === 'default';
      }),
      { numRuns: 100 },
    );
  });

  test('getUploadButtonContext always returns a non-empty string', () => {
    const pathArb = fc.string({ minLength: 1 }).filter((s) => s.startsWith('/'));

    fc.assert(
      fc.property(pathArb, (pathname) => {
        const label = getUploadButtonContext(pathname);
        return typeof label === 'string' && label.length > 0;
      }),
      { numRuns: 100 },
    );
  });
});
