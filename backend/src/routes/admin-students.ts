import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { requireAdmin, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk } from "@/lib/api";
import { Student } from "@/models/Student";

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
      active: true,
      createdBy: auth.admin.id,
    });

    return jsonOk(res, { student: publicStudent(student) }, 201);
  } catch (err) {
    console.error("Create student error:", err);
    return jsonError(res, "Failed to create student", 500);
  }
});

/** Update student (active, name, or reset password) */
router.patch("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  try {
    const { id } = req.params;
    const { active, name, password } = req.body as {
      active?: boolean;
      name?: string;
      password?: string;
    };

    await connectDB();
    const student = await Student.findById(id);
    if (!student) return jsonError(res, "Student not found", 404);

    if (typeof active === "boolean") student.active = active;
    if (name?.trim()) student.name = name.trim();
    if (password) {
      if (password.length < 6) {
        return jsonError(res, "Password must be at least 6 characters");
      }
      student.passwordHash = await hashPassword(password);
    }

    await student.save();
    return jsonOk(res, { student: publicStudent(student) });
  } catch (err) {
    console.error("Update student error:", err);
    return jsonError(res, "Failed to update student", 500);
  }
});

export default router;
