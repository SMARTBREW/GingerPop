import { Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { getAdminSessionFromRequest, getStudentSessionFromRequest } from "@/lib/auth";
import { Admin, AdminRole } from "@/models/Admin";
import { Student } from "@/models/Student";
import { jsonError } from "@/lib/api";

export interface SessionAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
}

export interface SessionStudent {
  id: string;
  name: string;
  email: string;
  mustChangePassword?: boolean;
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

export async function getSessionStudent(req: Request): Promise<SessionStudent | null> {
  const session = await getStudentSessionFromRequest(req);
  if (!session?.studentId) return null;

  await connectDB();
  const student = await Student.findById(session.studentId);
  if (!student || !student.active) return null;

  return {
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    mustChangePassword: Boolean(student.mustChangePassword),
  };
}

export async function requireStudent(
  req: Request,
): Promise<{ student: SessionStudent } | AuthError> {
  const student = await getSessionStudent(req);
  if (!student) return { error: "Unauthorized", status: 401 };
  return { student };
}

/**
 * Invite play access: logged-in admin/superadmin may open any invite link;
 * students must be logged in and their email must match the invitation.
 */
export async function requireInviteLearnAccess(
  req: Request,
  invitationEmail: string,
): Promise<
  | { actor: "admin"; admin: SessionAdmin }
  | { actor: "student"; student: SessionStudent }
  | AuthError
> {
  const admin = await getSessionAdmin(req);
  if (admin) return { actor: "admin", admin };

  const student = await getSessionStudent(req);
  if (!student) {
    return { error: "Student login required", status: 401 };
  }

  const invited = invitationEmail.toLowerCase().trim();
  if (student.email.toLowerCase().trim() !== invited) {
    return {
      error: `This quest was invited to ${invitationEmail}. Please log in with that student account to continue.`,
      status: 403,
    };
  }

  return { actor: "student", student };
}

export function canManageCourse(admin: SessionAdmin, courseAdminId: string) {
  return admin.role === "super_admin" || admin.id === courseAdminId;
}

export function sendAuthError(res: Response, auth: AuthError) {
  return jsonError(res, auth.error, auth.status);
}
