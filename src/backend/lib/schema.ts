import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  fullName: text('full_name'),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const userRoles = sqliteTable('user_roles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id),
  role: text('role').notNull(), // 'admin', 'instructor', 'student'
  createdAt: text('created_at').notNull(),
});

export const courses = sqliteTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  archived: integer('archived', { mode: 'boolean' }).default(false).notNull(),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const modules = sqliteTable('modules', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull().references(() => courses.id),
  title: text('title').notNull(),
  description: text('description'),
  position: integer('position').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull().references(() => modules.id),
  title: text('title').notNull(),
  body: text('body'),
  lessonType: text('lesson_type').notNull(), // 'theory', 'practical'
  contentType: text('content_type').notNull(), // 'text', 'video', 'pdf'
  contentUrl: text('content_url'),
  position: integer('position').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const enrollments = sqliteTable('enrollments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id),
  courseId: text('course_id').notNull().references(() => courses.id),
  status: text('status').notNull(),
  enrolledAt: text('enrolled_at').notNull(),
});

export const lessonProgress = sqliteTable('lesson_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id),
  lessonId: text('lesson_id').notNull().references(() => lessons.id),
  completed: integer('completed', { mode: 'boolean' }).notNull().default(false),
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const scheduleEntries = sqliteTable('schedule_entries', {
  id: text('id').primaryKey(),
  instructorId: text('instructor_id').notNull().references(() => profiles.id),
  studentId: text('student_id').references(() => profiles.id),
  moduleId: text('module_id').references(() => modules.id),
  scheduledDate: text('scheduled_date').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => profiles.id),
  amount: integer('amount').notNull(),
  status: text('status').notNull(), // 'pending', 'paid', 'overdue'
  dueDate: text('due_date').notNull(),
  proofUrl: text('proof_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const notificationPreferences = sqliteTable('notification_preferences', {
  userId: text('user_id').primaryKey().references(() => profiles.id),
  emailReminders: integer('email_reminders', { mode: 'boolean' }).notNull().default(true),
  updatedAt: text('updated_at').notNull(),
});
