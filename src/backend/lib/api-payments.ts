import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { payments } from "./schema";
import { eq } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getPaymentsFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { userId?: string })
  .handler(async ({ data: { userId } }) => {
    const session = await getSessionFn();
    if (!session) return [];

    const db = getDb(process.env);
    const isAdmin = session.roles.includes("admin") || session.roles.includes("instructor");

    if (isAdmin) {
      return db.select().from(payments).all();
    }

    const effectiveUserId = userId ?? session.user.id;
    return db.select().from(payments).where(eq(payments.userId, effectiveUserId)).all();
  });

export const createPaymentFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb(process.env);
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newPayment = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      status: data.status ?? "pending",
    };
    await db.insert(payments).values(newPayment).run();
    return newPayment;
  });

export const updatePaymentFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { id: string; [key: string]: any })
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb(process.env);
    const { id, ...updates } = data;
    await db.update(payments).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(payments.id, id)).run();
    return db.select().from(payments).where(eq(payments.id, id)).get();
  });

export const deletePaymentFn = createServerFn({ method: "POST" })
  .validator((d: string) => d)
  .handler(async ({ data: id }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb(process.env);
    await db.delete(payments).where(eq(payments.id, id)).run();
    return { success: true };
  });
