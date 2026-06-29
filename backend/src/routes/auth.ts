import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { createAdminToken, setAdminCookie, clearAdminCookie, verifyPassword } from "@/lib/auth";
import { getSessionAdmin, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk, unauthorized } from "@/lib/api";
import { Admin } from "@/models/Admin";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return jsonError(res, "Email and password are required");
    }

    await connectDB();

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin || !admin.active) {
      return jsonError(res, "Invalid email or password", 401);
    }

    const valid = await verifyPassword(password, admin.passwordHash);
    if (!valid) {
      return jsonError(res, "Invalid email or password", 401);
    }

    const token = await createAdminToken(admin._id.toString(), admin.email, admin.role);
    setAdminCookie(res, token);

    return jsonOk(res, {
      admin: {
        id: admin._id.toString(),
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return jsonError(res, "Login failed", 500);
  }
});

router.post("/logout", (_req: Request, res: Response) => {
  clearAdminCookie(res);
  return jsonOk(res, { success: true });
});

router.get("/me", async (req: Request, res: Response) => {
  const admin = await getSessionAdmin(req);
  if (!admin) return unauthorized(res);
  return jsonOk(res, { admin });
});

export default router;
