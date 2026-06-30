export type QuestionType = "text" | "image" | "video" | "audio";

/** Question used during gameplay. correctIndex is only set in local/demo mode. */
export interface PlayQuestion {
  id: string;
  type: QuestionType;
  question: string;
  examples?: string;
  options: [string, string, string, string];
  points: number;
  timeLimit?: number;
  mediaUrl?: string;
  mediaCaption?: string;
  correctIndex?: number;
}

/** Full question with answer — used in admin editor and local demo. */
export interface Question extends PlayQuestion {
  correctIndex: number;
}

export interface AnswerResult {
  correct: boolean;
  pointsEarned: number;
  correctIndex: number;
  completed: boolean;
  score: number;
  maxScore: number;
}

export const DEFAULT_TIME_LIMIT = 30;

export function getMaxScore(questions: Pick<PlayQuestion, "points">[]): number {
  return questions.reduce((sum, q) => sum + q.points, 0);
}

export const EMPTY_QUESTION: Omit<Question, "id"> = {
  type: "text",
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
  points: 10,
  timeLimit: 30,
};
