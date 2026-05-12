@echo off
echo Applying student data to database...
echo.

REM Check if wrangler is available
where wrangler >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Error: Wrangler CLI not found. Please install it first:
    echo npm install -g wrangler
    exit /b 1
)

REM Apply the SQL file to D1 database
echo Executing SQL script...
wrangler d1 execute DB --file=insert-students.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Successfully inserted student data!
    echo.
    echo Summary:
    echo - 30 students added to database
    echo - Payment records created for each student
    echo - Students enrolled in appropriate courses
    echo.
    echo You can now view the students in your admin panel.
) else (
    echo.
    echo ✗ Error occurred during insertion.
    echo Please check the error messages above.
)

pause