import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { scheduleEntries } from "./schema";
import { getSessionFn } from "./auth-server";
import { eq, and, or } from "drizzle-orm";

// GET all schedule entries (optionally filtered by user)
export const getScheduleFn = createServerFn({ method: "GET" })
  .validator((q: { userId?: string } | undefined) => q)
  .handler(async ({ data: query }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb();
    const { userId } = query ?? {};
    
    if (userId) {
      return await db
        .select()
        .from(scheduleEntries)
        .where(or(eq(scheduleEntries.instructorId, userId), eq(scheduleEntries.studentId, userId)))
        .all();
    }
    
    return await db.select().from(scheduleEntries).all();
  });

// POST create schedule entry
export const createScheduleFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { data: any })
  .handler(async ({ data: { data } }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newEntry = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(scheduleEntries).values(newEntry).run();
    return newEntry;
  });

// PUT update schedule entry
export const updateScheduleFn = createServerFn({ method: "POST" }) // Changed to POST for better compatibility with some environments
  .validator((d: any) => d as { id: string; updates: any })
  .handler(async ({ data: { id, updates } }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb();
    await db
      .update(scheduleEntries)
      .set({ ...updates, updatedAt: new Date().toISOString() })
      .where(eq(scheduleEntries.id, id))
      .run();
    return await db.select().from(scheduleEntries).where(eq(scheduleEntries.id, id)).get();
  });

// DELETE schedule entry
export const deleteScheduleFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { id: string })
  .handler(async ({ data: { id } }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb();
    await db.delete(scheduleEntries).where(eq(scheduleEntries.id, id)).run();
    return { success: true };
  });
