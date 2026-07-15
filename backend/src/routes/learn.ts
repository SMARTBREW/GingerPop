import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk } from "@/lib/api";
import { isInvitationExpired, INVITE_EXPIRED_MESSAGE } from "@/lib/invitation-expiry";
import { Invitation, IAnswerRecord } from "@/models/Invitation";
import { Course, ICourse, ICourseQuizQuestion, ILesson } from "@/models/Course";
import { Admin } from "@/models/Admin";
import { courseSlug, toPlayLesson, toPlayQuestion } from "@/lib/play-lesson";

const router = Router();

function serializeQuestion(q: ICourseQuizQuestion) {
  return {
    id: q._id.toString(),
    type: q.type,
    question: q.question,
    examples: q.examples,
    options: q.options,
    points: q.points,
    timeLimit: q.timeLimit,
    mediaUrl: q.mediaUrl,
    mediaCaption: q.mediaCaption,
    lessonId: q.lessonId?.toString(),
  };
}

function getLessonQuestions(course: { quizQuestions: ICourseQuizQuestion[] }, lessonId: string) {
  return course.quizQuestions.filter(
    (q: ICourseQuizQuestion) => q.lessonId?.toString() === lessonId,
  );
}

function lessonAssessmentComplete(
  invitation: { answers: IAnswerRecord[] },
  lessonQuestions: ICourseQuizQuestion[],
) {
  if (lessonQuestions.length === 0) return true;
  return lessonQuestions.every((q) =>
    invitation.answers.some((a) => a.questionId.toString() === q._id.toString()),
  );
}

function allLessonsFullyComplete(
  course: { lessons: ILesson[] },
  invitation: { completedLessonIds: mongoose.Types.ObjectId[] },
) {
  const totalLessons = course.lessons.length;
  return totalLessons > 0 && invitation.completedLessonIds.length >= totalLessons;
}

