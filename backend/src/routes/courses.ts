import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { canManageCourse, requireAdmin, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk, unauthorized, getAppUrl } from "@/lib/api";
import { validateCourseStructure, canSendInvites } from "@/lib/course-rules";
import { validateCourseContent } from "@/lib/content-limits";
import { buildLessonIdMap, isValidObjectId, resolveLessonObjectId } from "@/lib/course-id-map";
import { sendCourseInviteEmail } from "@/lib/email";
import { inviteExpiresAt } from "@/lib/invitation-expiry";
import { resetInvitationForRetake } from "@/lib/invitation-reset";
import { Course, ICourseQuizQuestion, ILesson } from "@/models/Course";
import { Invitation } from "@/models/Invitation";
import { Admin } from "@/models/Admin";
import { Student } from "@/models/Student";
import { collectCourseMediaUrls, deleteCloudinaryUrls } from "@/lib/cloudinary";
import { courseSlug, lessonSlug } from "@/lib/play-lesson";

const router = Router();

function normalizeSlug(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-|-$/g, "");
}

function uniqueSlug(base: unknown, used: Set<string>, stableSuffix: string) {
  const normalized = normalizeSlug(base) || stableSuffix;
  let candidate = normalized;
  if (used.has(candidate)) candidate = `${normalized}-${stableSuffix}`;
  let counter = 2;
  while (used.has(candidate)) candidate = `${normalized}-${stableSuffix}-${counter++}`;
  used.add(candidate);
  return candidate;
}

function serializeLesson(l: ILesson) {
  return {
    id: l._id.toString(),
    type: l.type,
    title: l.title,
    content: l.content,
    mediaUrl: l.mediaUrl,
    mediaCaption: l.mediaCaption,
    order: l.order,
    slug: l.slug,
    topicTitle: l.topicTitle,
    topicEmoji: l.topicEmoji,
    topicDescription: l.topicDescription,
    badgeText: l.badgeText,
    mascotSpeech: l.mascotSpeech,
    ctaText: l.ctaText,
    imageUrl: l.imageUrl,
    videoUrl: l.videoUrl,
    audioUrl: l.audioUrl,
    audioText: l.audioText,
    pages: (l.pages ?? []).map((p) => ({
      title: p.title,
      content: p.content,
      imageUrl: p.imageUrl,
      videoUrl: p.videoUrl,
      audioUrl: p.audioUrl,
      audioText: p.audioText,
    })),
  };
}

function serializeQuestion(q: ICourseQuizQuestion) {
  return {
    id: q._id.toString(),
    type: q.type,
    question: q.question,
    examples: q.examples,
    options: q.options,
    correctIndex: q.correctIndex,
    points: q.points,
    timeLimit: q.timeLimit,
    mediaUrl: q.mediaUrl,
    mediaCaption: q.mediaCaption,
    order: q.order,
    lessonId: q.lessonId?.toString(),
    subtitle: q.subtitle,
    hint: q.hint,
    explanation: q.explanation,
    wrongExplanation: q.wrongExplanation,
    optionEmojis: q.optionEmojis,
    imageUrl: q.imageUrl,
    videoUrl: q.videoUrl,
    audioUrl: q.audioUrl,
    audioText: q.audioText,
  };
}

