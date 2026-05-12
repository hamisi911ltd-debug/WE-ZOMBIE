# Apply Student Fields Migration

## What This Does
This migration adds new fields to the profiles table:
- `id_number` - National ID or Passport number
- `date_of_birth` - Student's date of birth
- `address` - Student's full address

## How to Apply

### Option 1: Using the Batch File (Windows)
Double-click `apply-student-fields-migration.bat`

### Option 2: Using Command Line
```bash
npx wrangler d1 execute immacurate-driving-school-db --remote --file=migrations/add-student-fields.sql
```

### Option 3: Using Cloudflare Dashboard
1. Go to https://dash.cloudflare.com
2. Navigate to Workers & Pages > D1
3. Select your database: `immacurate-driving-school-db`
4. Go to "Console" tab
5. Copy and paste these commands one by one:

```sql
ALTER TABLE profiles ADD COLUMN id_number TEXT;
ALTER TABLE profiles ADD COLUMN date_of_birth TEXT;
ALTER TABLE profiles ADD COLUMN address TEXT;
```

6. Click "Execute" after each command

## Verify Migration
After applying, you can verify by running this query in the D1 console:
```sql
PRAGMA table_info(profiles);
```

You should see the new columns listed.
