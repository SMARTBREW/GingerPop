import { CourseQuizQuestion, Lesson } from "@/types/course";

export type CourseEditorSnapshot = {
  title: string;
  description: string;
  published: boolean;
  subjectMeta: {
    emoji: string;
    color: string;
    accent: string;
    slug: string;
  };
  lessons: (Lesson & { id: string })[];
  quizQuestions: (CourseQuizQuestion & { id: string })[];
};

export function buildCourseSnapshot(state: CourseEditorSnapshot) {
  return JSON.stringify(state);
}

export function snapshotFromApiCourse(course: {
  title: string;
  description?: string;
  published: boolean;
  emoji?: string;
  color?: string;
  accent?: string;
  slug?: string;
  lessons: (Lesson & { id: string })[];
  quizQuestions: (CourseQuizQuestion & { id: string })[];
}): string {
  return buildCourseSnapshot({
    title: course.title,
    description: course.description ?? "",
    published: course.published,
    subjectMeta: {
      emoji: course.emoji || "📚",
      color: course.color || "#fff7ed",
      accent: course.accent || "#ea580c",
      slug: course.slug || "",
    },
    lessons: course.lessons.map((l) => ({
      ...l,
      id: l.id,
      pages: l.pages?.length
        ? l.pages
        : l.content
          ? [{ title: l.title || "Lesson page 1", content: l.content, imageUrl: l.imageUrl || l.mediaUrl }]
          : [{ title: "Lesson page 1", content: "", imageUrl: l.imageUrl || l.mediaUrl }],
    })),
    quizQuestions: course.quizQuestions.map((q) => ({
      ...q,
      id: q.id,
      optionEmojis: q.optionEmojis ?? ["🐊", "🐊", "🐊", "😐"],
    })),
  });
}
