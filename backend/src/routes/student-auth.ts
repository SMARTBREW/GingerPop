import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import {
  createStudentToken,
  setStudentCookie,
  clearStudentCookie,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { getSessionStudent } from "@/lib/permissions";
import { jsonError, jsonOk, unauthorized } from "@/lib/api";
import { Student } from "@/models/Student";

const router = Router();

function publicStudent(student: {
  _id: { toString(): string };
  name: string;
  email: string;
  mustChangePassword?: boolean;
}) {
  return {
    id: student._id.toString(),
    name: student.name,
    email: student.email,
    role: "student" as const,
    mustChangePassword: Boolean(student.mustChangePassword),
  };
}

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name?.trim() || !email?.trim() || !password) {
      return jsonError(res, "Name, email and password are required");
    }

    if (password.length < 6) {
      return jsonError(res, "Password must be at least 6 characters");
    }

    await connectDB();

    const normalized = email.toLowerCase().trim();
    const existing = await Student.findOne({ email: normalized });
    if (existing) {
      return jsonError(res, "An account with this email already exists", 409);
    }

    const student = await Student.create({
      name: name.trim(),
      email: normalized,
      passwordHash: await hashPassword(password),
      mustChangePassword: false,
      active: true,
    });

    const token = await createStudentToken(student._id.toString(), student.email);
    setStudentCookie(res, token);

    return jsonOk(res, { student: publicStudent(student) }, 201);
  } catch (err) {
    console.error("Student register error:", err);
    return jsonError(res, "Registration failed", 500);
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      return jsonError(res, "Email and password are required");
    }

    await connectDB();

    const student = await Student.findOne({ email: email.toLowerCase().trim() });
    if (!student || !student.active) {
      return jsonError(res, "Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, student.passwordHash);
    if (!valid) {
      return jsonError(res, "Invalid email or password", 401);
    }

    const token = await createStudentToken(student._id.toString(), student.email);
    setStudentCookie(res, token);

    return jsonOk(res, { student: publicStudent(student) });
  } catch (err) {
    console.error("Student login error:", err);
    return jsonError(res, "Login failed", 500);
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  clearStudentCookie(res);
  return jsonOk(res, { success: true });
});

router.get("/me", async (req: Request, res: Response) => {
  const student = await getSessionStudent(req);
  if (!student) return unauthorized(res);
  return jsonOk(res, {
    student: { ...student, role: "student" as const },
  });
});

/** First login after admin-created account: set a new password or keep the temporary one. */
router.post("/password-setup", async (req: Request, res: Response) => {
  try {
    const studentSession = await getSessionStudent(req);
    if (!studentSession) return unauthorized(res);

    const { newPassword, keepTemporary } = req.body as {
      newPassword?: string;
      keepTemporary?: boolean;
    };

    await connectDB();
    const student = await Student.findById(studentSession.id);
    if (!student || !student.active) return unauthorized(res);

    if (!student.mustChangePassword) {
      return jsonOk(res, { student: publicStudent(student), alreadyComplete: true });
    }

    if (keepTemporary) {
      student.mustChangePassword = false;
      await student.save();
      return jsonOk(res, { student: publicStudent(student) });
    }

    if (!newPassword || newPassword.length < 6) {
      return jsonError(res, "New password must be at least 6 characters");
    }

    student.passwordHash = await hashPassword(newPassword);
    student.mustChangePassword = false;
    await student.save();

    return jsonOk(res, { student: publicStudent(student) });
  } catch (err) {
    console.error("Student password setup error:", err);
    return jsonError(res, "Failed to update password", 500);
  }
});

export default router;
