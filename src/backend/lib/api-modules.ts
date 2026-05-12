import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { modules } from "./schema";
import { eq, asc } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getModulesFn = createServerFn({ method: "POST" })
  .validator((courseId: string | undefined) => courseId)
  .handler(async ({ data: courseId }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb();
    if (courseId) {
      return await db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(asc(modules.position)).all();
    }
    return await db.select().from(modules).orderBy(asc(modules.position)).all();
  });

export const createModuleFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");
    const db = getDb();
    const id = crypto.randomUUID();
    const newModule = { ...data, id };
    await db.insert(modules).values(newModule).run();
    return newModule;
  });

export const updateModuleFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");
    const db = getDb();
    const { id, ...updates } = data;
    await db.update(modules).set(updates).where(eq(modules.id, id)).run();
    return await db.select().from(modules).where(eq(modules.id, id)).get();
  });

export const reorderModulesFn = createServerFn({ method: "POST" })
  .validator((d: { courseId: string; items: { id: string; position: number }[] }) => d)
  .handler(async ({ data: { courseId, items } }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");
    const db = getDb();

    for (const item of items) {
      await db.update(modules).set({ position: item.position }).where(eq(modules.id, item.id)).run();
    }

    return { success: true };
  });
