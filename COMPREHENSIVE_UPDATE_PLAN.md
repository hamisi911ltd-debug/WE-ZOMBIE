# Comprehensive System Update Plan

## Overview
This document outlines all the requested changes and their implementation status.

## ✅ COMPLETED CHANGES

### 1. Sidebar Width Reduced
- **Before:** 288px (w-72)
- **After:** 224px (w-56)
- **Status:** ✅ DONE
- **Files:** `src/components/AdminLayout.tsx`, `src/components/SideNavLayout.tsx`

### 2. Logo Optimized
- **Desktop Sidebar:** 64px (w-16)
- **Mobile Header:** 24px (h-6)
- **Status:** ✅ DONE
- **Files:** Both layout components

### 3. Mobile Header Optimized
- **Padding:** Reduced to p-2
- **Logo:** Reduced to h-6
- **Status:** ✅ DONE

### 4. Payment Schema Updated
- Added `payment_method` (bank/mpesa/cash)
- Added `transaction_ref` (M-Pesa code/bank ref)
- Added `paid_date`
- Added `recorded_by` (admin ID)
- Added `notes`
- **Status:** ✅ SCHEMA UPDATED
- **Migration:** `migrations/update-payments-schema.sql`

## 🔄 IN PROGRESS / TODO

### 5. Payment Functionality Enhancement
**Requirements:**
- Admin can record payments (Bank/M-Pesa/Cash)
- Generate receipts with payment details
- Real-time payment tracking
- Payment method selection

**Implementation Needed:**
- [ ] Create `src/pages/admin/PaymentsManagement.tsx`
- [ ] Add payment recording form
- [ ] Update API handler with payment endpoints
- [ ] Generate PDF receipts
- [ ] Add M-Pesa transaction validation

### 6. Currency Change to KES
**Requirements:**
- Change all $ to KES
- Update prices on landing page
- Update payment displays
- Format: KES 14,300

**Files to Update:**
- [ ] `src/pages/Landing.tsx` - All prices
- [ ] `src/pages/Payments.tsx` - Display format
- [ ] `src/pages/admin/CoursesManagement.tsx` - Course fees
- [ ] `src/backend/lib/payments.ts` - Receipt format
- [ ] All components showing money

### 7. Student Login with Phone as Password
**Requirements:**
- Students can only login after enrollment by admin
- Login: Email + Phone number as password
- No public signup for students

**Implementation Needed:**
- [ ] Update `handleLogin` in `src/api-handler.ts`
- [ ] Modify login validation to check phone
- [ ] Disable public signup route
- [ ] Update `src/pages/Login.tsx` UI
- [ ] Add enrollment status check

### 8. User Management for Admin
**Requirements:**
- Admin can manage all users
- View/Edit/Delete users
- Assign roles
- Reset passwords

**Implementation Needed:**
- [ ] Create `src/pages/admin/UsersManagement.tsx`
- [ ] Add user CRUD API endpoints
- [ ] Role management interface
- [ ] Password reset functionality

### 9. Landing Page Updates
**Requirements:**
- Update all details to Immacurate
- Change prices to KES
- Update contact information
- Update course details

**Already Done:**
- ✅ Contact info (Phone, Email, Address)
- ✅ Branding (Immacurate Driving School)

**Still Needed:**
- [ ] Convert prices to KES
- [ ] Update course descriptions
- [ ] Add real course fees from image

### 10. Mobile View Perfect Sizing
**Already Done:**
- ✅ Mobile CSS for text sizes
- ✅ Mobile CSS for padding
- ✅ Mobile CSS for spacing
- ✅ Reduced logo sizes
- ✅ Optimized header

**Additional Needed:**
- [ ] Test all pages on mobile
- [ ] Fine-tune specific components
- [ ] Ensure tables are responsive
- [ ] Check forms on mobile

## 📋 IMPLEMENTATION PRIORITY

### HIGH PRIORITY (Do First)
1. ✅ Sidebar width reduction
2. ✅ Logo optimization
3. ✅ Mobile header optimization
4. ✅ Payment schema update
5. 🔄 Currency change to KES (NEXT)
6. 🔄 Student login with phone (NEXT)

### MEDIUM PRIORITY
7. Payment functionality enhancement
8. User management for admin
9. Landing page price updates

### LOW PRIORITY
10. Additional mobile optimizations
11. PDF receipt generation
12. M-Pesa integration

## 🎯 NEXT STEPS

### Immediate Actions:
1. Apply payment schema migration
2. Update all currency displays to KES
3. Modify student login to use phone as password
4. Disable public signup
5. Create user management page
6. Create payment management page

### Files That Need Major Updates:
- `src/api-handler.ts` - Login logic, payment endpoints
- `src/pages/Landing.tsx` - Prices to KES
- `src/pages/Login.tsx` - Phone as password
- `src/pages/Payments.tsx` - KES display
- `src/pages/admin/CoursesManagement.tsx` - KES fees
- NEW: `src/pages/admin/PaymentsManagement.tsx`
- NEW: `src/pages/admin/UsersManagement.tsx`

## 📝 NOTES

### Currency Conversion
- Current: USD ($)
- New: Kenyan Shillings (KES)
- Format: `KES 14,300` or `KSh 14,300`
- Store in cents (multiply by 100)

### Phone as Password
- Phone format: +254712345678 or 0712345678
- Hash phone number like password
- Validate format on login
- Students cannot change phone (security)

### Payment Methods
- **Bank Transfer:** Requires bank reference
- **M-Pesa:** Requires M-Pesa transaction code
- **Cash:** Requires receipt number
- All recorded by admin with timestamp

### User Management
- Admins can create/edit/delete users
- Assign roles: admin, instructor, student
- Reset passwords
- View user activity
- Manage enrollments

## 🚀 DEPLOYMENT CHECKLIST

Before deploying:
- [ ] Apply database migration
- [ ] Test login with phone
- [ ] Test payment recording
- [ ] Verify KES display everywhere
- [ ] Test mobile view
- [ ] Test user management
- [ ] Generate test receipts
- [ ] Verify admin permissions

## 📊 ESTIMATED WORK

- Currency updates: 30 minutes
- Login changes: 45 minutes
- Payment management: 2 hours
- User management: 2 hours
- Testing: 1 hour
- **Total: ~6 hours**

## 🔗 RELATED FILES

### Layouts
- `src/components/AdminLayout.tsx` ✅
- `src/components/SideNavLayout.tsx` ✅
- `src/components/AuthenticatedLayout.tsx`

### Pages
- `src/pages/Landing.tsx` (needs KES update)
- `src/pages/Login.tsx` (needs phone login)
- `src/pages/Payments.tsx` (needs KES display)
- `src/pages/admin/CoursesManagement.tsx` (needs KES)
- `src/pages/admin/PaymentsManagement.tsx` (NEW - needs creation)
- `src/pages/admin/UsersManagement.tsx` (NEW - needs creation)

### Backend
- `src/api-handler.ts` (needs major updates)
- `src/backend/lib/schema.ts` ✅
- `src/backend/lib/payments.ts` (needs KES update)

### Migrations
- `migrations/update-payments-schema.sql` ✅

---

**Status:** 4/10 tasks completed
**Next:** Currency conversion + Phone login
