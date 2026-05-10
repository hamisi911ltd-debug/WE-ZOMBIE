import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { scheduleEntries } from "./schema";
import { eq, and } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

// GET all schedule entries (optionally filtered by user)
export const getScheduleFn = createServerFn({ method: "GET" }).handler(async ({ query }: { query?: { userId?: string } }) => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthorized");
  const db = getDb(process.env);
  const { userId } = query ?? {};
  let q = db.select().from(scheduleEntries);
  if (userId) q = q.where(eq(scheduleEntries.userId, userId));
  const rows = await q.all();
  return rows;
});

// POST create schedule entry
export const createScheduleFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { data: any })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb(process.env);
    const { data: inserted } = await db.insert(scheduleEntries).values(data).returning().all();
    return inserted;
});

// PUT update schedule entry
export const updateScheduleFn = createServerFn({ method: "PUT" })
  .validator((d: any) => d as { id: string; updates: any })
  .handler(async ({ id, updates }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb(process.env);
    await db.update(scheduleEntries).set(updates).where(eq(scheduleEntries.id, id)).run();
    const row = await db.select().from(scheduleEntries).where(eq(scheduleEntries.id, id)).get();
    return row;
});

// DELETE schedule entry
export const deleteScheduleFn = createServerFn({ method: "DELETE" })
  .validator((d: any) => d as { id: string })
  .handler(async ({ id }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    const db = getDb(process.env);
    await db.delete(scheduleEntries).where(eq(scheduleEntries.id, id)).run();
    return { id };
});
