# Complete Admin System Implementation Guide

## Overview
This guide provides the complete implementation for a full-featured admin system for Immacurate Driving School.

## Key Changes Summary

### 1. **Remove Public Signup**
- Students can ONLY be created by admin
- Public signup route will be disabled
- Admin creates student accounts with temporary passwords

### 2. **Admin Navigation Structure**
```
Admin Panel
├── Dashboard (Overview stats)
├── Courses Management (CRUD)
│   ├── List all courses
│   ├── Create/Edit/Delete course
│   ├── Manage modules per course
│   └── Manage lessons per module
├── Students Management
│   ├── Create student accounts
│   ├── Enroll in courses
│   ├── View progress
│   └── Reset passwords
├── Instructors Management
├── Tests & Exams
│   ├── Create tests
│   ├── Add questions
│   └── View results
├── Certificates
│   ├── Auto-generate on completion
│   └── Download/Print
├── Payments Tracking
├── Schedule Management
└── School Information
```

### 3. **Default Courses** (From Image)

| Class | Description | Tuition | PDL | Test | Total |
|-------|-------------|---------|-----|------|-------|
| A | Motorcycle | 7,500 | 650 | 1,050 | 9,200 |
| B | Light Private | 12,600 | 650 | 1,050 | 14,300 |
| C | Heavy Goods | 13,600 | 650 | 1,050 | 15,300 |
| D | PSV | 9,000 | 550 | 1,050 | 10,600 |
| B HALF | Refresher | 8,700 | 650 | 1,050 | 10,400 |
| C HALF | Upgrade | 9,000 | 550 | 1,050 | 10,600 |
| CE | Articulated | 35,000 | 550 | 1,050 | 36,600 |

## Implementation Steps

### Step 1: Update Database Schema

Run these SQL commands in your Cloudflare D1 database:

```sql
-- Add course fees columns
ALTER TABLE courses ADD COLUMN tuition INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN pdl_fee INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN test_fee INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN total_fee INTEGER DEFAULT 0;
ALTER TABLE courses ADD COLUMN duration TEXT;

-- Create tests table
CREATE TABLE IF NOT EXISTS tests (
  id TEXT PRIMARY KEY,
  course_id TEXT,
  module_id TEXT,
  title TEXT NOT NULL,
  description TEXT,
  passing_score INTEGER NOT NULL DEFAULT 70,
  time_limit INTEGER,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Create test questions table
CREATE TABLE IF NOT EXISTS test_questions (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_answer TEXT NOT NULL CHECK(correct_answer IN ('A', 'B', 'C', 'D')),
  position INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- Create test attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id TEXT PRIMARY KEY,
  test_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  passed INTEGER NOT NULL CHECK(passed IN (0, 1)),
  answers TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT NOT NULL,
  FOREIGN KEY (test_id) REFERENCES tests(id),
  FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Create certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_date TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES profiles(id),
  FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Add enrollment payment tracking
ALTER TABLE enrollments ADD COLUMN amount_paid INTEGER DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN amount_due INTEGER DEFAULT 0;
ALTER TABLE enrollments ADD COLUMN payment_status TEXT DEFAULT 'pending';

-- Insert default courses
INSERT INTO courses (id, title, category, description, tuition, pdl_fee, test_fee, total_fee, duration, archived, created_at, updated_at)
VALUES 
('class-a', 'Class A - Motorcycle', 'A', 'Motorcycle training for all types of motorcycles', 7500, 650, 1050, 9200, '4 weeks', 0, datetime('now'), datetime('now')),
('class-b', 'Class B - Light Private Vehicle', 'B', 'Standard car licence with theory and practical training', 12600, 650, 1050, 14300, '6 weeks', 0, datetime('now'), datetime('now')),
('class-c', 'Class C - Heavy Goods Vehicle', 'C', 'Truck and heavy goods vehicle licence', 13600, 650, 1050, 15300, '8 weeks', 0, datetime('now'), datetime('now')),
('class-d', 'Class D - Public Service Vehicle', 'D', 'PSV licence for buses and matatus', 9000, 550, 1050, 10600, '6 weeks', 0, datetime('now'), datetime('now')),
('class-b-half', 'Class B HALF - Refresher Course', 'B HALF', 'Refresher training for existing licence holders', 8700, 650, 1050, 10400, '3 weeks', 0, datetime('now'), datetime('now')),
('class-c-half', 'Class C HALF - Upgrade Training', 'C HALF', 'Upgrade from Class B to Class C', 9000, 550, 1050, 10600, '4 weeks', 0, datetime('now'), datetime('now')),
('class-ce', 'Class CE - Articulated Vehicle', 'CE', 'Training for articulated trucks and trailers', 35000, 550, 1050, 36600, '10 weeks', 0, datetime('now'), datetime('now'));
```

