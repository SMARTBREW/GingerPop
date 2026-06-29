import { Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { Admin, AdminRole } from "@/models/Admin";
import { jsonError } from "@/lib/api";

export interface SessionAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export type AuthError = { error: string; status: number };

export async function getSessionAdmin(req: Request): Promise<SessionAdmin | null> {
  const session = await getAdminSessionFromRequest(req);
  if (!session) return null;

  await connectDB();
  const admin = await Admin.findById(session.adminId);
  if (!admin || !admin.active) return null;

  return {
    id: admin._id.toString(),
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };
}

export async function requireAdmin(
  req: Request,
): Promise<{ admin: SessionAdmin } | AuthError> {
  const admin = await getSessionAdmin(req);
  if (!admin) return { error: "Unauthorized", status: 401 };
  return { admin };
}

export async function requireSuperAdmin(
  req: Request,
): Promise<{ admin: SessionAdmin } | AuthError> {
  const result = await requireAdmin(req);
  if ("error" in result) return result;
  if (result.admin.role !== "super_admin") {
    return { error: "Super admin access required", status: 403 };
  }
  return result;
}

export function canManageCourse(admin: SessionAdmin, courseAdminId: string) {
  return admin.role === "super_admin" || admin.id === courseAdminId;
}

export function sendAuthError(res: Response, auth: AuthError) {
  return jsonError(res, auth.error, auth.status);
}
