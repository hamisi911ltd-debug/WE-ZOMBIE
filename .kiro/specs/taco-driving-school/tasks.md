# Implementation Plan: Taco Driving School Management System

## Overview

Build the full feature set on top of the existing skeleton (auth, sidebar layout, dashboard stub, courses/modules/lessons schema). The implementation proceeds in layers: database migrations → shared utilities and types → TanStack Query hooks → feature UI components → route pages → dashboard enhancements → profile modal. Property-based tests are placed immediately after the pure functions they validate.

## Tasks

- [x] 1. Add database migrations for new tables
  - Create a new Supabase migration file for `enrollments`, `payments`, `schedule_entries`, `lesson_progress`, and `notification_preferences` tables exactly as specified in the design document
  - Include all RLS policies and `updated_at` triggers for each table
  - Update `src/integrations/supabase/types.ts` to add the new table Row/Insert/Update types and the `payment_status` enum
  - _Requirements: 4.3, 6.1, 7.1, 5.2, 9.4_

- [x] 2. Create domain types and pure utility functions
  - [x] 2.1 Create `src/types/domain.ts` with all domain types from the design (`PaymentStatus`, `EnrollmentStatus`, `LessonType`, `LessonContentType`, `AppRole`, `CompletionStats`, `ScheduleConflict`)
    - _Requirements: 3.3, 6.3, 7.1_

  - [x] 2.2 Create `src/lib/access-control.ts` with `canAccess(route, role)` and the permission matrix for all routes
    - Map each route path to its allowed roles based on the routing structure in the design
    - _Requirements: 1.4, 4.7_

  - [x]* 2.3 Write unit tests for `canAccess` in `src/__tests__/unit/access-control.test.ts`
    - Test each role/route combination against the permission matrix
    - _Requirements: 1.4_

  - [x]* 2.4 Write property test for `canAccess` in `src/__tests__/property/access-control.property.test.ts`
    - **Property 1: Route access control is consistent with the permission matrix**
    - **Validates: Requirements 1.4, 4.7**

  - [x] 2.5 Create `src/lib/upload-button-context.ts` with `getUploadButtonContext(pathname)` returning the context-appropriate action label per route section
    - _Requirements: 2.2, 2.3, 2.4, 2.5_

  - [x]* 2.6 Write property test for `getUploadButtonContext` in `src/__tests__/property/upload-button-context.property.test.ts`
    - **Property 2: Universal Upload Button default action matches current route**
    - **Validates: Requirements 2.2, 2.3, 2.4, 2.5**

  - [x] 2.7 Create `src/lib/position.ts` with `getNextPosition(existingPositions: number[])` and `reorderPositions(items, fromIndex, toIndex)` functions
    - `getNextPosition` returns `max + 1` for non-empty arrays, `0` for empty
    - `reorderPositions` returns a contiguous, duplicate-free sequence starting at 0
    - _Requirements: 3.2, 3.3, 3.8_

  - [x]* 2.8 Write unit tests for position functions in `src/__tests__/unit/position-assignment.test.ts`
    - Test empty list, single item, and multi-item cases
    - _Requirements: 3.2, 3.8_

  - [x]* 2.9 Write property test for `getNextPosition` in `src/__tests__/property/position-assignment.property.test.ts`
    - **Property 3: New item position is always one greater than the current maximum**
    - **Validates: Requirements 3.2, 3.3**

  - [x]* 2.10 Write property test for `reorderPositions` in `src/__tests__/property/reorder-positions.property.test.ts`
    - **Property 4: Reorder produces a contiguous, duplicate-free position sequence**
    - **Validates: Requirements 3.8**

  - [x] 2.11 Create `src/lib/course-access.ts` with `filterCoursesForStudent(courses, enrollments, userId)` and `checkCourseAccess(userId, courseId, enrollments)` functions
    - _Requirements: 5.1, 5.6_

  - [x]* 2.12 Write property test for `filterCoursesForStudent` in `src/__tests__/property/course-filter.property.test.ts`
    - **Property 5: Students only see courses they are enrolled in**
    - **Validates: Requirements 5.1, 5.6**

  - [x]* 2.13 Write property test for `checkCourseAccess` in `src/__tests__/property/course-filter.property.test.ts` (same file, second test)
    - **Property 7: Students are denied access to non-enrolled courses**
    - **Validates: Requirements 5.6**

  - [x] 2.14 Create `src/lib/completion.ts` with `calculateCompletionPercentage(completed: number, total: number)` function
    - Returns `Math.round((completed / total) * 100)`, clamped to `[0, 100]`; returns `0` when `total === 0`
    - _Requirements: 5.3, 8.4_

  - [x]* 2.15 Write unit tests for `calculateCompletionPercentage` in `src/__tests__/unit/completion-percentage.test.ts`
    - Test boundary values: 0/0, 0/5, 5/5, 3/7
    - _Requirements: 5.3_

  - [x]* 2.16 Write property test for `calculateCompletionPercentage` in `src/__tests__/property/completion-percentage.property.test.ts`
    - **Property 6: Course completion percentage is mathematically correct and bounded**
    - **Validates: Requirements 5.3, 8.4**

  - [x] 2.17 Create `src/lib/payments.ts` with `filterPaymentsForUser(payments, userId)`, `isOverdue(payment, now)`, and `generateReceiptContent(payment, studentName)` functions
    - `isOverdue` returns `true` iff `due_date < now` AND `status === 'pending'`
    - `generateReceiptContent` returns a string containing amount, date, and student name
    - _Requirements: 6.4, 6.5, 6.6_

  - [x]* 2.18 Write unit tests for payment utilities in `src/__tests__/unit/overdue-detection.test.ts` and `src/__tests__/unit/receipt-generation.test.ts`
    - Test specific date/status combinations for `isOverdue`; verify required fields in receipt output
    - _Requirements: 6.5, 6.6_

  - [x]* 2.19 Write property test for `filterPaymentsForUser` in `src/__tests__/property/payment-filter.property.test.ts`
    - **Property 8: Students only see their own payment records**
    - **Validates: Requirements 6.4**

  - [x]* 2.20 Write property test for `generateReceiptContent` in `src/__tests__/property/receipt-completeness.property.test.ts`
    - **Property 9: Generated receipt contains all required fields**
    - **Validates: Requirements 6.5**

  - [x]* 2.21 Write property test for `isOverdue` in `src/__tests__/property/overdue-detection.property.test.ts`
    - **Property 10: Overdue detection is correct for all date/status combinations**
    - **Validates: Requirements 6.6**

  - [x] 2.22 Create `src/lib/schedule.ts` with `hasScheduleConflict(entryA, entryB)`, `filterScheduleForUser(entries, userId, role)`, and `getNextLesson(entries, now)` functions
    - `hasScheduleConflict` uses half-open interval overlap: `startA < endB && startB < endA`
    - `filterScheduleForUser` returns all entries for admin, student-scoped for student, instructor-scoped for instructor
    - `getNextLesson` returns the entry with the smallest future `scheduledDate + startTime`, or `null`
    - _Requirements: 7.2, 7.3, 7.4, 8.3_

  - [x]* 2.23 Write unit tests for schedule utilities in `src/__tests__/unit/schedule-conflict.test.ts` and `src/__tests__/unit/next-lesson.test.ts`
    - Test adjacent, overlapping, and contained intervals; test empty list and multiple entries for next lesson
    - _Requirements: 7.2, 8.3_

  - [x]* 2.24 Write property test for `hasScheduleConflict` in `src/__tests__/property/schedule-conflict.property.test.ts`
    - **Property 11: Schedule conflict detection correctly identifies all overlapping intervals**
    - **Validates: Requirements 7.2**

  - [x]* 2.25 Write property test for `filterScheduleForUser` in `src/__tests__/property/schedule-filter.property.test.ts`
    - **Property 12: Schedule entries are filtered to the requesting user**
    - **Validates: Requirements 7.3, 7.4**

  - [x]* 2.26 Write property test for `getNextLesson` in `src/__tests__/property/next-lesson.property.test.ts`
    - **Property 13: Next lesson calculation returns the nearest future entry**
    - **Validates: Requirements 8.3**

