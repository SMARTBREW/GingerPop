import { Router, Request, Response } from "express";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { requireAdmin, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk, unauthorized, getAppUrl } from "@/lib/api";
import { validateQuizQuestions } from "@/lib/content-limits";
import { sendInviteEmail } from "@/lib/email";
import { inviteExpiresAt } from "@/lib/invitation-expiry";
import { Quiz, IQuizQuestion } from "@/models/Quiz";
import { Invitation, IAnswerRecord } from "@/models/Invitation";
import { Admin } from "@/models/Admin";
import { Course, ILesson } from "@/models/Course";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  await connectDB();
  const filter = auth.admin.role === "super_admin" ? {} : { adminId: auth.admin.id };
  const quizzes = await Quiz.find(filter)
    .sort({ updatedAt: -1 })
    .select("title description questions referenceCourseId referenceLessonId updatedAt createdAt");

  const courseIds = quizzes.flatMap((quiz) =>
    quiz.referenceCourseId ? [quiz.referenceCourseId] : [],
  );
  const referenceCourses = await Course.find({ _id: { $in: courseIds } }).select("title lessons");
  const courseById = new Map(referenceCourses.map((course) => [course._id.toString(), course]));

  return jsonOk(res, {
    quizzes: quizzes.map((q) => ({
      id: q._id.toString(),
      title: q.title,
      description: q.description,
      questionCount: q.questions.length,
      referenceCourseTitle: q.referenceCourseId
        ? courseById.get(q.referenceCourseId.toString())?.title
        : undefined,
      referenceLessonTitle: q.referenceCourseId && q.referenceLessonId
        ? courseById
            .get(q.referenceCourseId.toString())
            ?.lessons.find((lesson: ILesson) => lesson._id.equals(q.referenceLessonId!))?.title
        : undefined,
      updatedAt: q.updatedAt,
      createdAt: q.createdAt,
    })),
  });
});

router.get("/reference-options", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  await connectDB();
  const filter = auth.admin.role === "super_admin" ? {} : { adminId: auth.admin.id };
  const courses = await Course.find(filter)
    .sort({ title: 1 })
    .select("title lessons._id lessons.title");

  return jsonOk(res, {
    courses: courses.map((course) => ({
      id: course._id.toString(),
      title: course.title,
      lessons: course.lessons.map((lesson: ILesson) => ({
        id: lesson._id.toString(),
        title: lesson.title,
      })),
    })),
  });
});

router.post("/", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  try {
    const { title, description } = req.body;
    if (!title?.trim()) return jsonError(res, "Title is required");

    await connectDB();
    const quiz = await Quiz.create({
      title: title.trim(),
      description: description?.trim(),
      adminId: auth.admin.id,
      questions: [],
    });

    return jsonOk(res, { quiz: { id: quiz._id.toString(), title: quiz.title } }, 201);
  } catch (err) {
    console.error("Create quiz error:", err);
    return jsonError(res, "Failed to create quiz", 500);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;
  await connectDB();

  const quiz = await Quiz.findById(id);
  if (!quiz) return jsonError(res, "Quiz not found", 404);
  if (auth.admin.role !== "super_admin" && quiz.adminId.toString() !== auth.admin.id) {
    return unauthorized(res);
  }

  const invitations = await Invitation.find({ quizId: id }).sort({ createdAt: -1 });

  return jsonOk(res, {
    quiz: {
      id: quiz._id.toString(),
      title: quiz.title,
      description: quiz.description,
      referenceCourseId: quiz.referenceCourseId?.toString(),
      referenceLessonId: quiz.referenceLessonId?.toString(),
      questions: quiz.questions
        .sort((a: IQuizQuestion, b: IQuizQuestion) => a.order - b.order)
        .map((q: IQuizQuestion) => ({
          id: q._id.toString(),
          type: q.type,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          points: q.points,
          timeLimit: q.timeLimit,
          mediaUrl: q.mediaUrl,
          mediaCaption: q.mediaCaption,
          order: q.order,
        })),
    },
    invitations: invitations.map((inv) => ({
      id: inv._id.toString(),
      email: inv.email,
      status: inv.status ?? inv.phase,
      score: inv.score,
      maxScore: inv.maxScore,
      sentAt: inv.sentAt,
      completedAt: inv.completedAt,
    })),
  });
});

