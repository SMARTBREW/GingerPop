/**
 * Seed super admin + regular admin accounts.
 * Usage: npm run seed:admin
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL ?? "superadmin@quiz.com";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD ?? "superadmin123";
const SUPER_ADMIN_NAME = process.env.SUPER_ADMIN_NAME ?? "Super Admin";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@quiz.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123";
const ADMIN_NAME = process.env.ADMIN_NAME ?? "Admin";

async function upsertAdmin(
  Admin: mongoose.Model<{
    name: string;
    email: string;
    passwordHash: string;
    role: string;
    active: boolean;
  }>,
  {
    email,
    password,
    name,
    role,
  }: { email: string; password: string; name: string; role: "super_admin" | "admin" },
) {
  const normalized = email.toLowerCase().trim();
  const existing = await Admin.findOne({ email: normalized });
  const passwordHash = await bcrypt.hash(password, 12);

  if (existing) {
    existing.name = name;
    existing.passwordHash = passwordHash;
    existing.role = role;
    existing.active = true;
    await existing.save();
    console.log(`  Updated: ${normalized} (${role})`);
    return;
  }

  await Admin.create({
    name,
    email: normalized,
    passwordHash,
    role,
    active: true,
  });
  console.log(`  Created: ${normalized} (${role})`);
}

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const AdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    role: { type: String, enum: ["super_admin", "admin"], default: "admin" },
    active: { type: Boolean, default: true },
    createdBy: mongoose.Schema.Types.ObjectId,
  });

  const Admin = mongoose.models.Admin || mongoose.model("Admin", AdminSchema);

  console.log("Seeding accounts...\n");

  await upsertAdmin(Admin, {
    email: SUPER_ADMIN_EMAIL,
    password: SUPER_ADMIN_PASSWORD,
    name: SUPER_ADMIN_NAME,
    role: "super_admin",
  });

  await upsertAdmin(Admin, {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    name: ADMIN_NAME,
    role: "admin",
  });

  console.log("\nDone! Login credentials:\n");
  console.log("Super Admin (manages admins):");
  console.log(`  Email:    ${SUPER_ADMIN_EMAIL}`);
  console.log(`  Password: ${SUPER_ADMIN_PASSWORD}\n`);
  console.log("Admin (creates courses & invites):");
  console.log(`  Email:    ${ADMIN_EMAIL}`);
  console.log(`  Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
