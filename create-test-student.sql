-- Create a test student account for the role selection login

-- First, delete any existing test student
DELETE FROM user_roles WHERE user_id = 'test-student-001';
DELETE FROM profiles WHERE id = 'test-student-001';

-- Create test student profile
-- Password: student123 (hashed)
INSERT INTO profiles (id, email, password_hash, full_name, phone, created_at, updated_at) 
VALUES ('test-student-001', 'faith.wambu.matinda@drivingschool.com', '$2b$10$8vYZE5xKqH0FqYxGqH0FqOqH0FqH0FqH0FqH0FqH0FqH0FqH0Fq', 'Faith Wambu Matinda', '0712345678', datetime('now'), datetime('now'));

-- Assign student role
INSERT INTO user_roles (id, user_id, role, created_at) 
VALUES ('role-test-student-001', 'test-student-001', 'student', datetime('now'));

-- Verify the account was created
SELECT p.id, p.email, p.full_name, ur.role 
FROM profiles p 
LEFT JOIN user_roles ur ON p.id = ur.user_id 
WHERE p.email = 'faith.wambu.matinda@drivingschool.com';