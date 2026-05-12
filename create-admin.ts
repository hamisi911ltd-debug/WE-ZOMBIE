// Script to create admin account
// Run this with: npx tsx create-admin.ts

import bcrypt from 'bcryptjs';

const adminEmail = 'hamisi.911.ltd@gmail.com';
const adminPassword = 'Admin@123'; // Change this after first login
const adminName = 'Administrator';

async function createAdmin() {
  console.log('Creating admin account...');
  console.log('Email:', adminEmail);
  console.log('Password:', adminPassword);
  console.log('\nIMPORTANT: Change the password after first login!');
  
  const passwordHash = await bcrypt.hash(adminPassword, 10);
  const userId = crypto.randomUUID();
  const roleId = crypto.randomUUID();
  const now = new Date().toISOString();
  
  console.log('\n=== SQL TO RUN IN D1 DATABASE ===\n');
  
  console.log(`-- Insert admin profile
INSERT INTO profiles (id, email, password_hash, full_name, created_at, updated_at)
VALUES ('${userId}', '${adminEmail}', '${passwordHash}', '${adminName}', '${now}', '${now}');

-- Assign admin role
INSERT INTO user_roles (id, user_id, role, created_at)
VALUES ('${roleId}', '${userId}', 'admin', '${now}');
`);
  
  console.log('\n=== HOW TO RUN ===');
  console.log('1. Copy the SQL above');
  console.log('2. Run: npx wrangler d1 execute we-zombie --remote --command="<paste SQL here>"');
  console.log('   OR use the Cloudflare dashboard to execute the SQL');
  console.log('\n3. Login with:');
  console.log('   Email:', adminEmail);
  console.log('   Password:', adminPassword);
  console.log('\n4. CHANGE THE PASSWORD IMMEDIATELY AFTER LOGIN!');
}

createAdmin();