- [x] 3. Checkpoint — Ensure all utility tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Create TanStack Query hooks
  - [x] 4.1 Create `src/hooks/use-courses.ts` with `useCourses()` hook
    - Admin fetches all non-archived courses; students fetch only enrolled courses using `filterCoursesForStudent`
    - Include `useCreateCourse`, `useUpdateCourse`, and `useArchiveCourse` mutation hooks
    - _Requirements: 3.1, 3.5, 3.6, 5.1_

  - [x] 4.2 Create `src/hooks/use-modules.ts` with `useModules(courseId)` hook
    - Fetch modules ordered by `position`; include `useCreateModule`, `useUpdateModule`, `useReorderModules` mutations
    - _Requirements: 3.2, 3.5, 3.8_

  - [x] 4.3 Create `src/hooks/use-lessons.ts` with `useLessons(moduleId)` hook
    - Fetch lessons ordered by `position`; include `useCreateLesson`, `useUpdateLesson`, `useReorderLessons` mutations
    - _Requirements: 3.3, 3.5, 3.8_

  - [x] 4.4 Create `src/hooks/use-enrollments.ts` with `useEnrollments(userId?)` hook
    - Include `useCreateEnrollment` mutation
    - _Requirements: 4.3_

  - [x] 4.5 Create `src/hooks/use-students.ts` with `useStudents(search?, filter?)` hook
    - Debounce search by 300ms; filter by enrolled course or enrollment status
    - _Requirements: 4.5, 4.6_

  - [x] 4.6 Create `src/hooks/use-payments.ts` with `usePayments(userId?)` hook
    - Admin fetches all payments; students fetch only their own using `filterPaymentsForUser`
    - Include `useCreatePayment`, `useUpdatePayment` mutations
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 4.7 Create `src/hooks/use-schedule.ts` with `useScheduleEntries(userId?, role?)` hook
    - Scope results using `filterScheduleForUser`; include `useCreateScheduleEntry`, `useUpdateScheduleEntry`, `useDeleteScheduleEntry` mutations
    - _Requirements: 7.1, 7.3, 7.4, 7.5_

  - [x] 4.8 Create `src/hooks/use-lesson-progress.ts` with `useLessonProgress(userId, courseId)` hook
    - Include `useMarkLessonComplete` mutation that upserts a progress record
    - _Requirements: 5.2, 5.3_

  - [x] 4.9 Create `src/hooks/use-profile.ts` with `useProfile(userId)` hook
    - Include `useUpdateProfile` mutation; handle avatar upload to Supabase Storage
    - _Requirements: 9.2, 9.3_

