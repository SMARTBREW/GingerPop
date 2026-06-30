export type ContentType = "text" | "image" | "video" | "audio";

export interface Lesson {
  id: string;
  type: ContentType;
  title: string;
  content?: string;
  mediaUrl?: string;
  mediaCaption?: string;
  order: number;
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

export const EMPTY_LESSON: Omit<Lesson, "id"> = {
  type: "text",
  title: "",
  content: "",
  order: 0,
};

export const EMPTY_QUIZ_QUESTION: Omit<CourseQuizQuestion, "id"> = {
  type: "text",
  question: "",
  examples: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  points: 10,
  timeLimit: 30,
  order: 0,
};
