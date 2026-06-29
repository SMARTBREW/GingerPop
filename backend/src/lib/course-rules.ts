import { CourseQuizQuestion, Lesson } from "@/types/course";

type LessonLike = Pick<Lesson, "id" | "title">;
type QuestionLike = Pick<CourseQuizQuestion, "lessonId">;

export function getLessonQuestions<T extends QuestionLike>(
  questions: T[],
  lessonId: string,
): T[] {
  return questions.filter((q) => q.lessonId === lessonId);
}

export function lessonHasAssessment(questions: QuestionLike[], lessonId: string) {
  return getLessonQuestions(questions, lessonId).length >= 1;
}

/** Can add another lesson only when the last lesson has at least one assessment. */
export function canAddAnotherLesson(lessons: LessonLike[], questions: QuestionLike[]) {
  if (lessons.length === 0) return true;
  const last = lessons[lessons.length - 1];
  return lessonHasAssessment(questions, last.id);
}

export function isQuizOnlyCourse(lessons: LessonLike[], questions: QuestionLike[]) {
  return lessons.length === 0 && questions.length > 0;
}

export function validateCourseStructure(
  lessons: LessonLike[],
  questions: QuestionLike[],
): { valid: boolean; error?: string } {
  if (lessons.length === 0) {
    if (questions.length === 0) {
      return {
        valid: false,
        error: "Add at least one assessment question, or add a lesson with its assessment.",
      };
    }
    const linked = questions.filter((q) => q.lessonId);
    if (linked.length > 0) {
      return {
        valid: false,
        error: "Quiz-only courses cannot include lesson-linked assessments. Remove all lessons first.",
      };
    }
    return { valid: true };
  }

  for (let i = 0; i < lessons.length; i++) {
    const lesson = lessons[i];
    if (!lessonHasAssessment(questions, lesson.id)) {
      const label = lesson.title?.trim() || `Lesson ${i + 1}`;
      return {
        valid: false,
        error: `${label} requires at least one assessment before you can publish or add another lesson.`,
      };
    }
  }

  const lessonIds = new Set(lessons.map((l) => l.id));
  for (const q of questions) {
    if (q.lessonId && !lessonIds.has(q.lessonId)) {
      return { valid: false, error: "Some assessments reference a removed lesson." };
    }
  }

  return { valid: true };
}

export function canPublishCourse(lessons: LessonLike[], questions: QuestionLike[]) {
  return validateCourseStructure(lessons, questions);
}

export function canSendInvites(lessons: LessonLike[], questions: QuestionLike[], published: boolean) {
  if (!published) {
    return { valid: false, error: "Publish the course before sending invitations." };
  }
  return validateCourseStructure(lessons, questions);
}
