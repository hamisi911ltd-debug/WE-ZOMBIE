// Feature: taco-driving-school
// Property 5: Students only see courses they are enrolled in
// Property 7: Students are denied access to non-enrolled courses
// Validates: Requirements 5.1, 5.6

import { describe, test } from 'vitest';
import * as fc from 'fast-check';
import { filterCoursesForStudent, checkCourseAccess } from '@/backend/lib/course-access';

const uuidArb = fc.uuid();

// Arbitrary for a course object
const courseArb = uuidArb.map((id) => ({ id, title: `Course ${id}` }));

// Arbitrary for an enrollment record
const enrollmentArb = fc
  .tuple(uuidArb, uuidArb)
  .map(([user_id, course_id]) => ({ user_id, course_id }));

describe('Property 5: Students only see courses they are enrolled in', () => {
  test('filterCoursesForStudent returns only enrolled courses', () => {
    fc.assert(
      fc.property(
        fc.array(courseArb, { minLength: 0, maxLength: 20 }),
        fc.array(enrollmentArb, { minLength: 0, maxLength: 20 }),
        uuidArb,
        (courses, enrollments, userId) => {
          const result = filterCoursesForStudent(courses, enrollments, userId);
          const enrolledIds = new Set(
            enrollments.filter((e) => e.user_id === userId).map((e) => e.course_id),
          );
          // Every returned course must be in the enrolled set
          return result.every((c) => enrolledIds.has(c.id));
        },
      ),
      { numRuns: 100 },
    );
  });

  test('filterCoursesForStudent returns ALL enrolled courses (no omissions)', () => {
    fc.assert(
      fc.property(
        fc.array(courseArb, { minLength: 0, maxLength: 20 }),
        fc.array(enrollmentArb, { minLength: 0, maxLength: 20 }),
        uuidArb,
        (courses, enrollments, userId) => {
          const result = filterCoursesForStudent(courses, enrollments, userId);
          const resultIds = new Set(result.map((c) => c.id));
          const enrolledCourseIds = new Set(
            enrollments.filter((e) => e.user_id === userId).map((e) => e.course_id),
          );
          // Every enrolled course that exists in the courses list must be returned
          const expectedIds = courses
            .filter((c) => enrolledCourseIds.has(c.id))
            .map((c) => c.id);
          return expectedIds.every((id) => resultIds.has(id));
        },
      ),
      { numRuns: 100 },
    );
  });
});

describe('Property 7: Students are denied access to non-enrolled courses', () => {
  test('checkCourseAccess returns false for courses the student is not enrolled in', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        fc.array(enrollmentArb, { minLength: 0, maxLength: 20 }),
        (userId, courseId, enrollments) => {
          // Filter out any enrollment that would grant access to this specific course
          const filteredEnrollments = enrollments.filter(
            (e) => !(e.user_id === userId && e.course_id === courseId),
          );
          return checkCourseAccess(userId, courseId, filteredEnrollments) === false;
        },
      ),
      { numRuns: 100 },
    );
  });

  test('checkCourseAccess returns true when the student is enrolled', () => {
    fc.assert(
      fc.property(
        uuidArb,
        uuidArb,
        fc.array(enrollmentArb, { minLength: 0, maxLength: 20 }),
        (userId, courseId, extraEnrollments) => {
          const enrollments = [
            ...extraEnrollments,
            { user_id: userId, course_id: courseId },
          ];
          return checkCourseAccess(userId, courseId, enrollments) === true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
