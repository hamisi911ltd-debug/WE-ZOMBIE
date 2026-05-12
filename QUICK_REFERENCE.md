# Quick Reference - Students Management

## Student Actions

| Action | Button | What It Does |
|--------|--------|--------------|
| **View** | 👁️ Eye icon | Opens modal showing all student details |
| **Edit** | ✏️ Edit icon | Opens form to update student information |
| **Delete** | 🗑️ Trash icon | Permanently removes student (with confirmation) |
| **Add** | ➕ Add Student button | Opens form to create new student |

## Student Fields

### Required Fields (*)
- Full Name
- ID Number (National ID/Passport)
- Email
- Phone

### Optional Fields
- Date of Birth
- Address
- Course Enrollment

## Search
Search box finds students by:
- Name
- Email
- ID Number

## Status Types
- 🟢 **Active** - Currently enrolled
- 🔵 **Completed** - Finished courses
- ⚪ **Inactive** - No enrollments

## Important Rules

1. **Email is permanent** - Cannot be changed after creation
2. **Delete is permanent** - Removes all student data
3. **Temp password** - Generated automatically for new students
4. **Admin only** - Requires admin or instructor role

## Common Tasks

### Add a New Student
1. Click "Add Student"
2. Fill required fields (marked with *)
3. Optionally select a course
4. Click "Add Student"
5. Save the temporary password shown

### Update Student Info
1. Click edit icon (✏️)
2. Change desired fields
3. Click "Save Changes"

### View Full Details
1. Click eye icon (👁️)
2. Review all information
3. Click "Edit Student" to make changes
4. Click "Close" to return

### Remove a Student
1. Click delete icon (🗑️)
2. Confirm deletion
3. Student is permanently removed

## Troubleshooting

**Can't see students?**
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check you're logged in as admin

**400 Error?**
- Make sure all required fields are filled
- Check ID number is provided
- Verify email format is correct

**Changes not saving?**
- Check internet connection
- Look for error messages
- Try refreshing the page

## API Endpoints

- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student

## Database Fields

```
profiles table:
- id (UUID)
- email (unique)
- full_name
- phone
- id_number (NEW)
- date_of_birth (NEW)
- address (NEW)
- password_hash
- created_at
- updated_at
```

---

**Need help?** Check `STUDENTS_UPDATE_SUMMARY.md` for detailed information.