### Step 2: File Structure

Create these new files:

```
src/
├── components/
│   └── AdminLayout.tsx (✅ Created)
├── pages/
│   └── admin/
│       ├── Dashboard.tsx
│       ├── CoursesManagement.tsx
│       ├── CourseModules.tsx
│       ├── ModuleLessons.tsx
│       ├── StudentsManagement.tsx
│       ├── InstructorsManagement.tsx
│       ├── TestsManagement.tsx
│       ├── CreateTest.tsx
│       ├── CertificatesManagement.tsx
│       ├── PaymentsManagement.tsx
│       ├── ScheduleManagement.tsx
│       └── SchoolInfo.tsx
└── lib/
    └── admin-api-client.ts
```

### Step 3: Key Features

#### A. Courses Management
- **Create Course**: Form with title, category, description, fees, duration
- **Edit Course**: Update any course details
- **Delete Course**: Soft delete (archive)
- **View Modules**: Click course to see modules
- **Add Module**: Add modules to course with order
- **Add Lessons**: Add PDF/Video/Text lessons to modules

#### B. Student Management
- **Create Student**: Admin-only, generates temp password
- **Enroll Student**: Select course, set payment plan
- **View Progress**: See completed modules/lessons
- **Reset Password**: Generate new temp password
- **Deactivate**: Disable student access

#### C. Tests System
- **Create Test**: Link to course/module
- **Add Questions**: Multiple choice (A, B, C, D)
- **Set Passing Score**: Default 70%
- **Time Limit**: Optional timer
- **Auto-Grade**: Instant results
- **View Attempts**: See all student attempts

#### D. Certificates
- **Auto-Generate**: When student completes:
  - All modules in course
  - Passes final test (if exists)
- **Certificate Number**: Auto-generated unique ID
- **PDF Download**: Printable certificate
- **Fields**: Student name, course, date, certificate number

### Step 4: API Endpoints Needed

Add to `src/api-handler.ts`:

```typescript
// Courses CRUD
POST /api/admin/courses - Create course
PUT /api/admin/courses/:id - Update course
DELETE /api/admin/courses/:id - Delete course
GET /api/admin/courses/:id/modules - Get modules
POST /api/admin/courses/:id/modules - Create module
PUT /api/admin/modules/:id - Update module
DELETE /api/admin/modules/:id - Delete module

// Lessons CRUD
POST /api/admin/modules/:id/lessons - Create lesson
PUT /api/admin/lessons/:id - Update lesson
DELETE /api/admin/lessons/:id - Delete lesson
POST /api/admin/lessons/:id/upload - Upload PDF

// Students
POST /api/admin/students - Create student
POST /api/admin/students/:id/enroll - Enroll in course
POST /api/admin/students/:id/reset-password - Reset password
PUT /api/admin/students/:id - Update student
DELETE /api/admin/students/:id - Deactivate student

// Tests
POST /api/admin/tests - Create test
POST /api/admin/tests/:id/questions - Add question
PUT /api/admin/tests/:id - Update test
DELETE /api/admin/tests/:id - Delete test
GET /api/admin/tests/:id/attempts - View attempts

// Certificates
GET /api/admin/certificates - List all certificates
POST /api/admin/certificates/generate/:userId/:courseId - Generate certificate
GET /api/admin/certificates/:id/download - Download PDF
```

### Step 5: Remove Public Signup

Update `src/App.tsx`:
- Remove `/signup` route
- Add message: "Contact admin to create account"
- Keep `/login` for students to login with credentials

### Step 6: Student Portal Changes

Students see:
- Dashboard (their progress)
- My Courses (enrolled courses only)
- Lessons (view content, mark complete)
- Tests (take tests, view results)
- My Certificates (download)
- Payments (view payment status)
- Schedule (book lessons with instructors)

NO ACCESS TO:
- Create courses
- Manage other students
- Create tests
- Generate certificates

## Security

1. **Role-Based Access**:
   - All `/admin/*` routes require `admin` or `instructor` role
   - Students redirected to `/dashboard` if they try to access admin routes

2. **API Protection**:
   - All admin API endpoints check for admin role
   - Return 403 Forbidden if not admin

3. **Password Security**:
   - Temp passwords are strong (12 chars, mixed case, numbers, symbols)
   - Force password change on first login

## Next Steps

1. Run the SQL schema updates
2. Create the admin pages (I can provide full code)
3. Update API handler with new endpoints
4. Remove public signup route
5. Test admin workflows
6. Deploy to Cloudflare

## Estimated Implementation Time

- Database updates: 30 minutes
- Admin pages: 4-6 hours
- API endpoints: 3-4 hours
- Testing: 2 hours
- **Total: 1-2 days of development**

Would you like me to proceed with creating all the admin pages and API endpoints?
