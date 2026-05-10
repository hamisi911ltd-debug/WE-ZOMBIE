# Requirements Document

## Introduction

The Taco Driving School Management System is a web application that enables a driving school to manage its full operational lifecycle. Admins enroll students, build a nested course curriculum (Courses → Modules → Lessons), track payments, and schedule instructors. Students log in to view their assigned course content, track their progress, and manage their payments. The system is built on React + TypeScript with TanStack Router, Supabase for backend/auth, and Tailwind CSS + shadcn/ui.

---

## Glossary

- **System**: The Taco Driving School Management System web application.
- **Admin**: An authenticated user with the `admin` role who manages all school operations.
- **Instructor**: An authenticated user with the `instructor` role who is assigned to modules and students.
- **Student**: An authenticated user with the `student` role who is enrolled in a course.
- **Course**: The top-level curriculum container representing a specific license category (e.g., Category B – Light Private).
- **Module**: A sub-division of a Course representing a topic area (e.g., Basic Vehicle Control).
- **Lesson**: A single piece of content inside a Module, tagged as Theory or Practical, with a content type of Text, Video, or PDF.
- **Enrollment**: The association between a Student and a Course, created by an Admin.
- **Universal_Upload_Button**: The context-aware floating action button available to Admins on every screen.
- **Profile_Modal**: The glassmorphism pop-up accessible from the Account tab that allows any authenticated user to edit their profile, adjust settings, or log out.
- **Payment**: A financial record linking a Student to a fee amount, payment status, and optional proof document.
- **Schedule_Entry**: A record associating an Instructor with a Module and/or Student at a specific date and time.
- **Progress_Record**: A record tracking a Student's completion status for a specific Lesson.

---

## Requirements

### Requirement 1: Authentication and Role-Based Access

**User Story:** As a user, I want to log in with my credentials and be shown only the features relevant to my role, so that the interface is focused and secure.

#### Acceptance Criteria

1. WHEN a user submits valid credentials, THE System SHALL authenticate the user via Supabase Auth and redirect them to their role-appropriate dashboard.
2. WHEN a user submits invalid credentials, THE System SHALL display a descriptive error message without revealing whether the email or password was incorrect.
3. WHEN an unauthenticated user attempts to access a protected route, THE System SHALL redirect them to the login page.
4. WHILE a user is authenticated, THE System SHALL enforce route-level access control based on the user's assigned role (`admin`, `instructor`, or `student`).
5. WHEN a user clicks Logout in the Profile_Modal, THE System SHALL terminate the Supabase session and redirect the user to the login page.
6. WHEN a new user account is created by an Admin, THE System SHALL assign the `student` role by default unless a different role is explicitly specified.

---

### Requirement 2: Universal Upload Button (Admin)

**User Story:** As an Admin, I want a context-aware action button available on every screen, so that I can quickly add data without navigating away from my current task.

#### Acceptance Criteria

1. WHILE an Admin is authenticated, THE System SHALL display the Universal_Upload_Button on every Admin screen.
2. WHEN an Admin is viewing the Students section, THE Universal_Upload_Button SHALL default its primary action to "Enroll Student."
3. WHEN an Admin is viewing the Payments section, THE Universal_Upload_Button SHALL default its primary action to "New Payment."
4. WHEN an Admin is viewing the Courses section, THE Universal_Upload_Button SHALL default its primary action to "Add New Course."
5. WHEN an Admin is viewing the Schedule section, THE Universal_Upload_Button SHALL default its primary action to "Add Schedule Entry."
6. WHEN an Admin activates the Universal_Upload_Button, THE System SHALL open the corresponding data-entry form without navigating away from the current page.
7. WHEN an Admin uses the Universal_Upload_Button to upload a file (document or photo), THE System SHALL upload the file to Supabase Storage and associate it with the relevant record.

---

### Requirement 3: Course Management (Nested Architecture)

**User Story:** As an Admin, I want to create and manage a three-level course hierarchy (Course → Module → Lesson), so that I can organize the driving school curriculum in a structured way.

#### Acceptance Criteria

1. WHEN an Admin submits a new Course form with a title and optional description, THE System SHALL persist the Course record to the `courses` table and display it in the Courses list.
2. WHEN an Admin submits a new Module form with a title and optional description linked to a Course, THE System SHALL persist the Module record to the `modules` table with the correct `course_id` and `position`.
3. WHEN an Admin submits a new Lesson form inside a Module, THE System SHALL persist the Lesson record to the `lessons` table with the correct `module_id`, `lesson_type` (`theory` or `practical`), `content_type` (`text`, `video`, or `pdf`), and `position`.
4. WHEN an Admin uploads a PDF or video file for a Lesson, THE System SHALL store the file in Supabase Storage and save the resulting URL in the `content_url` field of the Lesson.
5. WHEN an Admin edits a Course, Module, or Lesson, THE System SHALL update the corresponding record and reflect the changes immediately in the UI without a full page reload.
6. WHEN an Admin archives a Course, THE System SHALL set the `archived` flag to `true` on the Course record and hide the Course from the active Courses list.
7. THE System SHALL display an Edit icon and a View icon at every level of the hierarchy (Course, Module, Lesson).
8. WHEN an Admin reorders Modules within a Course or Lessons within a Module, THE System SHALL update the `position` values of the affected records to reflect the new order.

---

### Requirement 4: Student Management and Enrollment

**User Story:** As an Admin, I want to enroll students and manage their profiles and documents, so that I can maintain accurate student records.

#### Acceptance Criteria

