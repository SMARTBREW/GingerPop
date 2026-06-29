/**
 * Fix invitation indexes: sparse unique on quizId+email treated all null quizIds as duplicates.
 * Run: npm run fix:invitation-indexes -w backend
 */
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGODB_URI!);
  const collection = mongoose.connection.collection("invitations");

  for (const name of ["courseId_1_email_1", "quizId_1_email_1"]) {
    try {
      await collection.dropIndex(name);
      console.log(`Dropped index ${name}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.log(`Skip drop ${name}:`, message);
    }
  }

  await collection.createIndex(
    { courseId: 1, email: 1 },
    {
      unique: true,
      partialFilterExpression: { courseId: { $exists: true, $type: "objectId" } },
      name: "courseId_1_email_1",
    },
  );
  console.log("Created courseId_1_email_1 (partial)");

  await collection.createIndex(
    { quizId: 1, email: 1 },
    {
      unique: true,
      partialFilterExpression: { quizId: { $exists: true, $type: "objectId" } },
      name: "quizId_1_email_1",
    },
  );
  console.log("Created quizId_1_email_1 (partial)");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