router.get("/", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  await connectDB();

  const filter =
    auth.admin.role === "super_admin" ? {} : { adminId: auth.admin.id };

  const courses = await Course.find(filter).sort({ updatedAt: -1 });

  return jsonOk(res, {
    courses: courses.map((c) => ({
      id: c._id.toString(),
      title: c.title,
      description: c.description,
      published: c.published,
      emoji: c.emoji,
      color: c.color,
      accent: c.accent,
      slug: c.slug,
      lessonCount: c.lessons.length,
      quizCount: c.quizQuestions.length,
      updatedAt: c.updatedAt,
      createdAt: c.createdAt,
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
    const course = await Course.create({
      title: title.trim(),
      description: description?.trim(),
      adminId: auth.admin.id,
      lessons: [],
      quizQuestions: [],
      published: false,
    });

    return jsonOk(res, { course: { id: course._id.toString(), title: course.title } }, 201);
  } catch (err) {
    console.error("Create course error:", err);
    return jsonError(res, "Failed to create course", 500);
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;
  await connectDB();

  const course = await Course.findById(id);
  if (!course) return jsonError(res, "Course not found", 404);
  if (!canManageCourse(auth.admin, course.adminId.toString())) return unauthorized(res);

  const invitations = await Invitation.find({ courseId: id }).sort({ createdAt: -1 });
  const adminIds = [...new Set(invitations.map((inv) => inv.adminId.toString()))];
  const admins = await Admin.find({ _id: { $in: adminIds } });
  const adminNameById = new Map(admins.map((a) => [a._id.toString(), a.name]));

  return jsonOk(res, {
    course: {
      id: course._id.toString(),
      title: course.title,
      description: course.description,
      published: course.published,
      emoji: course.emoji,
      color: course.color,
      accent: course.accent,
      slug: course.slug,
      updatedAt: (course as unknown as { updatedAt?: Date }).updatedAt?.getTime() ?? Date.now(),
      lessons: course.lessons
        .sort((a: ILesson, b: ILesson) => a.order - b.order)
        .map(serializeLesson),
      quizQuestions: course.quizQuestions
        .sort((a: ICourseQuizQuestion, b: ICourseQuizQuestion) => a.order - b.order)
        .map(serializeQuestion),
    },
    invitations: invitations.map((inv) => ({
      id: inv._id.toString(),
      email: inv.email,
      phase: inv.phase,
      score: inv.score,
      maxScore: inv.maxScore,
      lessonsCompleted: inv.completedLessonIds.length,
      sentAt: inv.sentAt,
      expiresAt: inv.expiresAt,
      completedAt: inv.completedAt,
      invitedByName: adminNameById.get(inv.adminId.toString()) ?? null,
      inviteLink: `${getAppUrl()}/learn/${inv.token}`,
      token: inv.token,
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

    const course = await Course.findById(id);
    if (!course) return jsonError(res, "Course not found", 404);
    if (!canManageCourse(auth.admin, course.adminId.toString())) return unauthorized(res);

    const nextLessons =
      body.lessons !== undefined
        ? body.lessons.map(
            (
              l: {
                id?: string;
                type: string;
                title: string;
                content?: string;
                mediaUrl?: string;
                mediaCaption?: string;
                order: number;
              },
              idx: number,
            ) => ({
              id: l.id ?? `idx-${idx}`,
              type: l.type,
              title: l.title,
              content: l.content,
              mediaUrl: l.mediaUrl,
              mediaCaption: l.mediaCaption,
              order: l.order ?? idx,
            }),
          )
        : course.lessons.map((l: ILesson) => ({
            id: l._id.toString(),
            title: l.title,
            type: l.type,
            content: l.content,
            mediaUrl: l.mediaUrl,
            mediaCaption: l.mediaCaption,
            order: l.order,
          }));

    const nextQuestions =
      body.quizQuestions !== undefined
        ? body.quizQuestions.map(
            (
              q: {
                id?: string;
                lessonId?: string;
                type: string;
                question: string;
                examples?: string;
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
              id: q.id,
              lessonId: q.lessonId,
              type: q.type,
              question: q.question,
              examples: q.examples,
              options: q.options,
              correctIndex: q.correctIndex,
              points: q.points ?? 10,
              timeLimit: typeof q.timeLimit === "number" ? q.timeLimit : 30,
              mediaUrl: q.mediaUrl,
              mediaCaption: q.mediaCaption,
              order: q.order ?? idx,
            }),
          )
        : course.quizQuestions.map((q: ICourseQuizQuestion) => ({
            id: q._id.toString(),
            lessonId: q.lessonId?.toString(),
            type: q.type,
            question: q.question,
            examples: q.examples,
            options: q.options,
            correctIndex: q.correctIndex,
            points: q.points,
            timeLimit: q.timeLimit,
            mediaUrl: q.mediaUrl,
            mediaCaption: q.mediaCaption,
            order: q.order,
          }));

    const publishing = body.published === true && !course.published;
    const willPublish = body.published !== undefined ? Boolean(body.published) : course.published;

    if (willPublish || publishing) {
      const check = validateCourseStructure(
        nextLessons.map((l: { id: string; title: string }) => ({ id: l.id, title: l.title })),
        nextQuestions.map((q: { lessonId?: string }) => ({ lessonId: q.lessonId })),
      );
      if (!check.valid) return jsonError(res, check.error ?? "Invalid course structure", 400);
    }

    if (body.lessons !== undefined || body.quizQuestions !== undefined) {
      const limitCheck = validateCourseContent(
        body.lessons !== undefined ? body.lessons : course.lessons,
        body.quizQuestions !== undefined ? body.quizQuestions : course.quizQuestions,
      );
      if (!limitCheck.valid) return jsonError(res, limitCheck.error, 400);
    }

    if (body.title !== undefined) course.title = body.title.trim();
    if (body.description !== undefined) course.description = body.description?.trim();
    if (body.published !== undefined) course.published = Boolean(body.published);
    if (body.emoji !== undefined) course.emoji = String(body.emoji ?? "").trim();
    if (body.color !== undefined) course.color = String(body.color ?? "").trim();
    if (body.accent !== undefined) course.accent = String(body.accent ?? "").trim();

    const otherCourses = await Course.find({ _id: { $ne: course._id } }).select(
      "title slug lessons.title lessons.slug",
    );
    const usedCourseSlugs = new Set(
      otherCourses.map((other) => courseSlug(other)).filter(Boolean),
    );
    course.slug = uniqueSlug(
      body.slug ?? course.slug ?? course.title,
      usedCourseSlugs,
      course._id.toString().slice(-6),
    );
    const usedLessonSlugs = new Set(
      otherCourses.flatMap((other) =>
        other.lessons.map((lesson: ILesson) => lessonSlug(lesson)),
      ),
    );

    const previousMediaUrls = collectCourseMediaUrls(course);

    const mapLessonInput = (
      l: {
        id?: string;
        type: string;
        title: string;
        content?: string;
        mediaUrl?: string;
        mediaCaption?: string;
        order: number;
        slug?: string;
        topicTitle?: string;
        topicEmoji?: string;
        topicDescription?: string;
        badgeText?: string;
        mascotSpeech?: string;
        ctaText?: string;
        imageUrl?: string;
        videoUrl?: string;
        audioUrl?: string;
        audioText?: string;
        pages?: {
          title?: string;
          content?: string;
          imageUrl?: string;
          videoUrl?: string;
          audioUrl?: string;
          audioText?: string;
        }[];
      },
      idx: number,
      lessonIdMap: Map<string, mongoose.Types.ObjectId>,
    ) => {
      const _id =
        l.id && isValidObjectId(l.id)
          ? new mongoose.Types.ObjectId(l.id)
          : lessonIdMap.get(`idx-${idx}`)!;
      const slug = uniqueSlug(
        l.slug || l.title,
        usedLessonSlugs,
        _id.toString().slice(-6),
      );
      const heroImage = l.imageUrl || l.mediaUrl;
      const pages = (l.pages ?? []).map((p) => ({
        title: p.title ?? "",
        content: p.content,
        imageUrl: p.imageUrl,
        videoUrl: p.videoUrl,
        audioUrl: p.audioUrl,
        audioText: p.audioText,
      }));
      const contentFromPages = pages
        .map((p) => [p.title, p.content].filter(Boolean).join("\n"))
        .filter(Boolean)
        .join("\n\n");
      return {
        _id,
        type: l.type || "text",
        title: l.title,
        content: l.content || contentFromPages,
        mediaUrl: heroImage || l.mediaUrl,
        mediaCaption: l.mediaCaption,
        order: l.order ?? idx,
        slug,
        topicTitle: l.topicTitle,
        topicEmoji: l.topicEmoji,
        topicDescription: l.topicDescription,
        badgeText: l.badgeText,
        mascotSpeech: l.mascotSpeech,
        ctaText: l.ctaText,
        imageUrl: heroImage,
        videoUrl: l.videoUrl,
        audioUrl: l.audioUrl,
        audioText: l.audioText,
        pages,
      };
    };

    const mapQuestionInput = (
      q: {
        id?: string;
        lessonId?: string;
        type: string;
        question: string;
        examples?: string;
        options: string[];
        correctIndex: number;
        points: number;
        timeLimit: number;
        mediaUrl?: string;
        mediaCaption?: string;
        order: number;
        subtitle?: string;
        hint?: string;
        explanation?: string;
        wrongExplanation?: string;
        optionEmojis?: string[];
        imageUrl?: string;
        videoUrl?: string;
        audioUrl?: string;
        audioText?: string;
      },
      idx: number,
      lessonObjectId: mongoose.Types.ObjectId | null,
    ) => {
      const options = [...(q.options ?? []), "", "", "", ""].slice(0, 4) as [
        string,
        string,
        string,
        string,
      ];
      const optionEmojis = q.optionEmojis?.length
        ? ([...(q.optionEmojis ?? []), "", "", "", ""].slice(0, 4) as [
            string,
            string,
            string,
            string,
          ])
        : undefined;
      const filledCount = options.filter((t) => String(t || "").trim().length > 0).length;
      let correctIndex = typeof q.correctIndex === "number" ? q.correctIndex : 0;
      // Clamp to valid range only — do NOT auto-reset based on option text,
      // because empty options show placeholder text in the UI and silently
      // changing the correct answer is confusing for the admin.
      if (correctIndex < 0 || correctIndex > 3) {
        correctIndex = 0;
      }
      return {
        ...(q.id && isValidObjectId(q.id) ? { _id: new mongoose.Types.ObjectId(q.id) } : {}),
        type: q.videoUrl ? "video" : q.audioUrl ? "audio" : q.imageUrl || q.mediaUrl ? "image" : q.type || "text",
        question: q.question,
        examples: q.examples,
        options,
        correctIndex,
        points: q.points ?? 10,
        timeLimit: typeof q.timeLimit === "number" ? q.timeLimit : 30,
        mediaUrl: q.imageUrl || q.mediaUrl,
        mediaCaption: q.mediaCaption,
        order: q.order ?? idx,
        subtitle: q.subtitle,
        hint: q.hint,
        explanation: q.explanation,
        wrongExplanation: q.wrongExplanation,
        optionEmojis,
        imageUrl: q.imageUrl || q.mediaUrl,
        videoUrl: q.videoUrl,
        audioUrl: q.audioUrl,
        audioText: q.audioText,
        ...(lessonObjectId ? { lessonId: lessonObjectId } : {}),
      };
    };

    if (body.lessons !== undefined) {
      const lessonIdMap = buildLessonIdMap(body.lessons);
      const mappedLessons = body.lessons.map(
        (l: Parameters<typeof mapLessonInput>[0], idx: number) =>
          mapLessonInput(l, idx, lessonIdMap),
      );
      course.lessons.splice(0, course.lessons.length, ...mappedLessons);

      if (body.quizQuestions !== undefined) {
        const isQuizOnlySave = body.lessons.length === 0;
        const mappedQuestions = body.quizQuestions.map(
          (q: Parameters<typeof mapQuestionInput>[0], idx: number) => {
            const lessonObjectId = isQuizOnlySave
              ? null
              : resolveLessonObjectId(q.lessonId, lessonIdMap) ?? null;
            return mapQuestionInput(q, idx, lessonObjectId);
          },
        );
        course.quizQuestions.splice(0, course.quizQuestions.length, ...mappedQuestions);
      }
    } else if (body.quizQuestions !== undefined) {
      const lessonIdMap = buildLessonIdMap(
        course.lessons.map((l: ILesson) => ({ id: l._id.toString() })),
      );
      const isQuizOnlySave = course.lessons.length === 0;
      const mappedQuestions = body.quizQuestions.map(
        (q: Parameters<typeof mapQuestionInput>[0], idx: number) => {
          const lessonObjectId = isQuizOnlySave
            ? null
            : resolveLessonObjectId(q.lessonId, lessonIdMap) ?? null;
          return mapQuestionInput(q, idx, lessonObjectId);
        },
      );
      course.quizQuestions.splice(0, course.quizQuestions.length, ...mappedQuestions);
    }

    const nextMediaUrls = collectCourseMediaUrls(course);
    const removedMediaUrls = previousMediaUrls.filter((url) => !nextMediaUrls.includes(url));
    if (removedMediaUrls.length > 0) {
      await deleteCloudinaryUrls(removedMediaUrls);
    }

    if (body.lessons !== undefined) {
      course.markModified("lessons");
    }
    if (body.quizQuestions !== undefined) {
      course.markModified("quizQuestions");
    }

    await course.save();
    return jsonOk(res, { success: true });
  } catch (err) {
    console.error("Update course error:", err);
    return jsonError(res, "Failed to update course", 500);
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const auth = await requireAdmin(req);
  if ("error" in auth) return sendAuthError(res, auth);

  const { id } = req.params;
  await connectDB();

  const course = await Course.findById(id);
  if (!course) return jsonError(res, "Course not found", 404);
  if (!canManageCourse(auth.admin, course.adminId.toString())) return unauthorized(res);

  await deleteCloudinaryUrls(collectCourseMediaUrls(course));
  await Course.deleteOne({ _id: id });
  await Invitation.deleteMany({ courseId: id });
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

    // Only allow invites to emails that already exist as active student accounts.
    // This prevents teachers from sending invites to random emails that can never login.
    const students = await Student.find({ email: { $in: emailList } })
      .select("email")
      .lean();
    const validEmailSet = new Set(students.map((s) => s.email.toLowerCase().trim()));
    const missingEmails = emailList.filter((e) => !validEmailSet.has(e.toLowerCase().trim()));
    const targetEmails = emailList.filter((e) => validEmailSet.has(e.toLowerCase().trim()));
    if (targetEmails.length === 0) {
      return jsonError(
        res,
        `Create student accounts for: ${missingEmails.join(", ")}`,
        400,
      );
    }

    const course = await Course.findById(id);
    if (!course) return jsonError(res, "Course not found", 404);
    if (!canManageCourse(auth.admin, course.adminId.toString())) return unauthorized(res);

    const inviteCheck = canSendInvites(
      course.lessons.map((l: ILesson) => ({ id: l._id.toString(), title: l.title })),
      course.quizQuestions.map((q: ICourseQuizQuestion) => ({
        lessonId: q.lessonId?.toString(),
      })),
      course.published,
    );
    if (!inviteCheck.valid) return jsonError(res, inviteCheck.error ?? "Cannot send invites", 400);

    const admin = await Admin.findById(auth.admin.id);
    if (!admin) return unauthorized(res);

    const maxScore = course.quizQuestions.reduce(
      (sum: number, q: ICourseQuizQuestion) => sum + q.points,
      0,
    );
    const isQuizOnly = course.lessons.length === 0;
    const results: { email: string; sent: boolean; inviteLink: string; reset: boolean }[] = [];

    for (const email of targetEmails) {
      let invitation = await Invitation.findOne({ courseId: id, email });
      let wasReset = false;

      if (!invitation) {
        const now = new Date();
        invitation = await Invitation.create({
          courseId: id,
          adminId: auth.admin.id,
          email,
          token: crypto.randomBytes(32).toString("hex"),
          maxScore,
          phase: isQuizOnly ? "quiz" : "learning",
          sentAt: now,
          expiresAt: inviteExpiresAt(now),
        });
      } else {
        // Same email again = re-invite: reset progress + new token + email
        wasReset =
          invitation.phase === "completed" ||
          invitation.answers.length > 0 ||
          invitation.completedLessonIds.length > 0 ||
          (invitation.contentCompletedLessonIds?.length ?? 0) > 0;
        resetInvitationForRetake(invitation, {
          maxScore,
          isQuizOnly,
          rotateToken: true,
        });
        invitation.adminId = new mongoose.Types.ObjectId(auth.admin.id);
        await invitation.save();
      }

      const inviteLink = `${getAppUrl()}/learn/${invitation.token}`;
      const mailResult = await sendCourseInviteEmail({
        to: email,
        courseTitle: course.title,
        inviteLink,
        adminName: admin.name,
        adminEmail: admin.email,
        isQuizOnly,
        expiresAt: invitation.expiresAt,
      });

      results.push({
        email,
        sent: mailResult.sent,
        inviteLink,
        reset: wasReset,
      });
    }

    return jsonOk(res, { results, missingEmails });
  } catch (err) {
    console.error("Invite error:", err);
    return jsonError(res, "Failed to send invitations", 500);
  }
});

export default router;
