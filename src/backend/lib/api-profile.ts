import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { profiles } from "./schema";
import { getSessionFn } from "./auth-server";
import { inArray, eq } from "drizzle-orm";

export const getProfileFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthenticated");
  const db = getDb(process.env);
  return await db.select().from(profiles).where(eq(profiles.id, session.user.id)).get();
});

export const getProfilesByIdsFn = createServerFn({ method: "POST" })
  .validator((ids: string[]) => ids)
  .handler(async ({ data: ids }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthenticated");
    if (!ids.length) return [];
    const db = getDb(process.env);
    return await db.select().from(profiles).where(inArray(profiles.id, ids)).all();
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthenticated");
    const db = getDb(process.env);
    await db.update(profiles).set(data).where(eq(profiles.id, session.user.id)).run();
    return await getProfileFn();
  });

export const getInstructorsFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthenticated");

  const db = getDb(process.env);
  const { userRoles } = await import("./schema");
  const instructorRoles = await db.select().from(userRoles).where(eq(userRoles.role, "instructor")).all();
  const ids = instructorRoles.map(r => r.userId);
  if (!ids.length) return [];
  
  return await db.select().from(profiles).where(inArray(profiles.id, ids)).all();
});

export const getNotificationPrefsFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session) throw new Error("Unauthenticated");

  const db = getDb(process.env);
  const { notificationPreferences } = await import("./schema");
  return await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, session.user.id)).get();
});

export const updateNotificationPrefsFn = createServerFn({ method: "POST" })
  .validator((d: { emailReminders: boolean }) => d)
  .handler(async ({ data: { emailReminders } }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthenticated");

    const db = getDb(process.env);
    const { notificationPreferences } = await import("./schema");
    const existing = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, session.user.id)).get();

    if (existing) {
      await db.update(notificationPreferences).set({ emailReminders }).where(eq(notificationPreferences.userId, session.user.id)).run();
    } else {
      await db.insert(notificationPreferences).values({ userId: session.user.id, emailReminders }).run();
    }

    return { success: true };
  });

