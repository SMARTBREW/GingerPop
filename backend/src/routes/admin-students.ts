import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { requireAdmin, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk } from "@/lib/api";
import { Student } from "@/models/Student";
import { Invitation } from "@/models/Invitation";

const router = Router();

function publicStudent(s: {
  _id: { toString(): string };
  name: string;
  email: string;
  active: boolean;
  createdAt: Date;
  createdBy?: { toString(): string };
}) {
  return {
    id: s._id.toString(),
    name: s.name,
    email: s.email,
    active: s.active,
    createdAt: s.createdAt,
    createdBy: s.createdBy?.toString() ?? null,
  };
}

/** List all students (any admin / teacher) */
router.get("/", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  await connectDB();
  const students = await Student.find().sort({ createdAt: -1 });

  return jsonOk(res, {
    students: students.map(publicStudent),
  });
});

/** Create a student account */
router.post("/", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return jsonError(res, "Name, email, and password are required");
    }
    if (password.length < 6) {
      return jsonError(res, "Password must be at least 6 characters");
    }

    await connectDB();

    const normalized = email.toLowerCase().trim();
    const exists = await Student.findOne({ email: normalized });
    if (exists) return jsonError(res, "A student with this email already exists", 409);

    const student = await Student.create({
      name: name.trim(),
      email: normalized,
      passwordHash: await hashPassword(password),
      mustChangePassword: true,
      active: true,
      createdBy: auth.admin.id,
    });

    return jsonOk(res, { student: publicStudent(student) }, 201);
  } catch (err) {
    console.error("Create student error:", err);
    return jsonError(res, "Failed to create student", 500);
  }
});

/**
 * Update student profile (name, email, active).
 * Password cannot be changed by admins — only the student can change it.
 */
router.patch("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  try {
    const { id } = req.params;
    const { active, name, email, password } = req.body as {
      active?: boolean;
      name?: string;
      email?: string;
      password?: string;
    };

    if (password !== undefined) {
      return jsonError(
        res,
        "Admins cannot change student passwords. Only the student can update their password after login.",
        403,
      );
    }

    await connectDB();
    const student = await Student.findById(id);
    if (!student) return jsonError(res, "Student not found", 404);

    const previousEmail = student.email;

    if (typeof active === "boolean") student.active = active;
    if (name?.trim()) student.name = name.trim();

    if (email?.trim()) {
      const normalized = email.toLowerCase().trim();
      if (normalized !== student.email) {
        const exists = await Student.findOne({ email: normalized, _id: { $ne: student._id } });
        if (exists) return jsonError(res, "A student with this email already exists", 409);
        student.email = normalized;
      }
    }

    await student.save();

    // Keep invites linked to the same learner when email is updated
    if (student.email !== previousEmail) {
      await Invitation.updateMany({ email: previousEmail }, { $set: { email: student.email } });
    }

    return jsonOk(res, { student: publicStudent(student) });
  } catch (err) {
    console.error("Update student error:", err);
    return jsonError(res, "Failed to update student", 500);
  }
});

/** Permanently delete a student account and their invitations */
router.delete("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  try {
    const { id } = req.params;
    await connectDB();

    const student = await Student.findById(id);
    if (!student) return jsonError(res, "Student not found", 404);

    const email = student.email;
    await Student.deleteOne({ _id: id });
    await Invitation.deleteMany({ email });

    return jsonOk(res, { success: true, deletedEmail: email });
  } catch (err) {
    console.error("Delete student error:", err);
    return jsonError(res, "Failed to delete student", 500);
  }
});

export default router;
