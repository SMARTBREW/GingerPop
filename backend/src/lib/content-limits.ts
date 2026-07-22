import { stripHtml } from "@/lib/play-lesson";

/**
 * Word limits derived from the static ALL_MATH_LESSONS demo on /play.
 */
export const CONTENT_WORD_LIMITS = {
  lessonTitle: 3,
  badgeText: 4,
  mascotSpeech: 25,
  ctaText: 1,
  topicTitle: 6,
  topicDescription: 30,
  pageTitle: 7,
  pageContent: 30,
  audioText: 30,
  question: 54,
  subtitle: 16,
  option: 7,
  explanation: 21,
  wrongExplanation: 19,
  hint: 13,
} as const;

export type ContentWordLimitKey = keyof typeof CONTENT_WORD_LIMITS;

export function countWords(text: string): number {
  const stripped = stripHtml(text);
  if (!stripped) return 0;
  return stripped.split(/\s+/).filter(Boolean).length;
}

function overLimit(
  value: string | undefined | null,
  limit: number,
  label: string,
): string | null {
  const words = countWords(value ?? "");
  if (words > limit) {
    return `${label} is too long (${words} words, max ${limit}).`;
  }
  return null;
}

type LessonPageInput = {
  title?: string;
  content?: string;
  audioText?: string;
};

type LessonInput = {
  title?: string;
  badgeText?: string;
  mascotSpeech?: string;
  ctaText?: string;
  topicTitle?: string;
  topicDescription?: string;
  audioText?: string;
  pages?: LessonPageInput[];
};

type QuestionInput = {
  question?: string;
  subtitle?: string;
  options?: string[];
  explanation?: string;
  wrongExplanation?: string;
  hint?: string;
  audioText?: string;
};

export function validateCourseContent(
  lessons: LessonInput[],
  quizQuestions: QuestionInput[],
): { valid: true } | { valid: false; error: string } {
  const L = CONTENT_WORD_LIMITS;

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    const name = lesson.title?.trim() || `Lesson ${i + 1}`;

    const checks: Array<string | null> = [
      overLimit(lesson.title, L.lessonTitle, `Lesson title (“${name}”)`),
      overLimit(lesson.badgeText, L.badgeText, `Badge text (“${name}”)`),
      overLimit(lesson.mascotSpeech, L.mascotSpeech, `Mascot speech (“${name}”)`),
      overLimit(lesson.ctaText, L.ctaText, `Next button text (“${name}”)`),
      overLimit(lesson.topicTitle, L.topicTitle, `Chapter name (“${name}”)`),
      overLimit(lesson.topicDescription, L.topicDescription, `Chapter description (“${name}”)`),
      overLimit(lesson.audioText, L.audioText, `Lesson audio text (“${name}”)`),
    ];

    const pages = lesson.pages?.length
      ? lesson.pages
      : [{ title: lesson.title, content: "" }];

    for (let p = 0; p < pages.length; p++) {
      const page = pages[p];
      const pageLabel = `${name}, page ${p + 1}`;
      checks.push(
        overLimit(page.title, L.pageTitle, `Page heading (${pageLabel})`),
        overLimit(page.content, L.pageContent, `Explanation text (${pageLabel})`),
        overLimit(page.audioText, L.audioText, `Page audio text (${pageLabel})`),
      );
    }

    const firstError = checks.find(Boolean);
    if (firstError) return { valid: false, error: firstError };
  }

  for (let i = 0; i < quizQuestions.length; i++) {
    const q = quizQuestions[i];
    const label = `Quiz question ${i + 1}`;

    const checks: Array<string | null> = [
      overLimit(q.question, L.question, `${label} text`),
      overLimit(q.subtitle, L.subtitle, `${label} subtitle`),
      overLimit(q.explanation, L.explanation, `${label} correct message`),
      overLimit(q.wrongExplanation, L.wrongExplanation, `${label} wrong message`),
      overLimit(q.hint, L.hint, `${label} hint`),
      overLimit(q.audioText, L.audioText, `${label} audio text`),
    ];

    for (let o = 0; o < (q.options?.length ?? 0); o++) {
      checks.push(
        overLimit(q.options![o], L.option, `${label}, option ${String.fromCharCode(65 + o)}`),
      );
    }

    const firstError = checks.find(Boolean);
    if (firstError) return { valid: false, error: firstError };
  }

  return { valid: true };
}

export function validateQuizQuestions(
  questions: QuestionInput[],
): { valid: true } | { valid: false; error: string } {
  return validateCourseContent([], questions);
}