- [x] 5. Build shared UI components
  - [x] 5.1 Create `src/components/UniversalUploadButton.tsx`
    - Floating `+` button visible only to admin users, positioned fixed bottom-right
    - Reads current pathname and calls `getUploadButtonContext` to determine which dialog to open
    - Renders the appropriate form dialog based on context
    - Wire into `_authenticated.tsx` layout so it appears on every admin screen
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [x] 5.2 Create `src/components/ProfileModal.tsx`
    - Dialog with glassmorphism overlay (`backdrop-blur-md bg-black/50`)
    - Tabs: Profile (full name, phone, avatar upload) and Settings (email reminders toggle)
    - Logout button that calls `signOut()` and redirects to `/login`
    - Uses `useProfile` and `useUpdateProfile` hooks; shows toast on save
    - Wire the Account tab / user card in the sidebar to open this modal
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 1.5_

  - [x] 5.3 Create `src/components/LessonViewer.tsx`
    - Renders lesson content based on `content_type`: `<video>` element for video, `<iframe>`/`<embed>` with download fallback for PDF, markdown/rich text render for text
    - _Requirements: 5.4, 5.5_

  - [x] 5.4 Create `src/components/ProgressButton.tsx`
    - Button that calls `useMarkLessonComplete`; shows "Mark Complete" or "Completed ✓" based on progress record
    - Optimistic update: immediately toggle UI state, reconcile on server response
    - _Requirements: 5.2_

  - [x] 5.5 Create `src/components/ConflictWarning.tsx`
    - Inline alert component that renders when a schedule conflict is detected
    - Shows conflicting entry details and Confirm / Cancel actions
    - _Requirements: 7.2_

  - [x] 5.6 Create `src/components/ReceiptDownload.tsx`
    - Button that calls `generateReceiptContent` and triggers browser print / `window.print()` for paid payments
    - Only renders when `payment.status === 'paid'`
    - _Requirements: 6.5_

- [x] 6. Implement Course Management pages
  - [x] 6.1 Upgrade `src/routes/_authenticated.courses.index.tsx`
    - Replace direct Supabase calls with `useCourses()` hook
    - Add archive toggle (admin only) using `useArchiveCourse` mutation
    - Students see only enrolled courses; show enrollment-based empty state
    - Add Edit icon (opens `CourseForm` dialog) and View icon (navigates to course detail) on each card
    - _Requirements: 3.1, 3.5, 3.6, 3.7, 5.1_

  - [x] 6.2 Upgrade `src/routes/_authenticated.courses.$courseId.index.tsx`
    - Render `ModuleList` with ordered modules fetched via `useModules(courseId)`
    - Admin: show Add Module button, drag-to-reorder handle, Edit icon per module using `useReorderModules`
    - All roles: show View icon per module linking to module detail
    - Enforce course access for students using `checkCourseAccess`; render 403 message if denied
    - _Requirements: 3.2, 3.5, 3.7, 3.8, 5.6_

  - [x] 6.3 Upgrade `src/routes/_authenticated.courses.$courseId.modules.$moduleId.tsx`
    - Render `LessonList` with ordered lessons fetched via `useLessons(moduleId)`
    - Admin: show Add Lesson button (opens `LessonForm`), drag-to-reorder, Edit icon per lesson
    - Students: render `LessonViewer` for selected lesson and `ProgressButton` per lesson
    - _Requirements: 3.3, 3.4, 3.5, 3.7, 3.8, 5.2, 5.4, 5.5_

