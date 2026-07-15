/**
 * Seed a demo student account.
 * Usage: npm run seed:student
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI;

const STUDENT_EMAIL = process.env.STUDENT_EMAIL ?? "student@quiz.com";
const STUDENT_PASSWORD = process.env.STUDENT_PASSWORD ?? "student123";
const STUDENT_NAME = process.env.STUDENT_NAME ?? "Demo Student";

async function seed() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is required");
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const StudentSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, lowercase: true },
    passwordHash: String,
    active: { type: Boolean, default: true },
  });

  const Student = mongoose.models.Student || mongoose.model("Student", StudentSchema);

  const normalized = STUDENT_EMAIL.toLowerCase().trim();
  const passwordHash = await bcrypt.hash(STUDENT_PASSWORD, 12);
  const existing = await Student.findOne({ email: normalized });

  if (existing) {
    existing.name = STUDENT_NAME;
    existing.passwordHash = passwordHash;
    existing.active = true;
    await existing.save();
    console.log(`Updated student: ${normalized}`);
  } else {
    await Student.create({
      name: STUDENT_NAME,
      email: normalized,
      passwordHash,
      active: true,
    });
    console.log(`Created student: ${normalized}`);
  }

  console.log("\nStudent login credentials:");
  console.log(`  Email:    ${STUDENT_EMAIL}`);
  console.log(`  Password: ${STUDENT_PASSWORD}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
