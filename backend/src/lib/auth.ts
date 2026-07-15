import { Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { AdminRole } from "@/models/Admin";

const COOKIE_NAME = "admin_token";
const STUDENT_COOKIE_NAME = "student_token";

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not defined");
  return new TextEncoder().encode(secret);
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createAdminToken(adminId: string, email: string, role: AdminRole) {
  return new SignJWT({ adminId, email, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAdminToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { adminId: string; email: string; role?: AdminRole };
}

export function getTokenFromRequest(req: Request) {
  return req.cookies?.[COOKIE_NAME];
}

export function setAdminCookie(res: Response, token: string) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
}

export function clearAdminCookie(res: Response) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export async function getAdminSessionFromRequest(req: Request) {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return await verifyAdminToken(token);
  } catch {
    return null;
  }
}

/* ── Student auth (parallel to admin) ───────────────────────────────────── */

export async function createStudentToken(studentId: string, email: string) {
  return new SignJWT({ studentId, email, role: "student" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyStudentToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { studentId: string; email: string; role?: string };
}

export function getStudentTokenFromRequest(req: Request) {
  return req.cookies?.[STUDENT_COOKIE_NAME];
}

export function setStudentCookie(res: Response, token: string) {
  res.cookie(STUDENT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1000,
  });
}

export function clearStudentCookie(res: Response) {
  res.clearCookie(STUDENT_COOKIE_NAME, { path: "/" });
}

export async function getStudentSessionFromRequest(req: Request) {
  const token = getStudentTokenFromRequest(req);
  if (!token) return null;
  try {
    return await verifyStudentToken(token);
  } catch {
    return null;
  }
}

export { COOKIE_NAME, STUDENT_COOKIE_NAME };
