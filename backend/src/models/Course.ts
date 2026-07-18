import mongoose, { Schema, models, model } from "mongoose";
import { ContentType } from "@/types/course";

export interface ILessonPage {
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioText?: string;
}

export interface ILesson {
  _id: mongoose.Types.ObjectId;
  type: ContentType;
  title: string;
  content?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  order: number;
  /** Kid-catalog fields */
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
  pages?: ILessonPage[];
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
  /** Play-page fields */
  subtitle?: string;
  hint?: string;
  explanation?: string;
  wrongExplanation?: string;
  optionEmojis?: [string, string, string, string];
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioText?: string;
}

export interface ICourse {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  adminId: mongoose.Types.ObjectId;
  published: boolean;
  /** Subjects-page card fields */
  emoji?: string;
  color?: string;
  accent?: string;
  slug?: string;
  lessons: ILesson[];
  quizQuestions: ICourseQuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}

const LessonPageSchema = new Schema<ILessonPage>(
  {
    title: { type: String, default: "" },
    content: String,
    imageUrl: String,
    videoUrl: String,
    audioUrl: String,
    audioText: String,
  },
  { _id: false },
);

const LessonSchema = new Schema<ILesson>({
  type: { type: String, enum: ["text", "image", "video", "audio"], required: true },
  title: { type: String, required: true },
  content: String,
  mediaUrl: String,
  mediaCaption: String,
  order: { type: Number, default: 0 },
  slug: String,
  topicTitle: String,
  topicEmoji: String,
  topicDescription: String,
  badgeText: String,
  mascotSpeech: String,
  ctaText: String,
  imageUrl: String,
  videoUrl: String,
  audioUrl: String,
  audioText: String,
  pages: { type: [LessonPageSchema], default: [] },
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
  subtitle: String,
  hint: String,
  explanation: String,
  wrongExplanation: String,
  optionEmojis: {
    type: [String],
    validate: {
      validator: (v: string[] | undefined) => !v || v.length === 0 || v.length === 4,
      message: "optionEmojis must have 4 items when set",
    },
  },
  imageUrl: String,
  videoUrl: String,
  audioUrl: String,
  audioText: String,
});

const CourseSchema = new Schema<ICourse>(
  {
    title: { type: String, required: true },
    description: String,
    adminId: { type: Schema.Types.ObjectId, ref: "Admin", required: true },
    published: { type: Boolean, default: false },
    emoji: String,
    color: String,
    accent: String,
    slug: String,
    lessons: { type: [LessonSchema], default: [] },
    quizQuestions: { type: [CourseQuizQuestionSchema], default: [] },
  },
  { timestamps: true },
);

export const Course = models.Course || model<ICourse>("Course", CourseSchema);