1. WHEN an Admin submits the Enroll Student form with a student's full name and email, THE System SHALL create a Supabase Auth account for the student, assign the `student` role, and create a corresponding `profiles` record.
2. WHEN a student account is created, THE System SHALL generate a secure temporary password and send a password-reset email to the student's email address via Supabase Auth.
3. WHEN an Admin assigns a student to a Course, THE System SHALL create an Enrollment record linking the student's user ID to the Course ID.
4. WHEN an Admin uploads an identity document or photo for a student, THE System SHALL store the file in Supabase Storage and associate the file URL with the student's `profiles` record.
5. WHEN an Admin searches the Students list by name or email, THE System SHALL return matching student records within 500ms of the final keystroke.
6. WHEN an Admin applies a filter to the Students list (e.g., by enrolled course or enrollment status), THE System SHALL display only the students matching the selected filter criteria.
7. WHILE a user has the `student` role, THE System SHALL restrict access to the Students management section.

---

### Requirement 5: Student Course Access

**User Story:** As a Student, I want to view the modules and lessons of my enrolled course, so that I can study the curriculum at my own pace.

#### Acceptance Criteria

1. WHEN a Student logs in, THE System SHALL display only the Course, Modules, and Lessons associated with the Student's active Enrollment.
2. WHEN a Student marks a Lesson as complete, THE System SHALL create or update a Progress_Record linking the student's user ID to the Lesson ID with a `completed` status.
3. WHILE a Student has an active Enrollment, THE System SHALL display the student's overall course completion percentage on their Dashboard, calculated as the number of completed Lessons divided by the total number of Lessons in the enrolled Course.
4. WHEN a Student views a Lesson with `content_type` of `video`, THE System SHALL render an embedded video player.
5. WHEN a Student views a Lesson with `content_type` of `pdf`, THE System SHALL render an inline PDF viewer or provide a download link.
6. IF a Student attempts to access a Course or Module they are not enrolled in, THEN THE System SHALL return a 403 Forbidden response and display an access-denied message.

---

### Requirement 6: Payment Management

**User Story:** As an Admin, I want to log student fees and track payment status, so that I can maintain accurate financial records for the school.

#### Acceptance Criteria

1. WHEN an Admin logs a new Payment with a student ID, amount, and due date, THE System SHALL persist the Payment record and display it in the Payments list.
2. WHEN an Admin uploads proof of a bank transfer for a Payment, THE System SHALL store the file in Supabase Storage and associate the file URL with the Payment record.
3. WHEN an Admin updates the status of a Payment to `paid`, `pending`, or `overdue`, THE System SHALL update the Payment record and reflect the new status immediately in the UI.
4. WHEN a Student views the Payments section, THE System SHALL display only the Payment records associated with that Student's user ID.
5. WHEN a Student downloads a receipt for a `paid` Payment, THE System SHALL generate and serve a downloadable receipt document containing the payment amount, date, and student name.
6. IF a Payment's due date has passed and its status remains `pending`, THEN THE System SHALL display a visual overdue indicator on the Payment record for Admin users.

---

### Requirement 7: Schedule Management

**User Story:** As an Admin, I want to assign instructors to modules and students at specific times, so that I can coordinate the school's practical training sessions.

#### Acceptance Criteria

1. WHEN an Admin creates a Schedule_Entry with an instructor ID, module ID, optional student ID, date, and start/end time, THE System SHALL persist the Schedule_Entry record and display it in the Schedule view.
2. IF an Admin attempts to create a Schedule_Entry where the selected Instructor already has an overlapping Schedule_Entry, THEN THE System SHALL display a conflict warning before allowing the Admin to confirm or cancel the entry.
3. WHEN a Student views the Schedule section, THE System SHALL display only the Schedule_Entry records associated with that Student's user ID.
4. WHEN an Instructor views the Schedule section, THE System SHALL display only the Schedule_Entry records assigned to that Instructor's user ID.
5. WHEN an Admin edits or deletes a Schedule_Entry, THE System SHALL update or remove the record and reflect the change immediately in the Schedule view.

---

### Requirement 8: Dashboard

**User Story:** As an Admin or Student, I want a role-specific dashboard that surfaces the most relevant information at a glance, so that I can quickly understand the current state of my tasks.

#### Acceptance Criteria

1. WHEN an Admin views the Dashboard, THE System SHALL display aggregate analytics including total enrolled students, total active courses, total pending payments, and upcoming schedule entries for the next 7 days.
2. WHEN an Admin views the Dashboard, THE System SHALL display "Quick Add" shortcuts that open the same forms as the Universal_Upload_Button for the most common actions (Enroll Student, Add Course, Log Payment).
3. WHEN a Student views the Dashboard, THE System SHALL display a countdown to the Student's next scheduled lesson, derived from the Student's Schedule_Entry records.
4. WHILE a Student has an active Enrollment, THE System SHALL display the Student's overall course completion percentage on the Dashboard.

---

### Requirement 9: Profile Modal (Account Management)

**User Story:** As any authenticated user, I want to manage my profile, notification settings, and session from a single accessible modal, so that I can keep my account information up to date.

#### Acceptance Criteria

1. WHEN an authenticated user activates the Account tab in the navigation, THE System SHALL display the Profile_Modal as a dialog with a blurred glassmorphism background overlay.
2. WHEN a user submits updated profile information (full name, phone, or avatar photo) in the Profile_Modal, THE System SHALL update the corresponding `profiles` record in Supabase and reflect the changes in the UI without closing the modal.
3. WHEN a user uploads a new avatar photo in the Profile_Modal, THE System SHALL store the image in Supabase Storage and update the `avatar_url` field in the `profiles` record.
4. WHEN a user toggles a notification setting in the Profile_Modal, THE System SHALL persist the preference and apply it to the user's notification behavior.
5. WHEN a user clicks the Logout button in the Profile_Modal, THE System SHALL terminate the Supabase session and redirect the user to the login page within 1 second.
