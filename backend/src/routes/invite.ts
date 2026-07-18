import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk } from "@/lib/api";
import { isInvitationExpired, INVITE_EXPIRED_MESSAGE } from "@/lib/invitation-expiry";
import { Invitation, IAnswerRecord } from "@/models/Invitation";
import { Quiz, IQuizQuestion } from "@/models/Quiz";
import { Admin } from "@/models/Admin";
import { Course, ILesson } from "@/models/Course";

const router = Router();

router.get("/:token", async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    await connectDB();

    const invitation = await Invitation.findOne({ token });
    if (!invitation) return jsonError(res, "Invalid or expired invite link", 404);
    if (isInvitationExpired(invitation)) return jsonError(res, INVITE_EXPIRED_MESSAGE, 410);

    const quiz = await Quiz.findById(invitation.quizId);
    if (!quiz) return jsonError(res, "Quiz not found", 404);

    const inviter = await Admin.findById(invitation.adminId);
    const referenceCourse = quiz.referenceCourseId
      ? await Course.findById(quiz.referenceCourseId).select("title lessons.title")
      : null;
    const referenceLesson =
      referenceCourse && quiz.referenceLessonId
        ? referenceCourse.lessons.find((lesson: ILesson) =>
            lesson._id.equals(quiz.referenceLessonId!),
          )
        : null;
    const sortedQuestions = [...quiz.questions].sort((a, b) => a.order - b.order);

    return jsonOk(res, {
      invitation: {
        email: invitation.email,
        status: invitation.status ?? invitation.phase,
        score: invitation.score,
        maxScore: invitation.maxScore,
        completedAt: invitation.completedAt,
        invitedBy: inviter
          ? { name: inviter.name, email: inviter.email }
          : null,
      },
      quiz: {
        title: quiz.title,
        description: quiz.description,
        reference: referenceCourse && referenceLesson
          ? {
              subjectTitle: referenceCourse.title,
              lessonTitle: referenceLesson.title,
            }
          : null,
        questions: sortedQuestions.map((q) => ({
          id: q._id.toString(),
          type: q.type,
          question: q.question,
          options: q.options,
          points: q.points,
          timeLimit: q.timeLimit,
          mediaUrl: q.mediaUrl,
          mediaCaption: q.mediaCaption,
        })),
      },
      answeredQuestionIds: invitation.answers.map((a: IAnswerRecord) => a.questionId.toString()),
    });
  } catch (err) {
    console.error("Invite fetch error:", err);
    return jsonError(res, "Failed to load quiz", 500);
  }
});

router.post("/:token", async (req: Request, res: Response) => {
  const { token } = req.params;

  try {
    const { questionId, selectedIndex } = req.body;

    if (!questionId) return jsonError(res, "Question ID is required");

    await connectDB();

    const invitation = await Invitation.findOne({ token });
    if (!invitation) return jsonError(res, "Invalid invite link", 404);
    if (isInvitationExpired(invitation)) return jsonError(res, INVITE_EXPIRED_MESSAGE, 410);
    if (invitation.status === "completed" || invitation.phase === "completed") {
      return jsonError(res, "Quiz already completed", 400);
    }

    const quiz = await Quiz.findById(invitation.quizId);
    if (!quiz) return jsonError(res, "Quiz not found", 404);

    const question = quiz.questions.find((q: IQuizQuestion) => q._id.toString() === questionId);
    if (!question) return jsonError(res, "Question not found", 404);

    const alreadyAnswered = invitation.answers.some(
      (a: IAnswerRecord) => a.questionId.toString() === questionId,
    );
    if (alreadyAnswered) return jsonError(res, "Question already answered", 400);

    const correct = selectedIndex === question.correctIndex;
    const pointsEarned = correct ? question.points : 0;

    invitation.answers.push({
      questionId: question._id,
      selectedIndex: selectedIndex ?? null,
      correct,
      pointsEarned,
    });
    invitation.score += pointsEarned;
    invitation.status = "in_progress";
    invitation.phase = "quiz";

    const totalQuestions = quiz.questions.length;
    if (invitation.answers.length >= totalQuestions) {
      invitation.status = "completed";
      invitation.phase = "completed";
      invitation.completedAt = new Date();
    }

    await invitation.save();

    return jsonOk(res, {
      correct,
      pointsEarned,
      correctIndex: question.correctIndex,
      completed: invitation.status === "completed",
      score: invitation.score,
      maxScore: invitation.maxScore,
    });
  } catch (err) {
    console.error("Answer submit error:", err);
    return jsonError(res, "Failed to submit answer", 500);
  }
});

export default router;
