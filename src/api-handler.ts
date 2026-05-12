// API Handler for Cloudflare Worker
// Converts all TanStack Start server functions to REST endpoints

import { drizzle } from 'drizzle-orm/d1';
import * as schema from './backend/lib/schema';
import { eq, and, desc, asc, inArray, count } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode("super-secret-key-replace-in-prod");

interface Env {
  DB: D1Database;
}

// Helper to get session from cookie
async function getSession(request: Request): Promise<{ user: { id: string; email: string; fullName: string | null }; roles: string[] } | null> {
  const cookieHeader = request.headers.get('Cookie');
  if (!cookieHeader) return null;
  
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map(c => {
      const [key, ...v] = c.split('=');
      return [key, v.join('=')];
    })
  );
  
  const token = cookies.session;
  if (!token) return null;
  
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as any;
  } catch {
    return null;
  }
}

// Helper to set session cookie
function setSessionCookie(token: string): string {
  return `session=${token}; HttpOnly; Secure; Path=/; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
  'Access-Control-Allow-Credentials': 'true',
};

export async function handleAPI(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  const db = drizzle(env.DB, { schema });
  
  try {
    // Health check
    if (path === '/api/health') {
      return jsonResponse({ status: 'ok', db: !!env.DB });
    }
    
    // Auth endpoints
    if (path === '/api/auth/login' && method === 'POST') {
      return await handleLogin(request, db);
    }
    
    if (path === '/api/auth/signup' && method === 'POST') {
      return await handleSignup(request, db);
    }
    
    if (path === '/api/auth/logout' && method === 'POST') {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Set-Cookie': 'session=; HttpOnly; Secure; Path=/; Max-Age=0',
        },
      });
    }
    
    if (path === '/api/auth/session' && method === 'GET') {
      const session = await getSession(request);
      if (!session) {
        return jsonResponse(null);
      }
      
      // Get full profile and roles
      const { profiles, userRoles } = schema;
      const profile = await db.select({ fullName: profiles.fullName })
        .from(profiles)
        .where(eq(profiles.id, session.user.id))
        .get();
      
      const rolesData = await db.select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, session.user.id))
        .all();
      
      return jsonResponse({
        user: {
          id: session.user.id,
          email: session.user.email,
          fullName: profile?.fullName || null,
        },
        roles: rolesData.map(r => r.role),
      });
    }
    
    // Protected endpoints - require authentication
    const session = await getSession(request);
    
    // Dashboard stats
    if (path === '/api/dashboard/stats' && method === 'GET') {
      return await handleGetDashboardStats(db, session);
    }
    
    // Courses
    if (path === '/api/courses' && method === 'GET') {
      return await handleGetCourses(db, session);
    }
    
    if (path.match(/^\/api\/courses\/[^/]+$/) && method === 'GET') {
      const courseId = path.split('/')[3];
      return await handleGetCourseDetail(db, session, courseId);
    }
    
    // Modules
    if (path.match(/^\/api\/courses\/[^/]+\/modules\/[^/]+$/) && method === 'GET') {
      const [, , , courseId, , moduleId] = path.split('/');
      return await handleGetModuleDetail(db, session, courseId, moduleId);
    }
    
    // Lesson progress
    if (path === '/api/lesson-progress' && method === 'POST') {
      return await handleUpdateLessonProgress(request, db, session);
    }
    
    // Schedule
    if (path === '/api/schedule' && method === 'GET') {
      return await handleGetSchedule(db, session);
    }
    
    if (path === '/api/schedule' && method === 'POST') {
      return await handleCreateScheduleEntry(request, db, session);
    }
    
    // Payments
    if (path === '/api/payments' && method === 'GET') {
      return await handleGetPayments(db, session);
    }
    
    if (path === '/api/payments' && method === 'POST') {
      return await handleCreatePayment(request, db, session);
    }
    
    // Students (admin only)
    if (path === '/api/students' && method === 'GET') {
      return await handleGetStudents(db, session);
    }
    
    if (path === '/api/students' && method === 'POST') {
      return await handleCreateStudent(request, db, session);
    }
    
    if (path.match(/^\/api\/students\/[^/]+$/) && method === 'PUT') {
      const studentId = path.split('/')[3];
      return await handleUpdateStudent(request, db, session, studentId);
    }
    
    if (path.match(/^\/api\/students\/[^/]+$/) && method === 'DELETE') {
      const studentId = path.split('/')[3];
      return await handleDeleteStudent(db, session, studentId);
    }
    
    // ============================================
    // ADMIN API ROUTES
    // ============================================
    
    // Admin Users Management
    if (path === '/api/admin/users' && method === 'GET') {
      return await handleAdminGetUsers(db, session);
    }
    
    if (path === '/api/admin/users' && method === 'POST') {
      return await handleAdminCreateUser(request, db, session);
    }
    
    if (path.match(/^\/api\/admin\/users\/[^/]+$/) && method === 'DELETE') {
      const userId = path.split('/')[4];
      return await handleAdminDeleteUser(db, session, userId);
    }
    
    // Admin Payments Management
    if (path === '/api/admin/payments' && method === 'GET') {
      return await handleAdminGetPayments(db, session);
    }
    
    if (path === '/api/admin/payments' && method === 'POST') {
      return await handleAdminRecordPayment(request, db, session);
    }
    
    if (path.match(/^\/api\/admin\/payments\/[^/]+\/receipt$/) && method === 'GET') {
      const paymentId = path.split('/')[4];
      return await handleAdminGenerateReceipt(db, session, paymentId);
    }
    
    // Admin Courses Management
    if (path === '/api/admin/courses' && method === 'GET') {
      return await handleAdminGetCourses(db, session);
    }
    
    if (path === '/api/admin/courses' && method === 'POST') {
      return await handleAdminCreateCourse(request, db, session);
    }
    
    if (path.match(/^\/api\/admin\/courses\/[^/]+$/) && method === 'PUT') {
      const courseId = path.split('/')[4];
      return await handleAdminUpdateCourse(request, db, session, courseId);
    }
    
    if (path.match(/^\/api\/admin\/courses\/[^/]+$/) && method === 'DELETE') {
      const courseId = path.split('/')[4];
      return await handleAdminDeleteCourse(db, session, courseId);
    }
    
    return jsonResponse({ error: 'Not found' }, 404);
    
  } catch (error: any) {
    console.error('API Error:', error);
    return jsonResponse({ error: error.message || 'Internal server error' }, 500);
  }
}

// Auth handlers
async function handleLogin(request: Request, db: any): Promise<Response> {
  const body = await request.json();
  const { email, password } = body;
  
  if (!email || !password) {
    return jsonResponse({ error: 'Email and password required' }, 400);
  }
  
  const { profiles, userRoles } = schema;
  const user = await db.select().from(profiles).where(eq(profiles.email, email)).get();
  
  if (!user) {
    return jsonResponse({ error: 'Invalid credentials' }, 401);
  }
  
  // Check if user has student role
  const roles = await db.select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id))
    .all();
  
  const isStudent = roles.some(r => r.role === 'student');
  const isAdmin = roles.some(r => r.role === 'admin' || r.role === 'instructor');
  
  let valid = false;
  
  // For students: check if password matches phone number
  if (isStudent && !isAdmin) {
    // Students login with their phone number as password
    if (user.phone) {
      // Remove spaces and dashes from phone for comparison
      const cleanPhone = user.phone.replace(/[\s-]/g, '');
      const cleanPassword = password.replace(/[\s-]/g, '');
      valid = cleanPhone === cleanPassword;
    }
  } else {
    // For admin/instructor: use regular password
    valid = await bcrypt.compare(password, user.passwordHash);
  }
  
  if (!valid) {
    return jsonResponse({ error: 'Invalid credentials' }, 401);
  }
  
  // Get all roles
  const rolesData = await db.select({ role: userRoles.role })
    .from(userRoles)
    .where(eq(userRoles.userId, user.id))
    .all();
  
  const token = await new SignJWT({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
    },
    roles: rolesData.map(r => r.role),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return new Response(JSON.stringify({ success: true, userId: user.id }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Set-Cookie': setSessionCookie(token),
    },
  });
}

async function handleSignup(request: Request, db: any): Promise<Response> {
  const body = await request.json();
  const { email, password, fullName } = body;
  
  if (!email || !password) {
    return jsonResponse({ error: 'Email and password required' }, 400);
  }
  
  const { profiles } = schema;
  const existing = await db.select().from(profiles).where(eq(profiles.email, email)).get();
  
  if (existing) {
    return jsonResponse({ error: 'User already exists' }, 400);
  }
  
  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();
  
  await db.insert(profiles).values({
    id,
    email,
    passwordHash,
    fullName: fullName || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).run();
  
  const token = await new SignJWT({
    user: {
      id,
      email,
      fullName: fullName || null,
    },
    roles: ['student'],
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
  
  return new Response(JSON.stringify({ success: true, userId: id }), {
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
      'Set-Cookie': setSessionCookie(token),
    },
  });
}

async function handleGetCourses(db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const { courses, enrollments, modules, lessonProgress, lessons } = schema;
  const isAdmin = session.roles.includes('admin') || session.roles.includes('instructor');
  
  // Get all courses (or only non-archived for students)
  let coursesList;
  if (isAdmin) {
    coursesList = await db.select().from(courses).all();
  } else {
    coursesList = await db.select().from(courses).where(eq(courses.archived, false)).all();
  }
  
  // Get user's enrollments
  const userEnrollments = await db.select()
    .from(enrollments)
    .where(eq(enrollments.userId, session.user.id))
    .all();
  
  const enrolledCourseIds = userEnrollments.map(e => e.courseId);
  
  // Calculate progress for enrolled courses
  const coursesWithProgress = await Promise.all(coursesList.map(async (course) => {
    const isEnrolled = enrolledCourseIds.includes(course.id);
    
    if (!isEnrolled) {
      return { ...course, enrolled: false, progress: 0, completedModules: 0, totalModules: 0 };
    }
    
    // Get all modules for this course
    const courseModules = await db.select()
      .from(modules)
      .where(eq(modules.courseId, course.id))
      .all();
    
    const totalModules = courseModules.length;
    
    if (totalModules === 0) {
      return { ...course, enrolled: true, progress: 0, completedModules: 0, totalModules: 0 };
    }
    
    // Get all lessons for these modules
    const moduleIds = courseModules.map(m => m.id);
    const courseLessons = await db.select()
      .from(lessons)
      .where(inArray(lessons.moduleId, moduleIds))
      .all();
    
    const totalLessons = courseLessons.length;
    
    if (totalLessons === 0) {
      return { ...course, enrolled: true, progress: 0, completedModules: 0, totalModules };
    }
    
    // Get completed lessons
    const lessonIds = courseLessons.map(l => l.id);
    const completedLessons = await db.select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, session.user.id),
        inArray(lessonProgress.lessonId, lessonIds),
        eq(lessonProgress.completed, true)
      ))
      .all();
    
    const progress = Math.round((completedLessons.length / totalLessons) * 100);
    
    // Calculate completed modules (all lessons in module completed)
    let completedModules = 0;
    for (const module of courseModules) {
      const moduleLessons = courseLessons.filter(l => l.moduleId === module.id);
      const moduleLessonIds = moduleLessons.map(l => l.id);
      const moduleCompletedLessons = completedLessons.filter(cl => moduleLessonIds.includes(cl.lessonId));
      
      if (moduleLessons.length > 0 && moduleCompletedLessons.length === moduleLessons.length) {
        completedModules++;
      }
    }
    
    return { ...course, enrolled: true, progress, completedModules, totalModules };
  }));
  
  return jsonResponse(coursesWithProgress);
}

async function handleGetCourseDetail(db: any, session: any, courseId: string): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const { courses, modules, lessons, lessonProgress } = schema;
  
  // Get course
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  
  if (!course) {
    return jsonResponse({ error: 'Course not found' }, 404);
  }
  
  // Get modules with progress
  const courseModules = await db.select()
    .from(modules)
    .where(eq(modules.courseId, courseId))
    .orderBy(asc(modules.position))
    .all();
  
  const modulesWithProgress = await Promise.all(courseModules.map(async (module) => {
    const moduleLessons = await db.select()
      .from(lessons)
      .where(eq(lessons.moduleId, module.id))
      .all();
    
    const totalLessons = moduleLessons.length;
    
    if (totalLessons === 0) {
      return { ...module, progress: 0, status: 'locked', lessons: 0 };
    }
    
    const lessonIds = moduleLessons.map(l => l.id);
    const completedLessons = await db.select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, session.user.id),
        inArray(lessonProgress.lessonId, lessonIds),
        eq(lessonProgress.completed, true)
      ))
      .all();
    
    const progress = Math.round((completedLessons.length / totalLessons) * 100);
    const status = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'locked';
    
    return { ...module, progress, status, lessons: totalLessons };
  }));
  
  return jsonResponse({ course, modules: modulesWithProgress });
}

async function handleGetModuleDetail(db: any, session: any, courseId: string, moduleId: string): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const { modules, lessons, lessonProgress, courses } = schema;
  
  // Get module
  const module = await db.select().from(modules).where(eq(modules.id, moduleId)).get();
  
  if (!module) {
    return jsonResponse({ error: 'Module not found' }, 404);
  }
  
  // Get course
  const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
  
  // Get lessons with progress
  const moduleLessons = await db.select()
    .from(lessons)
    .where(eq(lessons.moduleId, moduleId))
    .orderBy(asc(lessons.position))
    .all();
  
  const lessonsWithProgress = await Promise.all(moduleLessons.map(async (lesson) => {
    const progress = await db.select()
      .from(lessonProgress)
      .where(and(
        eq(lessonProgress.userId, session.user.id),
        eq(lessonProgress.lessonId, lesson.id)
      ))
      .get();
    
    return { ...lesson, completed: progress?.completed || false };
  }));
  
  return jsonResponse({ 
    module, 
    course: { id: course.id, title: course.title },
    lessons: lessonsWithProgress 
  });
}

async function handleUpdateLessonProgress(request: Request, db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const body = await request.json();
  const { lessonId, completed } = body;
  
  if (!lessonId) {
    return jsonResponse({ error: 'Lesson ID required' }, 400);
  }
  
  const { lessonProgress } = schema;
  
  // Check if progress exists
  const existing = await db.select()
    .from(lessonProgress)
    .where(and(
      eq(lessonProgress.userId, session.user.id),
      eq(lessonProgress.lessonId, lessonId)
    ))
    .get();
  
  const now = new Date().toISOString();
  
  if (existing) {
    // Update
    await db.update(lessonProgress)
      .set({
        completed: completed || false,
        completedAt: completed ? now : null,
        updatedAt: now,
      })
      .where(eq(lessonProgress.id, existing.id))
      .run();
  } else {
    // Insert
    await db.insert(lessonProgress).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      lessonId,
      completed: completed || false,
      completedAt: completed ? now : null,
      createdAt: now,
      updatedAt: now,
    }).run();
  }
  
  return jsonResponse({ success: true });
}

async function handleGetDashboardStats(db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const { enrollments, lessonProgress, scheduleEntries, payments } = schema;
  
  // Get active courses count
  const activeCourses = await db.select({ count: count() })
    .from(enrollments)
    .where(and(
      eq(enrollments.userId, session.user.id),
      eq(enrollments.status, 'active')
    ))
    .get();
  
  // Get completed lessons count
  const completedLessons = await db.select({ count: count() })
    .from(lessonProgress)
    .where(and(
      eq(lessonProgress.userId, session.user.id),
      eq(lessonProgress.completed, true)
    ))
    .get();
  
  // Get upcoming lessons count
  const now = new Date().toISOString().split('T')[0];
  const upcomingLessons = await db.select({ count: count() })
    .from(scheduleEntries)
    .where(and(
      eq(scheduleEntries.studentId, session.user.id),
      eq(scheduleEntries.scheduledDate, now) // Today or future
    ))
    .get();
  
  // Get pending payments
  const pendingPayments = await db.select()
    .from(payments)
    .where(and(
      eq(payments.userId, session.user.id),
      eq(payments.status, 'pending')
    ))
    .all();
  
  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
  
  return jsonResponse({
    activeCourses: activeCourses.count || 0,
    completedLessons: completedLessons.count || 0,
    upcomingLessons: upcomingLessons.count || 0,
    pendingPayments: totalPending,
  });
}

async function handleGetSchedule(db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const { scheduleEntries, profiles, modules } = schema;
  const isAdmin = session.roles.includes('admin') || session.roles.includes('instructor');
  
  let schedule;
  if (isAdmin) {
    // Get all schedule entries for instructor
    schedule = await db.select()
      .from(scheduleEntries)
      .where(eq(scheduleEntries.instructorId, session.user.id))
      .orderBy(asc(scheduleEntries.scheduledDate), asc(scheduleEntries.startTime))
      .all();
  } else {
    // Get schedule entries for student
    schedule = await db.select()
      .from(scheduleEntries)
      .where(eq(scheduleEntries.studentId, session.user.id))
      .orderBy(asc(scheduleEntries.scheduledDate), asc(scheduleEntries.startTime))
      .all();
  }
  
  // Enrich with instructor/student and module info
  const enrichedSchedule = await Promise.all(schedule.map(async (entry) => {
    const instructor = await db.select({ fullName: profiles.fullName })
      .from(profiles)
      .where(eq(profiles.id, entry.instructorId))
      .get();
    
    let student = null;
    if (entry.studentId) {
      student = await db.select({ fullName: profiles.fullName })
        .from(profiles)
        .where(eq(profiles.id, entry.studentId))
        .get();
    }
    
    let module = null;
    if (entry.moduleId) {
      module = await db.select({ title: modules.title })
        .from(modules)
        .where(eq(modules.id, entry.moduleId))
        .get();
    }
    
    return {
      ...entry,
      instructorName: instructor?.fullName || 'Unknown',
      studentName: student?.fullName || null,
      moduleTitle: module?.title || 'General Lesson',
    };
  }));
  
  return jsonResponse(enrichedSchedule);
}

async function handleCreateScheduleEntry(request: Request, db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const body = await request.json();
  const { instructorId, moduleId, scheduledDate, startTime, endTime } = body;
  
  if (!instructorId || !scheduledDate || !startTime || !endTime) {
    return jsonResponse({ error: 'Missing required fields' }, 400);
  }
  
  const { scheduleEntries } = schema;
  const now = new Date().toISOString();
  
  await db.insert(scheduleEntries).values({
    id: crypto.randomUUID(),
    instructorId,
    studentId: session.user.id,
    moduleId: moduleId || null,
    scheduledDate,
    startTime,
    endTime,
    createdAt: now,
    updatedAt: now,
  }).run();
  
  return jsonResponse({ success: true });
}

async function handleGetPayments(db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const { payments } = schema;
  
  const userPayments = await db.select()
    .from(payments)
    .where(eq(payments.userId, session.user.id))
    .orderBy(desc(payments.createdAt))
    .all();
  
  return jsonResponse(userPayments);
}

async function handleCreatePayment(request: Request, db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const body = await request.json();
  const { amount, dueDate, proofUrl } = body;
  
  if (!amount || !dueDate) {
    return jsonResponse({ error: 'Amount and due date required' }, 400);
  }
  
  const { payments } = schema;
  const now = new Date().toISOString();
  
  await db.insert(payments).values({
    id: crypto.randomUUID(),
    userId: session.user.id,
    amount,
    status: proofUrl ? 'paid' : 'pending',
    dueDate,
    proofUrl: proofUrl || null,
    createdAt: now,
    updatedAt: now,
  }).run();
  
  return jsonResponse({ success: true });
}

async function handleGetStudents(db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const isAdmin = session.roles.includes('admin') || session.roles.includes('instructor');
  if (!isAdmin) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  try {
    const { profiles, enrollments, courses, userRoles } = schema;
    
    // Get all users with student role
    const studentRoles = await db.select({ userId: userRoles.userId })
      .from(userRoles)
      .where(eq(userRoles.role, 'student'))
      .all();
    
    const studentIds = studentRoles.map(r => r.userId);
    
    // Get student profiles
    let students;
    if (studentIds.length > 0) {
      students = await db.select()
        .from(profiles)
        .where(inArray(profiles.id, studentIds))
        .all();
    } else {
      // If no students with role, return empty array
      return jsonResponse([]);
    }
    
    // Enrich with basic enrollment data (simplified - no complex progress calculation)
    const studentsWithData = await Promise.all(students.map(async (student) => {
      try {
        const studentEnrollments = await db.select()
          .from(enrollments)
          .where(eq(enrollments.userId, student.id))
          .all();
        
        const enrolledCourses = await Promise.all(studentEnrollments.map(async (enrollment) => {
          try {
            const course = await db.select({ title: courses.title })
              .from(courses)
              .where(eq(courses.id, enrollment.courseId))
              .get();
            return course?.title || 'Unknown Course';
          } catch (err) {
            console.error('Error fetching course:', err);
            return 'Unknown Course';
          }
        }));
        
        // Simplified status logic
        const status = studentEnrollments.length > 0 ? 'active' : 'inactive';
        
        return {
          id: student.id,
          name: student.fullName || student.email,
          email: student.email,
          phone: student.phone || 'N/A',
          idNumber: student.idNumber,
          dateOfBirth: student.dateOfBirth,
          address: student.address,
          enrolledDate: studentEnrollments[0]?.enrolledAt || student.createdAt,
          courses: enrolledCourses,
          progress: 0, // Simplified - can be calculated on-demand later
          status,
          lessonsCompleted: 0,
          lessonsTotal: 0,
        };
      } catch (err) {
        console.error('Error processing student:', err);
        return {
          id: student.id,
          name: student.fullName || student.email,
          email: student.email,
          phone: student.phone || 'N/A',
          idNumber: student.idNumber,
          dateOfBirth: student.dateOfBirth,
          address: student.address,
          enrolledDate: student.createdAt,
          courses: [],
          progress: 0,
          status: 'inactive',
          lessonsCompleted: 0,
          lessonsTotal: 0,
        };
      }
    }));
    
    return jsonResponse(studentsWithData);
  } catch (error: any) {
    console.error('Error in handleGetStudents:', error);
    return jsonResponse({ error: 'Failed to fetch students: ' + error.message }, 500);
  }
}

async function handleCreateStudent(request: Request, db: any, session: any): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const isAdmin = session.roles.includes('admin') || session.roles.includes('instructor');
  if (!isAdmin) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const body = await request.json();
  const { email, fullName, phone, idNumber, dateOfBirth, address, courseId } = body;
  
  if (!email || !fullName) {
    return jsonResponse({ error: 'Email and full name required' }, 400);
  }
  
  const { profiles, enrollments, userRoles } = schema;
  
  // Check if user exists
  const existing = await db.select().from(profiles).where(eq(profiles.email, email)).get();
  
  if (existing) {
    return jsonResponse({ error: 'User already exists' }, 400);
  }
  
  const now = new Date().toISOString();
  const userId = crypto.randomUUID();
  const tempPassword = crypto.randomUUID().substring(0, 8);
  const passwordHash = await bcrypt.hash(tempPassword, 10);
  
  // Create profile
  await db.insert(profiles).values({
    id: userId,
    email,
    passwordHash,
    fullName,
    phone: phone || null,
    idNumber: idNumber || null,
    dateOfBirth: dateOfBirth || null,
    address: address || null,
    createdAt: now,
    updatedAt: now,
  }).run();
  
  // Assign student role
  await db.insert(userRoles).values({
    id: crypto.randomUUID(),
    userId,
    role: 'student',
    createdAt: now,
  }).run();
  
  // Enroll in course if provided
  if (courseId) {
    await db.insert(enrollments).values({
      id: crypto.randomUUID(),
      userId,
      courseId,
      status: 'active',
      enrolledAt: now,
    }).run();
  }
  
  return jsonResponse({ success: true, userId, tempPassword });
}

async function handleUpdateStudent(request: Request, db: any, session: any, studentId: string): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const isAdmin = session.roles.includes('admin') || session.roles.includes('instructor');
  if (!isAdmin) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const body = await request.json();
  const { fullName, phone, idNumber, dateOfBirth, address } = body;
  
  const { profiles } = schema;
  const now = new Date().toISOString();
  
  // Check if student exists
  const student = await db.select().from(profiles).where(eq(profiles.id, studentId)).get();
  if (!student) {
    return jsonResponse({ error: 'Student not found' }, 404);
  }
  
  // Update profile
  await db.update(profiles)
    .set({
      fullName: fullName || student.fullName,
      phone: phone || student.phone,
      idNumber: idNumber || student.idNumber,
      dateOfBirth: dateOfBirth || student.dateOfBirth,
      address: address || student.address,
      updatedAt: now,
    })
    .where(eq(profiles.id, studentId))
    .run();
  
  return jsonResponse({ success: true });
}

async function handleDeleteStudent(db: any, session: any, studentId: string): Promise<Response> {
  if (!session) {
    return jsonResponse({ error: 'Unauthorized' }, 401);
  }
  
  const isAdmin = session.roles.includes('admin') || session.roles.includes('instructor');
  if (!isAdmin) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const { profiles, userRoles, enrollments, lessonProgress, payments, scheduleEntries } = schema;
  
  // Check if student exists
  const student = await db.select().from(profiles).where(eq(profiles.id, studentId)).get();
  if (!student) {
    return jsonResponse({ error: 'Student not found' }, 404);
  }
  
  // Delete related records
  await db.delete(lessonProgress).where(eq(lessonProgress.userId, studentId)).run();
  await db.delete(scheduleEntries).where(eq(scheduleEntries.studentId, studentId)).run();
  await db.delete(payments).where(eq(payments.userId, studentId)).run();
  await db.delete(enrollments).where(eq(enrollments.userId, studentId)).run();
  await db.delete(userRoles).where(eq(userRoles.userId, studentId)).run();
  await db.delete(profiles).where(eq(profiles.id, studentId)).run();
  
  return jsonResponse({ success: true });
}

// Helper function
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}


// ============================================
// ADMIN API ENDPOINTS
// ============================================

// Admin Users Management
async function handleAdminGetUsers(db: any, session: any): Promise<Response> {
  if (!session || !session.roles.includes('admin')) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const { profiles, userRoles } = schema;
  
  try {
    // Get all users with their roles
    const users = await db.select({
      id: profiles.id,
      fullName: profiles.fullName,
      email: profiles.email,
      phone: profiles.phone,
      createdAt: profiles.createdAt,
    }).from(profiles).all();
    
    // Get roles for each user
    const usersWithRoles = await Promise.all(users.map(async (user) => {
      const roles = await db.select({ role: userRoles.role })
        .from(userRoles)
        .where(eq(userRoles.userId, user.id))
        .all();
      
      return {
        ...user,
        roles: roles.map(r => r.role),
      };
    }));
    
    return jsonResponse(usersWithRoles);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    return jsonResponse({ error: 'Failed to fetch users' }, 500);
  }
}

async function handleAdminCreateUser(request: Request, db: any, session: any): Promise<Response> {
  if (!session || !session.roles.includes('admin')) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const body = await request.json();
  const { email, fullName, phone, role, password } = body;
  
  if (!email || !fullName || !phone || !role || !password) {
    return jsonResponse({ error: 'All fields are required' }, 400);
  }
  
  const { profiles, userRoles } = schema;
  
  try {
    // Check if user exists
    const existing = await db.select().from(profiles).where(eq(profiles.email, email)).get();
    if (existing) {
      return jsonResponse({ error: 'User already exists' }, 400);
    }
    
    const now = new Date().toISOString();
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Create profile
    await db.insert(profiles).values({
      id: userId,
      email,
      passwordHash,
      fullName,
      phone,
      createdAt: now,
      updatedAt: now,
    }).run();
    
    // Assign role
    await db.insert(userRoles).values({
      id: crypto.randomUUID(),
      userId,
      role,
      createdAt: now,
    }).run();
    
    return jsonResponse({ success: true, userId });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return jsonResponse({ error: 'Failed to create user' }, 500);
  }
}

async function handleAdminDeleteUser(db: any, session: any, userId: string): Promise<Response> {
  if (!session || !session.roles.includes('admin')) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const { profiles, userRoles, enrollments, lessonProgress, payments, scheduleEntries } = schema;
  
  try {
    // Don't allow deleting yourself
    if (userId === session.user.id) {
      return jsonResponse({ error: 'Cannot delete your own account' }, 400);
    }
    
    // Delete related records
    await db.delete(lessonProgress).where(eq(lessonProgress.userId, userId)).run();
    await db.delete(scheduleEntries).where(eq(scheduleEntries.studentId, userId)).run();
    await db.delete(payments).where(eq(payments.userId, userId)).run();
    await db.delete(enrollments).where(eq(enrollments.userId, userId)).run();
    await db.delete(userRoles).where(eq(userRoles.userId, userId)).run();
    await db.delete(profiles).where(eq(profiles.id, userId)).run();
    
    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error deleting user:', error);
    return jsonResponse({ error: 'Failed to delete user' }, 500);
  }
}

// Admin Payments Management
async function handleAdminGetPayments(db: any, session: any): Promise<Response> {
  if (!session || !['admin', 'instructor'].some(r => session.roles.includes(r))) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const { payments, profiles } = schema;
  
  try {
    const allPayments = await db.select({
      id: payments.id,
      userId: payments.userId,
      amount: payments.amount,
      status: payments.status,
      paymentMethod: payments.paymentMethod,
      transactionRef: payments.transactionRef,
      dueDate: payments.dueDate,
      paidDate: payments.paidDate,
      notes: payments.notes,
      createdAt: payments.createdAt,
      userName: profiles.fullName,
      userEmail: profiles.email,
    })
    .from(payments)
    .leftJoin(profiles, eq(payments.userId, profiles.id))
    .orderBy(desc(payments.createdAt))
    .all();
    
    return jsonResponse(allPayments);
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return jsonResponse({ error: 'Failed to fetch payments' }, 500);
  }
}

async function handleAdminRecordPayment(request: Request, db: any, session: any): Promise<Response> {
  if (!session || !['admin', 'instructor'].some(r => session.roles.includes(r))) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const body = await request.json();
  const { userId, amount, paymentMethod, transactionRef, notes } = body;
  
  if (!userId || !amount || !paymentMethod) {
    return jsonResponse({ error: 'User, amount, and payment method are required' }, 400);
  }
  
  const { payments } = schema;
  const now = new Date().toISOString();
  
  try {
    await db.insert(payments).values({
      id: crypto.randomUUID(),
      userId,
      amount,
      status: 'paid',
      paymentMethod,
      transactionRef: transactionRef || null,
      dueDate: now,
      paidDate: now,
      recordedBy: session.user.id,
      notes: notes || null,
      createdAt: now,
      updatedAt: now,
    }).run();
    
    return jsonResponse({ success: true });
  } catch (error: any) {
    console.error('Error recording payment:', error);
    return jsonResponse({ error: 'Failed to record payment' }, 500);
  }
}

async function handleAdminGenerateReceipt(db: any, session: any, paymentId: string): Promise<Response> {
  if (!session || !['admin', 'instructor'].some(r => session.roles.includes(r))) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const { payments, profiles } = schema;
  
  try {
    const payment = await db.select({
      id: payments.id,
      amount: payments.amount,
      paymentMethod: payments.paymentMethod,
      transactionRef: payments.transactionRef,
      paidDate: payments.paidDate,
      notes: payments.notes,
      userName: profiles.fullName,
      userEmail: profiles.email,
    })
    .from(payments)
    .leftJoin(profiles, eq(payments.userId, profiles.id))
    .where(eq(payments.id, paymentId))
    .get();
    
    if (!payment) {
      return jsonResponse({ error: 'Payment not found' }, 404);
    }
    
    // Generate simple text receipt (in production, use PDF library)
    const receiptContent = [
      '========================================',
      '      IMMACURATE DRIVING SCHOOL',
      '              RECEIPT',
      '========================================',
      '',
      `Receipt ID: ${payment.id}`,
      `Date: ${new Date(payment.paidDate || '').toLocaleDateString()}`,
      `Student: ${payment.userName}`,
      `Email: ${payment.userEmail}`,
      '',
      `Amount: KES ${(payment.amount / 100).toLocaleString()}`,
      `Method: ${payment.paymentMethod?.toUpperCase()}`,
      `Reference: ${payment.transactionRef || 'N/A'}`,
      '',
      payment.notes ? `Notes: ${payment.notes}` : '',
      '',
      '========================================',
      'Thank you for your payment!',
      '',
      'Juja Arcade, 1st Floor',
      'P.O Box 717-01001 Kalimoni',
      'Phone: 0721 171911',
      'Email: immacuratedriving77@gmail.com',
      '========================================',
    ].filter(Boolean).join('\n');
    
    return new Response(receiptContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="receipt-${paymentId}.txt"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating receipt:', error);
    return jsonResponse({ error: 'Failed to generate receipt' }, 500);
  }
}

// Admin Courses CRUD
async function handleAdminGetCourses(db: any, session: any): Promise<Response> {
  if (!session || !['admin', 'instructor'].some(r => session.roles.includes(r))) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const { courses } = schema;
  const allCourses = await db.select().from(courses).all();
  return jsonResponse(allCourses);
}

async function handleAdminCreateCourse(request: Request, db: any, session: any): Promise<Response> {
  if (!session || !['admin', 'instructor'].some(r => session.roles.includes(r))) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const body = await request.json();
  const { title, category, description, tuition, pdl_fee, test_fee, total_fee, duration } = body;
  
  if (!title || !category) {
    return jsonResponse({ error: 'Title and category required' }, 400);
  }
  
  const { courses } = schema;
  const now = new Date().toISOString();
  const id = crypto.randomUUID();
  
  await db.insert(courses).values({
    id,
    title,
    category,
    description: description || null,
    tuition: tuition || 0,
    pdl_fee: pdl_fee || 0,
    test_fee: test_fee || 0,
    total_fee: total_fee || 0,
    duration: duration || null,
    archived: false,
    createdBy: session.user.id,
    createdAt: now,
    updatedAt: now,
  }).run();
  
  return jsonResponse({ success: true, id });
}

async function handleAdminUpdateCourse(request: Request, db: any, session: any, courseId: string): Promise<Response> {
  if (!session || !['admin', 'instructor'].some(r => session.roles.includes(r))) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const body = await request.json();
  const { title, category, description, tuition, pdl_fee, test_fee, total_fee, duration } = body;
  
  const { courses } = schema;
  const now = new Date().toISOString();
  
  await db.update(courses)
    .set({
      title,
      category,
      description,
      tuition,
      pdl_fee,
      test_fee,
      total_fee,
      duration,
      updatedAt: now,
    })
    .where(eq(courses.id, courseId))
    .run();
  
  return jsonResponse({ success: true });
}

async function handleAdminDeleteCourse(db: any, session: any, courseId: string): Promise<Response> {
  if (!session || !['admin', 'instructor'].some(r => session.roles.includes(r))) {
    return jsonResponse({ error: 'Forbidden' }, 403);
  }
  
  const { courses } = schema;
  const now = new Date().toISOString();
  
  // Soft delete - archive the course
  await db.update(courses)
    .set({
      archived: true,
      updatedAt: now,
    })
    .where(eq(courses.id, courseId))
    .run();
  
  return jsonResponse({ success: true });
}
