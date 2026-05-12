-- Admin System Migration
-- Run this in Cloudflare D1 database

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
INSERT OR REPLACE INTO courses (id, title, category, description, tuition, pdl_fee, test_fee, total_fee, duration, archived, created_at, updated_at)
VALUES 
('class-a', 'Class A - Motorcycle', 'A', 'Motorcycle training for all types of motorcycles', 7500, 650, 1050, 9200, '4 weeks', 0, datetime('now'), datetime('now')),
('class-b', 'Class B - Light Private Vehicle', 'B', 'Standard car licence with theory and practical training', 12600, 650, 1050, 14300, '6 weeks', 0, datetime('now'), datetime('now')),
('class-c', 'Class C - Heavy Goods Vehicle', 'C', 'Truck and heavy goods vehicle licence', 13600, 650, 1050, 15300, '8 weeks', 0, datetime('now'), datetime('now')),
('class-d', 'Class D - Public Service Vehicle', 'D', 'PSV licence for buses and matatus', 9000, 550, 1050, 10600, '6 weeks', 0, datetime('now'), datetime('now')),
('class-b-half', 'Class B HALF - Refresher Course', 'B HALF', 'Refresher training for existing licence holders', 8700, 650, 1050, 10400, '3 weeks', 0, datetime('now'), datetime('now')),
('class-c-half', 'Class C HALF - Upgrade Training', 'C HALF', 'Upgrade from Class B to Class C', 9000, 550, 1050, 10600, '4 weeks', 0, datetime('now'), datetime('now')),
('class-ce', 'Class CE - Articulated Vehicle', 'CE', 'Training for articulated trucks and trailers', 35000, 550, 1050, 36600, '10 weeks', 0, datetime('now'), datetime('now'));