router.get("/:token", async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    await connectDB();

    const invitation = await Invitation.findOne({ token });
    if (!invitation) return jsonError(res, "Invalid or expired invite link", 404);
    if (isInvitationExpired(invitation)) return jsonError(res, INVITE_EXPIRED_MESSAGE, 410);

    const course = await Course.findById(invitation.courseId);
    if (!course || !course.published) return jsonError(res, "Course not found", 404);

    const inviter = await Admin.findById(invitation.adminId);

    const sortedLessons = [...course.lessons].sort((a: ILesson, b: ILesson) => a.order - b.order);
    const sortedQuiz = [...course.quizQuestions].sort(
      (a: ICourseQuizQuestion, b: ICourseQuizQuestion) => a.order - b.order,
    );
    const isQuizOnly = sortedLessons.length === 0;

    const contentCompletedIds = (invitation.contentCompletedLessonIds ?? []).map(
      (id: mongoose.Types.ObjectId) => id.toString(),
    );

    let pendingAssessmentLessonId: string | null = null;
    if (!isQuizOnly) {
      for (const lesson of sortedLessons) {
        const lid = lesson._id.toString();
        const contentDone = contentCompletedIds.includes(lid);
        const fullyDone = invitation.completedLessonIds.some(
          (id: mongoose.Types.ObjectId) => id.toString() === lid,
        );
        if (contentDone && !fullyDone) {
          const lessonQs = getLessonQuestions(course, lid);
          if (!lessonAssessmentComplete(invitation, lessonQs)) {
            pendingAssessmentLessonId = lid;
            break;
          }
        }
      }
    }

    const showLessonQuiz = pendingAssessmentLessonId !== null;

    const visibleQuestions = isQuizOnly
      ? sortedQuiz
      : showLessonQuiz
        ? getLessonQuestions(course, pendingAssessmentLessonId!)
        : invitation.phase === "completed"
          ? sortedQuiz.filter((q: ICourseQuizQuestion) => !q.lessonId)
          : [];

    const playLessons = sortedLessons.map((lesson) => {
      const qs = getLessonQuestions(course, lesson._id.toString()).sort(
        (a, b) => a.order - b.order,
      );
      return toPlayLesson(course as ICourse, lesson, qs, { includeCorrectIndex: true });
    });

    const topicMap = new Map<
      string,
      {
        id: string;
        title: string;
        emoji: string;
        subtopics: {
          id: string;
          title: string;
          emoji: string;
          lessonMongoId: string;
          lessonSlug: string;
        }[];
      }
    >();
    for (const play of playLessons) {
      const topicTitle = play.topicTitle || "Chapter";
      const topicId = topicTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      if (!topicMap.has(topicId)) {
        topicMap.set(topicId, {
          id: topicId,
          title: topicTitle,
          emoji: play.topicEmoji || "📖",
          subtopics: [],
        });
      }
      topicMap.get(topicId)!.subtopics.push({
        id: play.id,
        title: play.title,
        emoji: "✨",
        lessonMongoId: play.mongoId,
        lessonSlug: play.id,
      });
    }

    return jsonOk(res, {
      invitation: {
        email: invitation.email,
        phase: invitation.phase,
        score: invitation.score,
        maxScore: invitation.maxScore,
        contentCompletedLessonIds: contentCompletedIds,
        completedLessonIds: invitation.completedLessonIds.map(
          (id: mongoose.Types.ObjectId) => id.toString(),
        ),
        completedAt: invitation.completedAt,
        pendingAssessmentLessonId,
        isQuizOnly,
        invitedBy: inviter ? { name: inviter.name, email: inviter.email } : null,
      },
      course: {
        title: course.title,
        description: course.description,
        emoji: course.emoji || "📚",
        color: course.color || "#fff7ed",
        accent: course.accent || "#ea580c",
        slug: courseSlug(course as ICourse),
        lessons: sortedLessons.map((l: ILesson) => ({
          id: l._id.toString(),
          type: l.type,
          title: l.title,
          content: l.content,
          mediaUrl: l.mediaUrl,
          mediaCaption: l.mediaCaption,
        })),
        quizQuestions: visibleQuestions.map(serializeQuestion),
        playLessons,
        topics: Array.from(topicMap.values()),
      },
      answeredQuestionIds: invitation.answers.map((a: IAnswerRecord) => a.questionId.toString()),
    });
  } catch (err) {
    console.error("Learn fetch error:", err);
    return jsonError(res, "Failed to load course", 500);
  }
});

