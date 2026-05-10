import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { lessonProgress, lessons, modules } from "./schema";
import { eq, and, inArray } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getLessonProgressFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string; courseId: string }) => d)
  .handler(async ({ data: { userId, courseId } }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthenticated");

    const db = getDb(process.env);
    
    // Get all modules for the course
    const courseModules = await db.select().from(modules).where(eq(modules.courseId, courseId)).all();
    const moduleIds = courseModules.map(m => m.id);
    if (!moduleIds.length) return [];

    // Get all lessons in those modules
    const courseLessons = await db.select().from(lessons).where(inArray(lessons.moduleId, moduleIds)).all();
    const lessonIds = courseLessons.map(l => l.id);
    if (!lessonIds.length) return [];

    // Fetch progress records
    return await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), inArray(lessonProgress.lessonId, lessonIds))).all();
  });

export const markLessonCompleteFn = createServerFn({ method: "POST" })
  .validator((d: { userId: string; lessonId: string }) => d)
  .handler(async ({ data: { userId, lessonId } }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthenticated");

    const db = getDb(process.env);
    const existing = await db.select().from(lessonProgress).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId))).get();

    if (existing) {
      await db.update(lessonProgress).set({
        completed: true,
        completedAt: new Date().toISOString()
      }).where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId))).run();
    } else {
      await db.insert(lessonProgress).values({
        userId,
        lessonId,
        completed: true,
        completedAt: new Date().toISOString()
      }).run();
    }

    return { success: true };
  });
