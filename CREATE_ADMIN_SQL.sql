-- Run these commands in Cloudflare D1 Console
-- Go to: Cloudflare Dashboard > D1 > we-zombie > Console

-- Step 1: Delete any existing admin accounts
DELETE FROM user_roles WHERE user_id IN (
  SELECT id FROM profiles WHERE email LIKE '%admin%' OR email LIKE '%hamisi%'
);

DELETE FROM profiles WHERE email LIKE '%admin%' OR email LIKE '%hamisi%';

-- Step 2: Create new admin account
-- Password: Admin123!
INSERT INTO profiles (
  id, 
  email, 
  password_hash, 
  full_name, 
  phone, 
  created_at, 
  updated_at
) VALUES (
  'admin-2026', 
  'admin@immacurate.co.ke', 
  '$2b$10$QcMhNu6cwoXr9ZXfLvabjeH4R2RTc8XDJxTQAyP2ubHjhfXBf5Ylu', 
  'Admin User', 
  '0721171911', 
  datetime('now'), 
  datetime('now')
);

-- Step 3: Assign admin role
INSERT INTO user_roles (
  id, 
  user_id, 
  role, 
  created_at
) VALUES (
  'role-admin-2026', 
  'admin-2026', 
  'admin', 
  datetime('now')
);

-- Step 4: Verify the account was created
SELECT p.id, p.email, p.full_name, ur.role 
FROM profiles p 
LEFT JOIN user_roles ur ON p.id = ur.user_id 
WHERE p.email = 'admin@immacurate.co.ke';
