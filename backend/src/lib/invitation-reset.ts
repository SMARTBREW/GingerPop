import crypto from "crypto";
import type { Document } from "mongoose";
import { inviteExpiresAt } from "@/lib/invitation-expiry";
import type { IInvitation } from "@/models/Invitation";

type InvitationDoc = Document & IInvitation;

/** Clear progress so the learner can retake (same or new invite). */
export function resetInvitationForRetake(
  invitation: InvitationDoc,
  options: {
    maxScore: number;
    isQuizOnly: boolean;
    /** Teacher re-invite should rotate the token; student Try again should keep it. */
    rotateToken?: boolean;
  },
) {
  invitation.answers = [];
  invitation.score = 0;
  invitation.maxScore = options.maxScore;
  invitation.completedLessonIds = [];
  invitation.contentCompletedLessonIds = [];
  invitation.phase = options.isQuizOnly ? "quiz" : "learning";
  invitation.set("completedAt", undefined);

  if (options.rotateToken) {
    invitation.token = crypto.randomBytes(32).toString("hex");
  }

  const now = new Date();
  invitation.sentAt = now;
  invitation.expiresAt = inviteExpiresAt(now);
}
