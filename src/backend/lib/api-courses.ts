import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { courses, enrollments } from "./schema";
import { eq, desc, and } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getCoursesFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) return [];

  const db = getDb();
  const isAdmin = session.roles.includes("admin") || session.roles.includes("instructor");

  if (isAdmin) {
    const allCourses = await db.select().from(courses).where(eq(courses.archived, false)).orderBy(desc(courses.createdAt)).all();
    return allCourses;
  }

  // Student view: Only return enrolled courses
  const enrolledCourses = await db
    .select({ course: courses })
    .from(enrollments)
    .innerJoin(courses, eq(enrollments.courseId, courses.id))
    .where(and(eq(enrollments.userId, session.user.id), eq(courses.archived, false)))
    .orderBy(desc(courses.createdAt))
    .all();

  return enrolledCourses.map((row) => row.course);
});

export const createCourseFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const newCourse = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: session.user.id,
      archived: false,
    };

    await db.insert(courses).values(newCourse).run();
    return newCourse;
  });

export const updateCourseFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb();
    const { id, ...updates } = data;
    
    await db.update(courses).set({
      ...updates,
      updatedAt: new Date().toISOString()
    }).where(eq(courses.id, id)).run();

    const updated = await db.select().from(courses).where(eq(courses.id, id)).get();
    return updated;
  });

export const archiveCourseFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: id }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb();
    await db.update(courses).set({
      archived: true,
      updatedAt: new Date().toISOString()
    }).where(eq(courses.id, id)).run();

    return { success: true };
  });

export const deleteCourseFn = createServerFn({ method: "POST" })
  .validator((id: string) => id)
  .handler(async ({ data: id }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb();
    await db.delete(courses).where(eq(courses.id, id)).run();
    return { success: true };
  });

