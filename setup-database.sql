-- Create all database tables for Taco Driving School

-- Profiles table (users)
CREATE TABLE IF NOT EXISTS profiles (
    id text PRIMARY KEY NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    avatar_url text,
    full_name text,
    phone text,
    created_at text NOT NULL,
    updated_at text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles (email);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    description text,
    category text,
    archived integer DEFAULT 0 NOT NULL,
    created_by text,
    created_at text NOT NULL,
    updated_at text NOT NULL
);

-- Modules table
CREATE TABLE IF NOT EXISTS modules (
    id text PRIMARY KEY NOT NULL,
    course_id text NOT NULL,
    title text NOT NULL,
    description text,
    position integer NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Lessons table
CREATE TABLE IF NOT EXISTS lessons (
    id text PRIMARY KEY NOT NULL,
    module_id text NOT NULL,
    title text NOT NULL,
    body text,
    lesson_type text NOT NULL,
    content_type text NOT NULL,
    content_url text,
    position integer NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    course_id text NOT NULL,
    status text NOT NULL,
    enrolled_at text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id),
    FOREIGN KEY (course_id) REFERENCES courses(id)
);

-- Lesson progress table
CREATE TABLE IF NOT EXISTS lesson_progress (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    lesson_id text NOT NULL,
    completed integer DEFAULT 0 NOT NULL,
    completed_at text,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id),
    FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    amount integer NOT NULL,
    status text NOT NULL,
    due_date text NOT NULL,
    proof_url text,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Schedule entries table
CREATE TABLE IF NOT EXISTS schedule_entries (
    id text PRIMARY KEY NOT NULL,
    instructor_id text NOT NULL,
    student_id text,
    module_id text,
    scheduled_date text NOT NULL,
    start_time text NOT NULL,
    end_time text NOT NULL,
    created_at text NOT NULL,
    updated_at text NOT NULL,
    FOREIGN KEY (instructor_id) REFERENCES profiles(id),
    FOREIGN KEY (student_id) REFERENCES profiles(id),
    FOREIGN KEY (module_id) REFERENCES modules(id)
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id text PRIMARY KEY NOT NULL,
    user_id text NOT NULL,
    role text NOT NULL,
    created_at text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);

-- Notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
    user_id text PRIMARY KEY NOT NULL,
    email_reminders integer DEFAULT 1 NOT NULL,
    updated_at text NOT NULL,
    FOREIGN KEY (user_id) REFERENCES profiles(id)
);
