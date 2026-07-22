import { Admin } from "@/models/Admin";
import { Student } from "@/models/Student";

export function normalizeAccountEmail(email: string) {
  return email.toLowerCase().trim();
}

type EmailConflictOptions = {
  excludeAdminId?: string;
  excludeStudentId?: string;
};

/** Returns which account type already owns this email, if any. */
export async function findEmailConflict(
  email: string,
  options: EmailConflictOptions = {},
): Promise<"admin" | "student" | null> {
  const normalized = normalizeAccountEmail(email);
  if (!normalized) return null;

  const adminFilter: Record<string, unknown> = { email: normalized };
  const studentFilter: Record<string, unknown> = { email: normalized };

  if (options.excludeAdminId) {
    adminFilter._id = { $ne: options.excludeAdminId };
  }
  if (options.excludeStudentId) {
    studentFilter._id = { $ne: options.excludeStudentId };
  }

  const [admin, student] = await Promise.all([
    Admin.findOne(adminFilter).select("_id"),
    Student.findOne(studentFilter).select("_id"),
  ]);

  if (admin) return "admin";
  if (student) return "student";
  return null;
}

export function emailConflictMessage(type: "admin" | "student") {
  return type === "admin"
    ? "This email is already registered as an admin account"
    : "This email is already registered as a student account";
}
