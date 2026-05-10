/**
 * Pure utility functions for student course access control.
 * Implements Requirements 5.1 and 5.6.
 */

type Enrollment = {
  user_id: string;
  course_id: string;
};

/**
 * Filters a list of courses to only those the student is enrolled in.
 *
 * A course is included if there exists an enrollment where
 * `enrollment.user_id === userId` AND `enrollment.course_id === course.id`.
 *
 * @param courses - Array of course-like objects that have an `id` field
 * @param enrollments - Array of enrollment records
 * @param userId - The student's user ID
 * @returns The subset of courses the student is enrolled in
 */
export function filterCoursesForStudent<T extends { id: string }>(
  courses: T[],
  enrollments: Enrollment[],
  userId: string,
): T[] {
  const enrolledCourseIds = new Set(
    enrollments
      .filter((enrollment) => enrollment.user_id === userId)
      .map((enrollment) => enrollment.course_id),
  );

  return courses.filter((course) => enrolledCourseIds.has(course.id));
}

/**
 * Checks whether a student has access to a specific course.
 *
 * Returns `true` if there is an enrollment where
 * `enrollment.user_id === userId` AND `enrollment.course_id === courseId`.
 *
 * @param userId - The student's user ID
 * @param courseId - The course ID to check access for
 * @param enrollments - Array of enrollment records
 * @returns `true` if the student is enrolled in the course, `false` otherwise
 */
export function checkCourseAccess(
  userId: string,
  courseId: string,
  enrollments: Enrollment[],
): boolean {
  return enrollments.some(
    (enrollment) =>
      enrollment.user_id === userId && enrollment.course_id === courseId,
  );
}
