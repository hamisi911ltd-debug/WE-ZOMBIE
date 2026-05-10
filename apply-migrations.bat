@echo off
REM Apply Database Migrations to Cloudflare D1
REM This script fixes the 500 error by creating database tables

echo 🚀 Applying database migrations to we-zombie...
echo.

REM Apply migrations
echo 📦 Running migrations...
wrangler d1 migrations apply we-zombie --remote

echo.
echo ✅ Checking if tables were created...
wrangler d1 execute we-zombie --remote --command "SELECT name FROM sqlite_master WHERE type='table'"

echo.
echo 📊 Counting tables...
wrangler d1 execute we-zombie --remote --command "SELECT COUNT(*) as table_count FROM sqlite_master WHERE type='table'"

echo.
echo 🎉 Done! Your database is ready.
echo.
echo 🌐 Test your site: https://immacurate.co.ke
pause
