import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { enrollments } from "./schema";
import { eq, and } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getEnrollmentsFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { userId?: string })
  .handler(async ({ data: { userId } }) => {
    const session = await getSessionFn();
    if (!session) return [];

    const db = getDb(process.env);
    const isAdmin = session.roles.includes("admin") || session.roles.includes("instructor");

    const effectiveUserId = userId ?? (isAdmin ? undefined : session.user.id);

    if (effectiveUserId) {
      return db.select().from(enrollments).where(eq(enrollments.userId, effectiveUserId)).all();
    }
    return db.select().from(enrollments).all();
  });

export const createEnrollmentFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb(process.env);
    const id = crypto.randomUUID();
    const newEnrollment = {
      ...data,
      id,
      enrolledAt: data.enrolled_at ?? new Date().toISOString(),
      status: data.status ?? "active",
    };
    await db.insert(enrollments).values(newEnrollment).run();
    return newEnrollment;
  });

export const updateEnrollmentFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { id: string; [key: string]: any })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb(process.env);
    const { id, ...updates } = data;
    await db.update(enrollments).set(updates).where(eq(enrollments.id, id)).run();
    return db.select().from(enrollments).where(eq(enrollments.id, id)).get();
  });