router.post("/:token", async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const body = req.body;
    await connectDB();

    const invitation = await Invitation.findOne({ token });
    if (!invitation) return jsonError(res, "Invalid invite link", 404);
    if (isInvitationExpired(invitation)) return jsonError(res, INVITE_EXPIRED_MESSAGE, 410);
    if (invitation.phase === "completed") {
      return jsonError(res, "Course already completed", 400);
    }

    const course = await Course.findById(invitation.courseId);
    if (!course) return jsonError(res, "Course not found", 404);

    const isQuizOnly = course.lessons.length === 0;

    if (body.action === "complete_lesson") {
      const { lessonId } = body;
      if (!lessonId) return jsonError(res, "Lesson ID required");

      const lesson = course.lessons.find((l: ILesson) => l._id.toString() === lessonId);
      if (!lesson) return jsonError(res, "Lesson not found", 404);

      const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
      const alreadyFullyDone = invitation.completedLessonIds.some(
        (id: mongoose.Types.ObjectId) => id.toString() === lessonId,
      );
      if (alreadyFullyDone) return jsonError(res, "Lesson already completed", 400);

      if (!invitation.contentCompletedLessonIds) {
        invitation.contentCompletedLessonIds = [];
      }

      const contentAlready = invitation.contentCompletedLessonIds.some(
        (id: mongoose.Types.ObjectId) => id.toString() === lessonId,
      );
      if (!contentAlready) {
        invitation.contentCompletedLessonIds.push(lessonObjectId);
      }

      const lessonQuestions = getLessonQuestions(course, lessonId);
      if (lessonQuestions.length === 0) {
        return jsonError(res, "This lesson has no assessment configured", 400);
      }

      await invitation.save();

      return jsonOk(res, {
        phase: invitation.phase,
        needsAssessment: true,
        lessonId,
        contentCompletedLessonIds: invitation.contentCompletedLessonIds.map(
          (id: mongoose.Types.ObjectId) => id.toString(),
        ),
        assessmentQuestions: lessonQuestions
          .sort((a, b) => a.order - b.order)
          .map((q) => toPlayQuestion(q, { includeCorrectIndex: true })),
        playLesson: toPlayLesson(course as ICourse, lesson, lessonQuestions, {
          includeCorrectIndex: true,
        }),
      });
    }

    if (body.action === "quiz_answer") {
      const { questionId, selectedIndex } = body;
      if (!questionId) return jsonError(res, "Question ID is required");

      const question = course.quizQuestions.find(
        (q: ICourseQuizQuestion) => q._id.toString() === questionId,
      );
      if (!question) return jsonError(res, "Question not found", 404);

      const alreadyAnswered = invitation.answers.some(
        (a: IAnswerRecord) => a.questionId.toString() === questionId,
      );
      if (alreadyAnswered) return jsonError(res, "Question already answered", 400);

      if (isQuizOnly) {
        if (question.lessonId) return jsonError(res, "Invalid question for quiz-only course", 400);
        if (invitation.phase !== "quiz") invitation.phase = "quiz";
      } else {
        const qLessonId = question.lessonId?.toString();
        if (!qLessonId) return jsonError(res, "Invalid question", 400);

        const contentDone = (invitation.contentCompletedLessonIds ?? []).some(
          (id: mongoose.Types.ObjectId) => id.toString() === qLessonId,
        );
        if (!contentDone) {
          return jsonError(res, "Complete the lesson before its assessment", 400);
        }
      }

      const correct = selectedIndex === question.correctIndex;
      const pointsEarned = correct ? question.points : 0;

      invitation.answers.push({
        questionId: question._id,
        selectedIndex: selectedIndex ?? null,
        correct,
        pointsEarned,
      });
      invitation.score += pointsEarned;

      if (!isQuizOnly && question.lessonId) {
        const lessonId = question.lessonId.toString();
        const lessonQuestions = getLessonQuestions(course, lessonId);
        if (lessonAssessmentComplete(invitation, lessonQuestions)) {
          const lessonObjectId = question.lessonId;
          const alreadyDone = invitation.completedLessonIds.some(
            (id: mongoose.Types.ObjectId) => id.toString() === lessonId,
          );
          if (!alreadyDone) {
            invitation.completedLessonIds.push(lessonObjectId);
          }
        }

        if (allLessonsFullyComplete(course, invitation)) {
          invitation.phase = "completed";
          invitation.completedAt = new Date();
        } else {
          invitation.phase = "learning";
        }
      } else if (isQuizOnly) {
        const totalQuestions = course.quizQuestions.length;
        const answeredCount = invitation.answers.length;
        if (answeredCount >= totalQuestions) {
          invitation.phase = "completed";
          invitation.completedAt = new Date();
        }
      }

      await invitation.save();

      return jsonOk(res, {
        correct,
        pointsEarned,
        correctIndex: question.correctIndex,
        explanation: question.explanation || "Great job!",
        wrongExplanation: question.wrongExplanation,
        completed: invitation.phase === "completed",
        score: invitation.score,
        maxScore: invitation.maxScore,
        phase: invitation.phase,
        completedLessonIds: invitation.completedLessonIds.map(
          (id: mongoose.Types.ObjectId) => id.toString(),
        ),
      });
    }

    return jsonError(res, "Invalid action");
  } catch (err) {
    console.error("Learn action error:", err);
    return jsonError(res, "Request failed", 500);
  }
});

export default router;
