import mongoose, { Schema, models, model } from "mongoose";
import { QuestionType } from "@/types/quiz";

export interface IQuizQuestion {
  _id: mongoose.Types.ObjectId;
  type: QuestionType;
  question: string;
  options: [string, string, string, string];
  correctIndex: number;
  points: number;
  timeLimit: number;
  mediaUrl?: string;
  mediaCaption?: string;
  order: number;
}

export interface IQuiz {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  adminId: mongoose.Types.ObjectId;
  questions: IQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  type: { type: String, enum: ["text", "image", "video", "audio"], required: true },
  question: { type: String, required: true },
  options: { type: [String], required: true, validate: [(v: string[]) => v.length === 4, "Exactly 4 options required"] },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  points: { type: Number, default: 10 },
  timeLimit: { type: Number, default: 30 },
  mediaUrl: String,
  mediaCaption: String,
  order: { type: Number, default: 0 },
});

const QuizSchema = new Schema<IQuiz>(
  {
    title: { type: String, required: true },
    description: String,
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    questions: { type: [QuizQuestionSchema], default: [] },
  },
  { timestamps: true },
);

export const Quiz = models.Quiz || model<IQuiz>("Quiz", QuizSchema);
