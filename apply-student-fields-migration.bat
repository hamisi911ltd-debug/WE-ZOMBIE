@echo off
echo Applying student fields migration...
npx wrangler d1 execute immacurate-driving-school-db --remote --file=migrations/add-student-fields.sql
echo Migration applied!
pause
