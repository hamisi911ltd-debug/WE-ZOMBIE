# Fix 500 Error - Database Migrations Required

## 🔴 Problem

Your app is showing a **500 Internal Server Error** because the database tables haven't been created yet.

The Worker is deployed, but the D1 database is empty and needs the schema to be applied.

---

## ✅ Solution: Apply Database Migrations

You need to run the database migrations to create all the required tables.

### Step 1: Apply Migrations to Remote Database

Open your terminal and run:

```bash
wrangler d1 migrations apply we-zombie --remote
```

This will create all the necessary tables:
- `profiles` (users)
- `courses`
- `modules`
- `lessons`
- `enrollments`
- `lesson_progress`
- `payments`
- `schedule_entries`
- `user_roles`
- `notification_preferences`

### Step 2: Verify Tables Were Created

```bash
wrangler d1 execute we-zombie --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

You should see all 10 tables listed.

### Step 3: Test Your Site

Visit: https://immacurate.co.ke

The 500 error should be gone!

---

## 🔧 Alternative: Manual SQL Execution

If the migrations command doesn't work, you can execute the SQL directly:

```bash
wrangler d1 execute we-zombie --remote --file=migrations/0000_safe_frog_thor.sql
```

---

## 🧪 Verify Database Connection

Test that the database is working:

```bash
# Check if tables exist
wrangler d1 execute we-zombie --remote --command "SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'"

# Check profiles table
wrangler d1 execute we-zombie --remote --command "SELECT COUNT(*) FROM profiles"
```

---

## 📋 What the Migration Creates

The migration file (`migrations/0000_safe_frog_thor.sql`) creates:

### Tables
1. **profiles** - User accounts (students, instructors, admins)
2. **courses** - Driving courses (Category B, Category C, etc.)
3. **modules** - Course modules (lessons grouped by topic)
4. **lessons** - Individual lessons (theory, practical)
5. **enrollments** - Student course enrollments
6. **lesson_progress** - Track lesson completion
7. **payments** - Payment records
8. **schedule_entries** - Lesson scheduling
9. **user_roles** - User role assignments
10. **notification_preferences** - User notification settings

### Indexes
- Unique index on `profiles.email`

---

## 🚨 Why This Happened

When you deployed the Worker, it uploaded the code but didn't automatically run the database migrations. This is by design - Cloudflare requires you to explicitly apply migrations to prevent accidental data loss.

---

## 🔍 Troubleshooting

### If `wrangler` command not found

Install Wrangler globally:
```bash
npm install -g wrangler
```

### If authentication error

Login to Cloudflare:
```bash
wrangler login
```

### If database not found

Check your databases:
```bash
wrangler d1 list
```

You should see `we-zombie` in the list.

### If migration already applied error

That's fine! It means the tables already exist. Just verify:
```bash
wrangler d1 execute we-zombie --remote --command "SELECT name FROM sqlite_master WHERE type='table'"
```

---

## 🎯 Quick Fix Commands

Run these in order:

```bash
# 1. Apply migrations
wrangler d1 migrations apply we-zombie --remote

# 2. Verify tables
wrangler d1 execute we-zombie --remote --command "SELECT COUNT(*) FROM sqlite_master WHERE type='table'"

# 3. Test the site
curl https://immacurate.co.ke
```

---

## 📊 Expected Output

After running migrations, you should see:

```
🌀 Executing on remote database we-zombie (b31da365-97d1-4155-9214-c2ec8c886766):
🌀 To execute on your local development database, remove the --remote flag from your wrangler command.
🚣 Executed 1 migration(s) in 0.45 seconds
┌────────────────────────────────────────┐
│ name                                   │
├────────────────────────────────────────┤
│ 0000_safe_frog_thor                    │
└────────────────────────────────────────┘
```

---

## ✅ After Migrations Applied

Your site will work perfectly:
- ✅ Landing page loads
- ✅ Login/signup works
- ✅ Dashboard displays
- ✅ Courses can be browsed
- ✅ Payments can be processed
- ✅ Scheduling works

---

## 🔐 Create Admin User (Optional)

After migrations, you can create an admin user:

```bash
wrangler d1 execute we-zombie --remote --command "
INSERT INTO profiles (id, email, password_hash, full_name, created_at, updated_at) 
VALUES ('admin-001', 'admin@tacodriving.com', '\$2a\$10\$placeholder', 'Admin User', datetime('now'), datetime('now'));

INSERT INTO user_roles (id, user_id, role, created_at) 
VALUES ('role-001', 'admin-001', 'admin', datetime('now'));
"
```

Note: You'll need to hash a real password. Use the signup page instead!

---

## 📞 Still Having Issues?

### Check Worker Logs
```bash
wrangler tail --name we-zombie
```

Then visit your site and watch for errors.

### Check Database Binding
```bash
wrangler deployments list --name we-zombie
```

Verify that `DB` binding is listed.

### Redeploy if Needed
```bash
npm run deploy
```

---

## 🎯 Summary

**The Fix:**
```bash
wrangler d1 migrations apply we-zombie --remote
```

**Then test:**
```bash
curl https://immacurate.co.ke
```

**Expected result:** Your site loads without 500 errors! 🎉

---

*This is a one-time setup. Once migrations are applied, your database is ready forever.*
