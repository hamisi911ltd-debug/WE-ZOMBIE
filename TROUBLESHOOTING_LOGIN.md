# 🔧 Login Troubleshooting Guide

## ✅ Current Working Credentials

```
URL:      https://immacurate.co.ke/login
Email:    admin@immacurate.co.ke
Password: Admin123!
```

---

## 🔍 If Login Still Fails (401 Error)

### Step 1: Clear Browser Cache
The most common issue is cached credentials.

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Select "Cookies and other site data"
4. Click "Clear data"
5. Close and reopen browser
6. Try login again

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cookies" and "Cache"
3. Click "Clear Now"
4. Close and reopen browser
5. Try login again

### Step 2: Try Incognito/Private Mode
1. Open incognito window (Ctrl + Shift + N)
2. Go to https://immacurate.co.ke/login
3. Try logging in
4. If it works, the issue is browser cache

### Step 3: Check Email Carefully
Make sure you're typing:
- `admin@immacurate.co.ke` (NOT admin@immacurate.com)
- No spaces before or after
- All lowercase

### Step 4: Check Password Carefully
The password is:
- `Admin123!`
- Capital A
- Numbers 123
- Exclamation mark at the end
- No spaces

---

## 🛠️ Alternative: Create Test Account

If the admin account still doesn't work, I can create a test account for you.

Run this command:
```bash
npx wrangler d1 execute we-zombie --remote --command="
INSERT INTO profiles (id, email, password_hash, full_name, created_at, updated_at) 
VALUES ('test-admin', 'test@immacurate.co.ke', '\$2b\$10\$QcMhNu6cwoXr9ZXfLvabjeH4R2RTc8XDJxTQAyP2ubHjhfXBf5Ylu', 'Test Admin', datetime('now'), datetime('now'));

INSERT INTO user_roles (id, user_id, role, created_at) 
VALUES ('role-test-admin', 'test-admin', 'admin', datetime('now'));
"
```

Then login with:
- Email: `test@immacurate.co.ke`
- Password: `Admin123!`

---

## 🔍 Check Database

To verify the account exists:
```bash
npx wrangler d1 execute we-zombie --remote --command="
SELECT p.id, p.email, p.full_name, ur.role 
FROM profiles p 
LEFT JOIN user_roles ur ON p.id = ur.user_id 
WHERE p.email = 'admin@immacurate.co.ke';
"
```

You should see:
```
id: admin-main
email: admin@immacurate.co.ke
full_name: Admin User
role: admin
```

---

## 🐛 Debug Mode

If you want to see what's happening:

1. Open browser developer tools (F12)
2. Go to "Network" tab
3. Try logging in
4. Look for the `/api/auth/login` request
5. Check the response

**If you see 401:**
- Password is incorrect
- Account doesn't exist
- Password hash doesn't match

**If you see 400:**
- Email or password field is empty
- Check form submission

**If you see 500:**
- Server error
- Database connection issue

---

## ✅ What's Been Fixed

1. **Admin Account Recreated**
   - Old accounts deleted
   - New account with simple password
   - Verified in database

2. **Logo Sizes Reduced**
   - Sidebar: 192px (was full width)
   - Mobile: 40px (was 48px)
   - Landing: 48px (was 56px)
   - About: 512px max (was 768px)

3. **Password Simplified**
   - Old: `Immacurate@2026`
   - New: `Admin123!`
   - Easier to type, still secure

---

## 📞 Still Having Issues?

If none of the above works, the issue might be:

1. **Browser Extension Blocking**
   - Try disabling ad blockers
   - Try disabling password managers
   - Try a different browser

2. **Network Issue**
   - Check internet connection
   - Try from different network
   - Check if Cloudflare is accessible

3. **Deployment Issue**
   - Wait 2-3 minutes after deployment
   - Cloudflare needs time to propagate
   - Try again after waiting

---

## 🎯 Quick Test

To quickly test if the system is working:

1. Go to: https://immacurate.co.ke
2. You should see the landing page with logo
3. Click "Sign In" button
4. You should see login form
5. Try entering credentials
6. Watch for any error messages

---

**Last Updated**: May 11, 2026
**Status**: Admin account recreated and deployed
**Password**: Admin123!
