import type { AppRole } from '@/backend/types/domain';

/**
 * Permission matrix mapping route patterns to the set of roles allowed to access them.
 *
 * Route patterns use the TanStack Router convention:
 *   - Static segments: `/dashboard`
 *   - Dynamic segments: `/courses/$courseId`
 *
 * The matrix is intentionally a plain constant so it can be imported and
 * inspected by tests without executing any logic.
 */
export const ROUTE_PERMISSIONS: Record<string, AppRole[]> = {
  '/dashboard': ['admin', 'instructor', 'student'],
  '/courses': ['admin', 'instructor', 'student'],
  '/courses/$courseId': ['admin', 'instructor', 'student'],
  '/courses/$courseId/modules/$moduleId': ['admin', 'instructor', 'student'],
  '/students': ['admin'],
  '/payments': ['admin', 'instructor', 'student'],
  '/schedule': ['admin', 'instructor', 'student'],
};

/**
 * All route patterns in the permission matrix, sorted longest-first so that
 * more-specific patterns are tried before shorter ones during matching.
 */
const SORTED_PATTERNS = Object.keys(ROUTE_PERMISSIONS).sort(
  (a, b) => b.length - a.length,
);

/**
 * Convert a route pattern (which may contain `$param` dynamic segments) into
 * a RegExp that matches concrete paths.
 *
 * Examples:
 *   `/courses/$courseId`                        → /^\/courses\/[^/]+$/
 *   `/courses/$courseId/modules/$moduleId`      → /^\/courses\/[^/]+\/modules\/[^/]+$/
 */
function patternToRegex(pattern: string): RegExp {
  // Escape all regex special characters, then replace escaped $param segments
  // with a wildcard that matches one non-slash path segment.
  const escaped = pattern
    .replace(/[/\\^$*+?.()|[\]{}]/g, '\\$&') // escape regex special chars
    .replace(/\\\$[^/]+/g, '[^/]+');           // replace \$param with [^/]+
  return new RegExp(`^${escaped}$`);
}

/** Pre-compiled regex cache so we don't recompile on every call. */
const PATTERN_REGEX_CACHE = new Map<string, RegExp>(
  SORTED_PATTERNS.map((p) => [p, patternToRegex(p)]),
);

/**
 * Determine whether a user with the given `role` is allowed to access `route`.
 *
 * @param route - The concrete route path (e.g. `/courses/abc-123`).
 * @param role  - The authenticated user's role.
 * @returns `true` if the role is permitted; `false` otherwise.
 *
 * Matching rules:
 * 1. Try an exact match against the permission matrix first.
 * 2. If no exact match, iterate patterns longest-first and return the first
 *    regex match.
 * 3. If no pattern matches, return `false` (deny by default).
 */
export function canAccess(route: string, role: AppRole): boolean {
  // 1. Exact match (fast path for static routes)
  if (Object.prototype.hasOwnProperty.call(ROUTE_PERMISSIONS, route)) {
    return ROUTE_PERMISSIONS[route].includes(role);
  }

  // 2. Pattern match (handles dynamic segments)
  for (const pattern of SORTED_PATTERNS) {
    const regex = PATTERN_REGEX_CACHE.get(pattern)!;
    if (regex.test(route)) {
      return ROUTE_PERMISSIONS[pattern].includes(role);
    }
  }

  // 3. No matching pattern → deny
  return false;
}
