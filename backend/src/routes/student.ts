import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { requireStudent, sendAuthError } from "@/lib/permissions";
import { jsonError, jsonOk } from "@/lib/api";
import { Invitation } from "@/models/Invitation";
import { Course } from "@/models/Course";
import { isInvitationExpired } from "@/lib/invitation-expiry";

const router = Router();

/** Courses / quizzes invited to this student's email */
router.get("/courses", async (req: Request, res: Response) => {
  try {
    const auth = await requireStudent(req);
    if ("error" in auth) return sendAuthError(res, auth);

    await connectDB();

    const invitations = await Invitation.find({ email: auth.student.email })
      .sort({ createdAt: -1 })
      .lean();

    const courseIds = invitations
      .map((inv) => inv.courseId)
      .filter(Boolean)
      .map((id) => id!.toString());

    const courses = courseIds.length
      ? await Course.find({ _id: { $in: courseIds } })
          .select("title description published")
          .lean()
      : [];

    const courseById = new Map(courses.map((c) => [c._id.toString(), c]));

    const items = invitations.map((inv) => {
      const course = inv.courseId ? courseById.get(inv.courseId.toString()) : null;
      const expired = isInvitationExpired(inv);
      return {
        invitationId: inv._id.toString(),
        token: inv.token,
        email: inv.email,
        phase: inv.phase,
        score: inv.score,
        maxScore: inv.maxScore,
        expired,
        learnUrl: `/learn/${inv.token}`,
        course: course
          ? {
              id: course._id.toString(),
              title: course.title,
              description: course.description ?? "",
            }
          : inv.quizId
            ? {
                id: inv.quizId.toString(),
                title: "Legacy quiz invite",
                description: "",
              }
            : null,
        sentAt: inv.sentAt ?? inv.createdAt,
        completedAt: inv.completedAt ?? null,
      };
    });

    return jsonOk(res, { courses: items });
  } catch (err) {
    console.error("Student courses error:", err);
    return jsonError(res, "Failed to load courses", 500);
  }
});

export default router;
