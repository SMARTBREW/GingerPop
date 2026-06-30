import mongoose, { Schema, models, model } from "mongoose";
import { ContentType } from "@/types/course";

export interface ILesson {
  _id: mongoose.Types.ObjectId;
  type: ContentType;
  title: string;
  content?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  order: number;
}

export interface ICourseQuizQuestion {
  _id: mongoose.Types.ObjectId;
  type: ContentType;
  question: string;
  examples?: string;
  options: [string, string, string, string];
  correctIndex: number;
  points: number;
  timeLimit: number;
  mediaUrl?: string;
  mediaCaption?: string;
  order: number;
  lessonId?: mongoose.Types.ObjectId;
}

export interface ICourse {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  adminId: mongoose.Types.ObjectId;
  published: boolean;
  lessons: ILesson[];
  quizQuestions: ICourseQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>({
  type: { type: String, enum: ["text", "image", "video", "audio"], required: true },
  title: { type: String, required: true },
  content: String,
  mediaUrl: String,
  mediaCaption: String,
  order: { type: Number, default: 0 },
});

const CourseQuizQuestionSchema = new Schema<ICourseQuizQuestion>({
  type: { type: String, enum: ["text", "image", "video", "audio"], required: true },
  question: { type: String, required: true },
  examples: String,
  options: {
    type: [String],
    required: true,
    validate: [(v: string[]) => v.length === 4, "Exactly 4 options required"],
  },
  correctIndex: { type: Number, required: true, min: 0, max: 3 },
  points: { type: Number, default: 10 },
  timeLimit: { type: Number, default: 30 },
  mediaUrl: String,
  mediaCaption: String,
  order: { type: Number, default: 0 },
  lessonId: { type: Schema.Types.ObjectId, required: false },
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: String,
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    published: { type: Boolean, default: false },
    lessons: { type: [LessonSchema], default: [] },
    quizQuestions: { type: [CourseQuizQuestionSchema], default: [] },
  },
  { timestamps: true },
);

export const Course = models.Course || model<ICourse>("Course", CourseSchema);
