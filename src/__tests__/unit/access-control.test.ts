import { describe, it, expect } from 'vitest';
import { canAccess, ROUTE_PERMISSIONS } from '@/backend/lib/access-control';
import type { AppRole } from '@/backend/types/domain';

describe('canAccess', () => {
  // Static routes accessible by all roles
  const allRolesRoutes = ['/dashboard', '/courses', '/payments', '/schedule'];

  for (const route of allRolesRoutes) {
    it(`allows admin to access ${route}`, () => {
      expect(canAccess(route, 'admin')).toBe(true);
    });
    it(`allows instructor to access ${route}`, () => {
      expect(canAccess(route, 'instructor')).toBe(true);
    });
    it(`allows student to access ${route}`, () => {
      expect(canAccess(route, 'student')).toBe(true);
    });
  }

  // /students is admin-only
  it('allows admin to access /students', () => {
    expect(canAccess('/students', 'admin')).toBe(true);
  });
  it('denies instructor access to /students', () => {
    expect(canAccess('/students', 'instructor')).toBe(false);
  });
  it('denies student access to /students', () => {
    expect(canAccess('/students', 'student')).toBe(false);
  });

  // Dynamic route: /courses/$courseId
  it('allows admin to access /courses/abc-123', () => {
    expect(canAccess('/courses/abc-123', 'admin')).toBe(true);
  });
  it('allows instructor to access /courses/abc-123', () => {
    expect(canAccess('/courses/abc-123', 'instructor')).toBe(true);
  });
  it('allows student to access /courses/abc-123', () => {
    expect(canAccess('/courses/abc-123', 'student')).toBe(true);
  });

  // Dynamic route: /courses/$courseId/modules/$moduleId
  it('allows admin to access /courses/abc/modules/mod-1', () => {
    expect(canAccess('/courses/abc/modules/mod-1', 'admin')).toBe(true);
  });
  it('allows student to access /courses/abc/modules/mod-1', () => {
    expect(canAccess('/courses/abc/modules/mod-1', 'student')).toBe(true);
  });

  // Unknown routes are denied
  it('denies access to unknown routes for all roles', () => {
    const roles: AppRole[] = ['admin', 'instructor', 'student'];
    for (const role of roles) {
      expect(canAccess('/unknown-route', role)).toBe(false);
    }
  });

  // ROUTE_PERMISSIONS is exported and inspectable
  it('exports ROUTE_PERMISSIONS as a plain object', () => {
    expect(typeof ROUTE_PERMISSIONS).toBe('object');
    expect(ROUTE_PERMISSIONS['/dashboard']).toContain('admin');
  });
});
