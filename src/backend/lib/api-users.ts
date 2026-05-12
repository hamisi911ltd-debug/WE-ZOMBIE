import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { profiles, userRoles } from "./schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionFn } from "./auth-server";

export const getAllUsersFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSessionFn();
  if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");

  const db = getDb();
  
  // Get all profiles with their roles
  const users = await db.select().from(profiles).all();
  const roles = await db.select().from(userRoles).all();

  const usersWithRoles = users.map(user => {
    const userRolesList = roles.filter(r => r.userId === user.id).map(r => r.role);
    return {
      ...user,
      roles: userRolesList
    };
  });

  return usersWithRoles;
});

export const updateUserRoleFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { userId: string; role: string; action: 'add' | 'remove' })
  .handler(async ({ data: { userId, role, action } }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");

    const db = getDb();

    if (action === 'add') {
      // Check if role already exists
      const existing = await db.select().from(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.role, role))).get();
      if (!existing) {
        await db.insert(userRoles).values({
          id: crypto.randomUUID(),
          userId,
          role,
          createdAt: new Date().toISOString()
        }).run();
      }
    } else {
      await db.delete(userRoles).where(and(eq(userRoles.userId, userId), eq(userRoles.role, role))).run();
    }

    return { success: true };
  });

export const deleteUserFn = createServerFn({ method: "POST" })
  .validator((userId: string) => userId)
  .handler(async ({ data: userId }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");

    const db = getDb();
    
    // Check if it's the last admin
    if (userId === session.user.id) throw new Error("You cannot delete yourself");

    await db.delete(userRoles).where(eq(userRoles.userId, userId)).run();
    await db.delete(profiles).where(eq(profiles.id, userId)).run();

    return { success: true };
  });
