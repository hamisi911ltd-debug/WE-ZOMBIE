# Admin System Implementation Plan

## Core Features to Implement

### 1. Admin-Only Student Creation
- Remove public signup
- Admin creates student accounts
- Auto-generate temporary passwords
- Students must be enrolled in a course to access system

### 2. Courses Management (CRUD)
**Default Courses from Image:**
- Class A - Motorcycle (9,200/=)
- Class B - Light Private (14,300/=)
- Class C - Heavy Goods (15,300/=)
- Class D - PSV (10,600/=)
- Class B HALF - Refresher (10,400/=)
- Class C HALF - Upgrade (10,600/=)
- Class CE - Articulated (36,600/=)

**Features:**
- Create/Edit/Delete courses
- Set tuition, PDL, test fees
- Add course description and duration
- Archive/Unarchive courses

### 3. Modules Management
**Per Course:**
- Add/Edit/Delete modules
- Set module order
- Add module description

### 4. Lessons Management
**Per Module:**
- Add PDF notes (upload)
- Add video links (YouTube/Vimeo)
- Add text content
- Set lesson order
- Mark as theory/practical

### 5. Tests & Exams
- Create tests per module/course
- Multiple choice questions
- Set passing score
- Auto-grade tests
- Track student attempts

### 6. Certificates
- Auto-generate on course completion
- Require all modules + passing test
- PDF certificate with student name, course, date
- Download/print functionality

### 7. User Management
- View all users (students, instructors, admins)
- Create new users
- Assign roles
- Reset passwords
- Deactivate accounts

### 8. Enrollments
- Enroll students in courses
- Set enrollment date
- Track enrollment status
- Manage payments per enrollment

## Implementation Order

1. ✅ Admin Layout & Navigation
2. Courses CRUD
3. Modules CRUD (per course)
4. Lessons CRUD (per module)
5. Student Management (create, enroll)
6. Tests System
7. Certificates System
8. User Management
9. Remove public signup
10. Payment tracking per enrollment

## Database Schema Updates Needed

```sql
-- Add course fees to courses table
ALTER TABLE courses ADD COLUMN tuition INTEGER;
ALTER TABLE courses ADD COLUMN pdl_fee INTEGER;
ALTER TABLE courses ADD COLUMN test_fee INTEGER;
ALTER TABLE courses ADD COLUMN total_fee INTEGER;
ALTER TABLE courses ADD COLUMN duration TEXT;

-- Add test tables
CREATE TABLE tests (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  module_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL,
  time_limit INTEGER,
  created_at TEXT NOT NULL
);

CREATE TABLE test_questions (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  position INTEGER NOT NULL
);

CREATE TABLE test_attempts (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  completed_at TEXT NOT NULL
);

CREATE TABLE certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  issued_date TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE
);
```
