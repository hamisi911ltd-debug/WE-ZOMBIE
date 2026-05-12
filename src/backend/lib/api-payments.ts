import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { payments, profiles } from "./schema";
import { eq } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getPaymentsFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { userId?: string })
  .handler(async ({ data: { userId } }) => {
    const session = await getSessionFn();
    if (!session) return [];

    const db = getDb();
    const isAdmin = session.roles.includes("admin") || session.roles.includes("instructor");

    let query = db
      .select({
        payment: payments,
        user: {
          fullName: profiles.fullName,
          email: profiles.email,
        },
      })
      .from(payments)
      .innerJoin(profiles, eq(payments.userId, profiles.id));

    if (!isAdmin) {
      const effectiveUserId = userId ?? session.user.id;
      query = query.where(eq(payments.userId, effectiveUserId)) as any;
    } else if (userId) {
      query = query.where(eq(payments.userId, userId)) as any;
    }

    const results = await query.all();
    return results.map(r => ({
      ...r.payment,
      studentName: r.user.fullName || r.user.email,
    }));
  });

export const createPaymentFn = createServerFn({ method: "POST" })
  .validator((d: any) => d)
  .handler(async ({ data }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      throw new Error("Unauthorized");
    }

    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const newPayment = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
      status: data.status ?? "pending",
      recordedBy: session.user.id,
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

    const db = getDb();
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

    const db = getDb();
    await db.delete(payments).where(eq(payments.id, id)).run();
    return { success: true };
  });
