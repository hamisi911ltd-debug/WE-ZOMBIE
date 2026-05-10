// Feature: taco-driving-school
// Property 1: Route access control is consistent with the permission matrix
// Validates: Requirements 1.4, 4.7

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { canAccess, ROUTE_PERMISSIONS } from '@/backend/lib/access-control';
import type { AppRole } from '@/backend/types/domain';

const ALL_ROLES: AppRole[] = ['admin', 'instructor', 'student'];

// Arbitraries for known routes and roles
const knownRouteArb = fc.constantFrom(...Object.keys(ROUTE_PERMISSIONS));
const roleArb = fc.constantFrom(...ALL_ROLES);

describe('Property 1: Route access control is consistent with the permission matrix', () => {
  test('canAccess returns true iff the role is in the allowed set for that route', () => {
    fc.assert(
      fc.property(knownRouteArb, roleArb, (route, role) => {
        const allowed = ROUTE_PERMISSIONS[route];
        const result = canAccess(route, role);
        return result === allowed.includes(role);
      }),
      { numRuns: 100 },
    );
  });

  test('no role ever gains access to a route not in its permission matrix', () => {
    // Generate routes that are NOT in the permission matrix
    const unknownRouteArb = fc
      .string({ minLength: 1 })
      .filter((s) => s.startsWith('/') && !Object.keys(ROUTE_PERMISSIONS).includes(s));

    fc.assert(
      fc.property(unknownRouteArb, roleArb, (route, role) => {
        // Unknown routes must always be denied
        return canAccess(route, role) === false;
      }),
      { numRuns: 100 },
    );
  });

  test('admin always has access to every route in the permission matrix', () => {
    fc.assert(
      fc.property(knownRouteArb, (route) => {
        const allowed = ROUTE_PERMISSIONS[route];
        if (!allowed.includes('admin')) return true; // skip routes not meant for admin
        return canAccess(route, 'admin') === true;
      }),
      { numRuns: 100 },
    );
  });

  test('/students is only accessible by admin', () => {
    fc.assert(
      fc.property(roleArb, (role) => {
        const result = canAccess('/students', role);
        return result === (role === 'admin');
      }),
      { numRuns: 100 },
    );
  });
});
