import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "@/routes/auth";
import coursesRouter from "@/routes/courses";
import learnRouter from "@/routes/learn";
import uploadRouter from "@/routes/upload";
import superAdminsRouter from "@/routes/super-admins";
import quizzesRouter from "@/routes/quizzes";
import inviteRouter from "@/routes/invite";

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  "http://localhost:3000",
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.some((o) => origin === o || origin === o.replace("://", "://www."))) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/courses", coursesRouter);
app.use("/api/learn", learnRouter);
app.use("/api/upload", uploadRouter);
app.use("/api/super/admins", superAdminsRouter);
app.use("/api/quizzes", quizzesRouter);
app.use("/api/invite", inviteRouter);

app.listen(PORT, () => {
  console.log(`Ginger Pop API listening on http://localhost:${PORT}`);
});

export default app;
