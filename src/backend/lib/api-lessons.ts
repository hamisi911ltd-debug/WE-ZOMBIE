import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { lessons } from "./schema";
import { eq, asc } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getLessonsFn = createServerFn({ method: "POST" })
  .validator((moduleId: string) => moduleId)
  .handler(async ({ data: moduleId }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb();
    return await db.select().from(lessons).where(eq(lessons.moduleId, moduleId)).orderBy(asc(lessons.position)).all();
  });

export const createLessonFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");
    const db = getDb();
    const id = crypto.randomUUID();
    const newLesson = { ...data, id };
    await db.insert(lessons).values(newLesson).run();
    return newLesson;
  });

export const updateLessonFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");
    const db = getDb();
    const { id, ...updates } = data;
    await db.update(lessons).set(updates).where(eq(lessons.id, id)).run();
    return await db.select().from(lessons).where(eq(lessons.id, id)).get();
  });

export const reorderLessonsFn = createServerFn({ method: "POST" })
  .validator((d: { moduleId: string; items: { id: string; position: number }[] }) => d)
  .handler(async ({ data: { moduleId, items } }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");
    const db = getDb();

    for (const item of items) {
      await db.update(lessons).set({ position: item.position }).where(eq(lessons.id, item.id)).run();
    }

    return { success: true };
  });
