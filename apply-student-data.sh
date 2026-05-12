#!/bin/bash

echo "Applying student data to database..."
echo

# Check if wrangler is available
if ! command -v wrangler &> /dev/null; then
    echo "Error: Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Apply the SQL file to D1 database
echo "Executing SQL script..."
wrangler d1 execute DB --file=insert-students.sql

if [ $? -eq 0 ]; then
    echo
    echo "✓ Successfully inserted student data!"
    echo
    echo "Summary:"
    echo "- 30 students added to database"
    echo "- Payment records created for each student"
    echo "- Students enrolled in appropriate courses"
    echo
    echo "You can now view the students in your admin panel."
else
    echo
    echo "✗ Error occurred during insertion."
    echo "Please check the error messages above."
fi