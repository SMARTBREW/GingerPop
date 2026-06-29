import mongoose, { Schema, models, model } from "mongoose";

export interface IAnswerRecord {
  questionId: mongoose.Types.ObjectId;
  selectedIndex: number | null;
  correct: boolean;
  pointsEarned: number;
}

export type InvitationPhase = "learning" | "quiz" | "completed";
export type LegacyInviteStatus = "pending" | "in_progress" | "completed";

export interface IInvitation {
  _id: mongoose.Types.ObjectId;
  courseId?: mongoose.Types.ObjectId;
  /** Legacy standalone quiz invites */
  quizId?: mongoose.Types.ObjectId;
  adminId: mongoose.Types.ObjectId;
  email: string;
  token: string;
  phase: InvitationPhase;
  /** Legacy standalone quiz invite progress */
  status?: LegacyInviteStatus;
  /** Lesson content marked complete (assessment may still be pending). */
  contentCompletedLessonIds: mongoose.Types.ObjectId[];
  /** Lessons fully complete including assessment. */
  completedLessonIds: mongoose.Types.ObjectId[];
  score: number;
  maxScore: number;
  answers: IAnswerRecord[];
  sentAt?: Date;
  expiresAt?: Date;
  completedAt?: Date;
  createdAt: Date;
}

const AnswerRecordSchema = new Schema<IAnswerRecord>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  selectedIndex: { type: Number, default: null },
  correct: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
});

const InvitationSchema = new Schema<IInvitation>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz" },
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    token: { type: String, required: true, unique: true },
    phase: { type: String, enum: ["learning", "quiz", "completed"], default: "learning" },
    status: { type: String, enum: ["pending", "in_progress", "completed"] },
    contentCompletedLessonIds: { type: [Schema.Types.ObjectId], default: [] },
    completedLessonIds: { type: [Schema.Types.ObjectId], default: [] },
    score: { type: Number, default: 0 },
    maxScore: { type: Number, default: 0 },
    answers: { type: [AnswerRecordSchema], default: [] },
    sentAt: Date,
    expiresAt: Date,
    completedAt: Date,
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

InvitationSchema.index({ courseId: 1, email: 1 }, { unique: true, sparse: true });
InvitationSchema.index({ quizId: 1, email: 1 }, { unique: true, sparse: true });

export const Invitation = models.Invitation || model<IInvitation>("Invitation", InvitationSchema);
