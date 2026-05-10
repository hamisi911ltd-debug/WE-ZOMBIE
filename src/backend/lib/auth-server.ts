import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDb } from "./db";
import { profiles, userRoles } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { getCookie, setCookie } from "@tanstack/react-start/server";

const JWT_SECRET = new TextEncoder().encode("super-secret-key-replace-in-prod");

export const loginFn = createServerFn({ method: "POST" }).validator((d: any) => d as {email: string, password: string}).handler(async ({ data }) => {
  const result = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }).safeParse(data);

  if (!result.success) throw new Error("Invalid input");

  const { email, password } = result.data;
  const db = getDb(process.env); 

  const user = await db.select().from(profiles).where(eq(profiles.email, email)).get();
  if (!user) throw new Error("Invalid credentials");


  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw new Error("Invalid credentials");

  const token = await new SignJWT({ sub: user.id, email: user.email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  setCookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, userId: user.id };
});

export const signupFn = createServerFn({ method: "POST" }).validator((d: any) => d as {email: string, password: string, fullName?: string}).handler(async ({ data }) => {
  const result = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    fullName: z.string().optional(),
  }).safeParse(data);

  if (!result.success) throw new Error("Invalid input");

  const { email, password, fullName } = result.data;
  const db = getDb(process.env);

  const existing = await db.select().from(profiles).where(eq(profiles.email, email)).get();
  if (existing) throw new Error("User already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const id = crypto.randomUUID();

  await db.insert(profiles).values({
    id,
    email,
    passwordHash,
    fullName: fullName || "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }).run();

  const token = await new SignJWT({ sub: id, email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  setCookie("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { success: true, userId: id };
});

export const adminCreateUserFn = createServerFn({ method: "POST" })
  .validator((d: { email: string; fullName: string; role: string }) => d)
  .handler(async ({ data: { email, fullName, role } }) => {
    const session = await getSessionFn();
    if (!session || !session.roles.includes("admin")) throw new Error("Unauthorized");

    const db = getDb(process.env);
    const existing = await db.select().from(profiles).where(eq(profiles.email, email)).get();
    if (existing) throw new Error("User already exists");

    const id = crypto.randomUUID();
    const tempPassword = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    await db.insert(profiles).values({
      id,
      email,
      passwordHash,
      fullName: fullName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }).run();

    await db.insert(userRoles).values({
      userId: id,
      role: role
    }).run();

    return { success: true, userId: id };
  });


export const logoutFn = createServerFn({ method: "POST" }).handler(async () => {
  setCookie("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return { success: true };
});


export const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const token = getCookie("session");

  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.sub as string;
    
    // Get profile and roles
    const db = getDb(process.env);
    const profile = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.id, userId)).get();
    const rolesData = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, userId)).all();
    const roles = rolesData.map(r => r.role);

    return { 
      user: { 
        id: userId, 
        email: payload.email as string, 
        fullName: profile?.fullName || null 
      }, 
      roles 
    };
  } catch (err) {
    return null;
  }
});
