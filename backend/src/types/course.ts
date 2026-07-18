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