- [x] 7. Implement Student Management page
  - [x] 7.1 Upgrade `src/routes/_authenticated.students.tsx`
    - Render searchable, filterable table using `useStudents(search, filter)` hook
    - Columns: name, email, enrolled course, enrollment status
    - Add role guard: render 403 message for non-admin users
    - _Requirements: 4.5, 4.6, 4.7_

  - [x] 7.2 Create `src/components/EnrollStudentForm.tsx`
    - Multi-step dialog: Step 1 — name + email fields, calls Supabase Admin API to create auth user, assigns student role, creates profile; Step 2 — course selector, creates enrollment record
    - Uses zod schema for validation; shows toast on success/error
    - _Requirements: 4.1, 4.2, 4.3_

  - [x] 7.3 Create `src/components/StudentDetail.tsx`
    - Admin view showing profile info, enrolled course, payment history, and uploaded documents
    - Includes file upload input for identity documents (image/* only, max 10 MB) that stores to Supabase Storage and updates `avatar_url`
    - _Requirements: 4.4_

- [x] 8. Implement Payment Management page
  - [x] 8.1 Upgrade `src/routes/_authenticated.payments.tsx`
    - Render payments table using `usePayments()` hook (scoped by role)
    - Highlight overdue rows using `isOverdue(payment, now)` with a visual indicator
    - Admin: show all payments with student name column; students: show only own payments
    - _Requirements: 6.1, 6.3, 6.4, 6.6_

  - [x] 8.2 Create `src/components/PaymentForm.tsx`
    - Dialog with fields: `student_id` (admin only, searchable select), `amount`, `due_date`, `status`
    - File upload for payment proof (application/pdf only, max 10 MB); stores to Supabase Storage and saves URL to `proof_url`
    - Uses zod schema; calls `useCreatePayment` or `useUpdatePayment`
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 8.3 Wire `ReceiptDownload` component into the payments table row for paid payments
    - _Requirements: 6.5_

- [x] 9. Implement Schedule Management page
  - [x] 9.1 Upgrade `src/routes/_authenticated.schedule.tsx`
    - Render schedule entries list/calendar using `useScheduleEntries()` hook (scoped by role)
    - Admin: show all entries with instructor and student columns; instructors/students: show only their own
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 9.2 Create `src/components/ScheduleEntryForm.tsx`
    - Dialog with fields: `instructor_id` (user select), `module_id` (module select), `student_id` (optional), `date`, `start_time`, `end_time`
    - Before submission, query existing entries for the instructor on the selected date and call `hasScheduleConflict`; if conflict found, render `ConflictWarning` inline
    - Uses zod schema with `end_time > start_time` validation
    - Calls `useCreateScheduleEntry` or `useUpdateScheduleEntry`; admin can also delete via `useDeleteScheduleEntry`
    - _Requirements: 7.1, 7.2, 7.5_

- [x] 10. Checkpoint — Ensure all feature pages render correctly
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Upgrade Dashboard with role-specific content
  - [x] 11.1 Upgrade `src/routes/_authenticated.dashboard.tsx` — Admin view
    - Replace stub stats with real data: total enrolled students (from `enrollments`), total active courses, total pending payments, upcoming schedule entries in next 7 days
    - Add Quick Add shortcuts that open `EnrollStudentForm`, `CourseForm`, and `PaymentForm` dialogs
    - _Requirements: 8.1, 8.2_

  - [x] 11.2 Upgrade `src/routes/_authenticated.dashboard.tsx` — Student view
    - Show course completion percentage progress bar using `useLessonProgress` + `calculateCompletionPercentage`
    - Show countdown to next scheduled lesson using `useScheduleEntries` + `getNextLesson`
    - _Requirements: 8.3, 8.4, 5.3_

- [x] 12. Wire authentication and route guards
  - [x] 12.1 Add role-based route guards to `/students` route — render 403 component for non-admin users
    - _Requirements: 1.4, 4.7_

  - [x] 12.2 Ensure login form uses generic "Invalid credentials" error message (not field-specific) for Supabase auth errors
    - _Requirements: 1.2_

  - [x] 12.3 Verify `_authenticated.tsx` redirects unauthenticated users to `/login` and that session expiry via `onAuthStateChange` triggers the same redirect
    - _Requirements: 1.3_

- [x] 13. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (Properties 1–13 from the design)
- Unit tests validate specific examples and edge cases
- The design uses TypeScript throughout; all code should match the existing project conventions
- fast-check is not yet in `package.json` — install it (`bun add -D fast-check`) before writing property tests
- Vitest is not yet configured — add it (`bun add -D vitest @vitest/ui jsdom @testing-library/react`) and create `vitest.config.ts` before running tests
