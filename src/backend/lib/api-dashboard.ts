import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { courses, enrollments, payments, scheduleEntries, userRoles } from "./schema";
import { eq, and, gte, lte, desc, count, inArray } from "drizzle-orm";

import { getSessionFn } from "./auth-server";

export const getDashboardStatsFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");

  const db = getDb(process.env);
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const todayStr = now.toISOString().split("T")[0];
  const futureStr = sevenDaysLater.toISOString().split("T")[0];

  const [enrolledCount] = await db.select({ value: count() }).from(enrollments).where(eq(enrollments.status, "active")).all();
  const [coursesCount] = await db.select({ value: count() }).from(courses).where(eq(courses.archived, false)).all();
  const [paymentsCount] = await db.select({ value: count() }).from(payments).where(eq(payments.status, "pending")).all();
  const [scheduleCount] = await db.select({ value: count() }).from(scheduleEntries).where(and(gte(scheduleEntries.scheduledDate, todayStr), lte(scheduleEntries.scheduledDate, futureStr))).all();

  const recentPayments = await db.select().from(payments).orderBy(desc(payments.createdAt)).limit(4).all();
  const recentEnrollments = await db.select().from(enrollments).orderBy(desc(enrollments.createdAt)).limit(4).all();

  return {
    stats: {
      enrolledStudents: enrolledCount.value,
      activeCourses: coursesCount.value,
      pendingPayments: paymentsCount.value,
      upcomingEntries: scheduleCount.value,
    },
    recentPayments,
    recentEnrollments,
  };
});

export const getAdminCountFn = createServerFn({ method: "GET" }).handler(async () => {
  const db = getDb(process.env);
  const [res] = await db.select({ value: count() }).from(userRoles).where(eq(userRoles.role, "admin")).all();
  return res.value;
});

export const claimFirstAdminFn = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthenticated");

  const db = getDb(process.env);
  const [res] = await db.select({ value: count() }).from(userRoles).where(eq(userRoles.role, "admin")).all();
  
  if (res.value > 0) return { success: false, message: "Admin already exists" };

  await db.insert(userRoles).values({
    userId: session.user.id,
    role: "admin"
  }).run();

  return { success: true };
});

export const getStudentCourseStatsFn = createServerFn({ method: "POST" })
  .validator((courseId: string) => courseId)
  .handler(async ({ data: courseId }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthenticated");

    const db = getDb(process.env);
    const course = await db.select().from(courses).where(eq(courses.id, courseId)).get();
    if (!course) return null;

    const { lessons, modules: modulesTable } = await import("./schema");
    const courseModules = await db.select().from(modulesTable).where(eq(modulesTable.courseId, courseId)).all();
    const moduleIds = courseModules.map(m => m.id);
    
    let totalLessons = 0;
    if (moduleIds.length > 0) {
      const [res] = await db.select({ value: count() }).from(lessons).where(inArray(lessons.moduleId, moduleIds)).all();
      totalLessons = res.value;
    }

    return {
      title: course.title,
      totalLessons
    };
  });