router.put("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;

  try {
    const body = req.body;
    await connectDB();

    const quiz = await Quiz.findById(id);
    if (!quiz) return jsonError(res, "Quiz not found", 404);
    if (auth.admin.role !== "super_admin" && quiz.adminId.toString() !== auth.admin.id) {
      return unauthorized(res);
    }

    if (body.title !== undefined) quiz.title = body.title.trim();
    if (body.description !== undefined) quiz.description = body.description?.trim();
    if (body.referenceCourseId || body.referenceLessonId) {
      const referenceCourse = await Course.findById(body.referenceCourseId);
      if (!referenceCourse) return jsonError(res, "Referenced subject not found", 404);
      if (
        auth.admin.role !== "super_admin" &&
        referenceCourse.adminId.toString() !== auth.admin.id
      ) {
        return unauthorized(res);
      }
      const referenceLesson = referenceCourse.lessons.find(
        (lesson: ILesson) => lesson._id.toString() === body.referenceLessonId,
      );
      if (!referenceLesson) return jsonError(res, "Referenced lesson not found", 400);
      quiz.referenceCourseId = referenceCourse._id;
      quiz.referenceLessonId = referenceLesson._id;
    } else if (
      body.referenceCourseId === null ||
      body.referenceLessonId === null
    ) {
      quiz.referenceCourseId = undefined;
      quiz.referenceLessonId = undefined;
    }

    if (body.questions !== undefined) {
      const limitCheck = validateQuizQuestions(body.questions);
      if (!limitCheck.valid) return jsonError(res, limitCheck.error, 400);

      quiz.questions = body.questions.map(
        (
          q: {
            type: string;
            question: string;
            options: string[];
            correctIndex: number;
            points: number;
            timeLimit: number;
            mediaUrl?: string;
            mediaCaption?: string;
            order: number;
          },
          idx: number,
        ) => ({
          type: q.type,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          points: q.points ?? 10,
          timeLimit: q.timeLimit ?? 30,
          mediaUrl: q.mediaUrl,
          mediaCaption: q.mediaCaption,
          order: q.order ?? idx,
        }),
      );
    }

    await quiz.save();
    return jsonOk(res, { success: true });
  } catch (err) {
    console.error("Update quiz error:", err);
    return jsonError(res, "Failed to update quiz", 500);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;
  await connectDB();

  const quiz = await Quiz.findById(id);
  if (!quiz) return jsonError(res, "Quiz not found", 404);
  if (auth.admin.role !== "super_admin" && quiz.adminId.toString() !== auth.admin.id) {
    return unauthorized(res);
  }

  await Quiz.deleteOne({ _id: id });
  await Invitation.deleteMany({ quizId: id });
  return jsonOk(res, { success: true });
});

router.post("/:id/invitations", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;

  try {
    const { emails } = req.body;
    if (!Array.isArray(emails) || emails.length === 0) {
      return jsonError(res, "At least one email is required");
    }

    const emailList = [
      ...new Set(
        emails
          .map((e: string) => e.toLowerCase().trim())
          .filter((e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)),
      ),
    ];

    if (emailList.length === 0) return jsonError(res, "No valid emails provided");

    await connectDB();

    const quiz = await Quiz.findById(id);
    if (!quiz) return jsonError(res, "Quiz not found", 404);
    if (auth.admin.role !== "super_admin" && quiz.adminId.toString() !== auth.admin.id) {
      return unauthorized(res);
    }

    if (quiz.questions.length === 0) {
      return jsonError(res, "Add questions to the quiz before sending invites");
    }

    const admin = await Admin.findById(auth.admin.id);
    if (!admin) return unauthorized(res);

    const maxScore = quiz.questions.reduce((sum: number, q: IQuizQuestion) => sum + q.points, 0);
    const results: { email: string; sent: boolean; inviteLink: string }[] = [];

    for (const email of emailList) {
      let invitation = await Invitation.findOne({ quizId: id, email });

      if (!invitation) {
        const now = new Date();
        invitation = await Invitation.create({
          quizId: id,
          adminId: auth.admin.id,
          email,
          token: crypto.randomBytes(32).toString("hex"),
          maxScore,
          status: "pending",
          phase: "quiz",
          sentAt: now,
          expiresAt: inviteExpiresAt(now),
        });
      } else if (invitation.status === "completed" || invitation.phase === "completed") {
        results.push({
          email,
          sent: false,
          inviteLink: `${getAppUrl()}/invite/${invitation.token}`,
        });
        continue;
      } else {
        invitation.maxScore = maxScore;
        invitation.token = crypto.randomBytes(32).toString("hex");
        invitation.status = invitation.status ?? "pending";
        const now = new Date();
        invitation.sentAt = now;
        invitation.expiresAt = inviteExpiresAt(now);
        await invitation.save();
      }

      const inviteLink = `${getAppUrl()}/invite/${invitation.token}`;
      const mailResult = await sendInviteEmail({
        to: email,
        quizTitle: quiz.title,
        inviteLink,
        adminName: admin.name,
        adminEmail: admin.email,
        expiresAt: invitation.expiresAt,
      });

      results.push({ email, sent: mailResult.sent, inviteLink });
    }

    return jsonOk(res, { results });
  } catch (err) {
    console.error("Invite error:", err);
    return jsonError(res, "Failed to send invitations", 500);
  }
});

export default router;
