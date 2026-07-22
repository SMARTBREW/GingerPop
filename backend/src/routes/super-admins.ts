import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { hashPassword } from "@/lib/auth";
import { requireSuperAdmin, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk } from "@/lib/api";
import {
  emailConflictMessage,
  findEmailConflict,
  normalizeAccountEmail,
} from "@/lib/account-email";
import { Admin } from "@/models/Admin";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  await connectDB();
  const admins = await Admin.find({ role: "admin" }).sort({ createdAt: -1 });

  return jsonOk(res, {
    admins: admins.map((a) => ({
      id: a._id.toString(),
      name: a.name,
      email: a.email,
      active: a.active,
      createdAt: a.createdAt,
    })),
  });
});

router.post("/", async (req: Request, res: Response) => {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return jsonError(res, "Name, email, and password are required");
    }
    if (password.length < 6) {
      return jsonError(res, "Password must be at least 6 characters");
    }

    await connectDB();

    const normalized = normalizeAccountEmail(email);
    const conflict = await findEmailConflict(normalized);
    if (conflict) return jsonError(res, emailConflictMessage(conflict), 409);

    const passwordHash = await hashPassword(password);
    const admin = await Admin.create({
      name: name.trim(),
      email: normalized,
      passwordHash,
      role: "admin",
      active: true,
      createdBy: auth.admin.id,
    });

    return jsonOk(
      res,
      {
        admin: {
          id: admin._id.toString(),
          name: admin.name,
          email: admin.email,
          active: admin.active,
        },
      },
      201,
    );
  } catch (err) {
    console.error("Create admin error:", err);
    return jsonError(res, "Failed to create admin", 500);
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;

  try {
    const { active, name, email, password } = req.body as {
      active?: boolean;
      name?: string;
      email?: string;
      password?: string;
    };

    if (password !== undefined) {
      return jsonError(
        res,
        "Passwords cannot be changed here. Only the account owner can update their password after login.",
        403,
      );
    }

    await connectDB();

    const admin = await Admin.findOne({ _id: id, role: "admin" });
    if (!admin) return jsonError(res, "Admin not found", 404);

    if (typeof active === "boolean") admin.active = active;
    if (name?.trim()) admin.name = name.trim();

    if (email?.trim()) {
      const normalized = normalizeAccountEmail(email);
      if (normalized !== admin.email) {
        const conflict = await findEmailConflict(normalized, { excludeAdminId: admin._id.toString() });
        if (conflict) return jsonError(res, emailConflictMessage(conflict), 409);
        admin.email = normalized;
      }
    }

    await admin.save();

    return jsonOk(res, {
      success: true,
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        active: admin.active,
      },
    });
  } catch (err) {
    console.error("Update admin error:", err);
    return jsonError(res, "Failed to update admin", 500);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const auth = await requireSuperAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;
  await connectDB();

  const result = await Admin.deleteOne({ _id: id, role: "admin" });
  if (result.deletedCount === 0) return jsonError(res, "Admin not found", 404);

  return jsonOk(res, { success: true });
});

export default router;
