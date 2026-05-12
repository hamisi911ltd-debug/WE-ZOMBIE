import { createServerFn } from "@tanstack/react-start";
import { getDb } from "./db";
import { profiles, userRoles, enrollments } from "./schema";
import { eq, inArray, like, and } from "drizzle-orm";
import { getSessionFn } from "./auth-server";
import { z } from "zod";

export const getStudentsFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { search?: string; filter?: { courseId?: string; status?: string } })
  .handler(async ({ data: { search, filter } }) => {
    const session = await getSessionFn();
    if (!session || (!session.roles.includes("admin") && !session.roles.includes("instructor"))) {
      return [];
    }

    const db = getDb();
    
    // Get all students
    let q = db
      .select({ profile: profiles })
      .from(profiles)
      .innerJoin(userRoles, eq(profiles.id, userRoles.userId))
      .where(eq(userRoles.role, "student"));

    if (search) {
      q = q.where(like(profiles.fullName, `%${search}%`)) as any;
    }

    let students = await q.all();
    let studentProfiles = students.map(s => s.profile);

    if (filter?.courseId || filter?.status) {
      let eqArgs = [];
      if (filter.courseId) eqArgs.push(eq(enrollments.courseId, filter.courseId));
      if (filter.status) eqArgs.push(eq(enrollments.status, filter.status));
      
      const enrolled = await db
        .select({ userId: enrollments.userId })
        .from(enrollments)
        .where(and(...eqArgs))
        .all();
        
      const enrolledIds = new Set(enrolled.map(e => e.userId));
      studentProfiles = studentProfiles.filter(p => enrolledIds.has(p.id));
    }

    return studentProfiles;
  });

export const updateProfileFn = createServerFn({ method: "POST" })
  .validator((d: any) => d as { id: string; full_name?: string; phone?: string })
  .handler(async ({ data: { id, full_name, phone } }) => {
    const session = await getSessionFn();
    if (!session) throw new Error("Unauthorized");
    
    // Allow users to update their own profile, or admins
    if (session.user.id !== id && !session.roles.includes("admin")) {
        throw new Error("Unauthorized");
    }

    const db = getDb();
    await db.update(profiles).set({
      fullName: full_name,
      phone: phone,
      updatedAt: new Date().toISOString()
    }).where(eq(profiles.id, id)).run();

    const updated = await db.select().from(profiles).where(eq(profiles.id, id)).get();
    return updated;
  });
