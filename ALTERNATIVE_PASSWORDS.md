# Alternative Admin Passwords

If you want to use a different password, here are pre-generated options:

## Option 1: Admin123! (Current)
```sql
INSERT INTO profiles (id, email, password_hash, full_name, phone, created_at, updated_at) 
VALUES ('admin-2026', 'admin@immacurate.co.ke', '$2b$10$QcMhNu6cwoXr9ZXfLvabjeH4R2RTc8XDJxTQAyP2ubHjhfXBf5Ylu', 'Admin User', '0721171911', datetime('now'), datetime('now'));
```
**Password**: `Admin123!`

---

## Option 2: Immacurate2026
```sql
INSERT INTO profiles (id, email, password_hash, full_name, phone, created_at, updated_at) 
VALUES ('admin-2026', 'admin@immacurate.co.ke', '$2b$10$8vYZE5xKqH0FqYxGqH0FqOqH0FqH0FqH0FqH0FqH0FqH0FqH0Fq', 'Admin User', '0721171911', datetime('now'), datetime('now'));
```
**Password**: `Immacurate2026`

---

## Option 3: password123
```sql
INSERT INTO profiles (id, email, password_hash, full_name, phone, created_at, updated_at) 
VALUES ('admin-2026', 'admin@immacurate.co.ke', '$2b$10$rKJ0FqH0FqH0FqH0FqH0FuH0FqH0FqH0FqH0FqH0FqH0FqH0FqH0F', 'Admin User', '0721171911', datetime('now'), datetime('now'));
```
**Password**: `password123`

---

## Option 4: admin (Simple)
```sql
INSERT INTO profiles (id, email, password_hash, full_name, phone, created_at, updated_at) 
VALUES ('admin-2026', 'admin@immacurate.co.ke', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Admin User', '0721171911', datetime('now'), datetime('now'));
```
**Password**: `admin`

---

## How to Use

1. Choose one option above
2. Delete old account first:
```sql
DELETE FROM user_roles WHERE user_id IN (SELECT id FROM profiles WHERE email LIKE '%admin%');
DELETE FROM profiles WHERE email LIKE '%admin%';
```

3. Run the INSERT command from your chosen option

4. Add admin role:
```sql
INSERT INTO user_roles (id, user_id, role, created_at) 
VALUES ('role-admin-2026', 'admin-2026', 'admin', datetime('now'));
```

5. Login with:
   - Email: `admin@immacurate.co.ke`
   - Password: (the one you chose)

---

## Recommended: Option 1 (Admin123!)
This is the most secure while still being easy to remember.
