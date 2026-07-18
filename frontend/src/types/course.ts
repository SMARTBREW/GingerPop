export type ContentType = "text" | "image" | "video" | "audio";

export interface LessonPage {
  title: string;
  content?: string;
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  audioText?: string;
}

export interface Lesson {
  id: string;
  type: ContentType;
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
  pages?: LessonPage[];
}

export interface CourseQuizQuestion {
  id: string;
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
  /** Links assessment to a specific lesson. Omit for quiz-only courses. */
  lessonId?: string;
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

export interface PublicLesson {
  id: string;
  type: ContentType;
  title: string;
  content?: string;
  mediaUrl?: string;
  mediaCaption?: string;
}

export interface PublicQuizQuestion {
  id: string;
  type: ContentType;
  question: string;
  examples?: string;
  options: [string, string, string, string];
  points: number;
  timeLimit: number;
  mediaUrl?: string;
  mediaCaption?: string;
}

export const EMPTY_LESSON_PAGE: LessonPage = {
  title: "",
  content: "",
  imageUrl: "",
  videoUrl: "",
  audioUrl: "",
  audioText: "",
};

export const EMPTY_LESSON: Omit<Lesson, "id"> = {
  type: "text",
  title: "",
  content: "",
  order: 0,
  slug: "",
  topicTitle: "",
  topicEmoji: "📚",
  topicDescription: "",
  badgeText: "",
  mascotSpeech: "",
  ctaText: "Next",
  imageUrl: "",
  videoUrl: "",
  audioUrl: "",
  audioText: "",
  pages: [{ ...EMPTY_LESSON_PAGE, title: "Lesson page 1" }],
};

export const EMPTY_QUIZ_QUESTION: Omit<CourseQuizQuestion, "id"> = {
  type: "text",
  question: "",
  examples: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  points: 10,
  timeLimit: 0,
  order: 0,
  subtitle: "",
  hint: "",
  explanation: "",
  wrongExplanation: "",
  optionEmojis: ["🐊", "🐊", "🐊", "😐"],
  imageUrl: "",
  audioUrl: "",
  audioText: "",
};
