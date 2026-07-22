import { ICourse, ICourseQuizQuestion, ILesson } from "@/models/Course";

export function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function lessonSlug(lesson: ILesson) {
  return (
    lesson.slug?.trim() ||
    lesson.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    lesson._id.toString()
  );
}

export function courseSlug(course: ICourse) {
  return (
    course.slug?.trim() ||
    course.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") ||
    course._id.toString()
  );
}

export function toPlayQuestion(
  q: ICourseQuizQuestion,
  options?: { includeCorrectIndex?: boolean },
) {
  const includeCorrect = options?.includeCorrectIndex !== false;
  const emojis = q.optionEmojis ?? ["🐊", "🐊", "🐊", "😐"];
  const mapped = q.options
    .map((text, i) => ({
      emoji: (emojis[i] || "⭐").trim() || "⭐",
      text: stripHtml(text || ""),
      originalIndex: i,
    }))
    .filter((o) => o.text.trim().length > 0);

  const optionsOut =
    mapped.length >= 2
      ? mapped
      : q.options.map((text, i) => ({
          emoji: (emojis[i] || "⭐").trim() || "⭐",
          text: stripHtml(text || `Option ${i + 1}`),
          originalIndex: i,
        }));

  const remappedCorrect = optionsOut.findIndex((o) => o.originalIndex === q.correctIndex);
  const correctIndex =
    remappedCorrect >= 0 ? remappedCorrect : Math.min(q.correctIndex, optionsOut.length - 1);

  return {
    id: q._id.toString(),
    question: stripHtml(q.question),
    subtitle: q.subtitle,
    options: optionsOut,
    ...(includeCorrect ? { correctIndex } : {}),
    /** Original schema index — used when submitting invite answers */
    correctOriginalIndex: q.correctIndex,
    explanation: q.explanation || "Great job!",
    wrongExplanation: q.wrongExplanation,
    hint: q.hint,
    imageUrl: q.imageUrl || q.mediaUrl,
    videoUrl: q.videoUrl,
    audioUrl: q.audioUrl,
    audioText: q.audioText,
    points: q.points,
    lessonId: q.lessonId?.toString(),
  };
}

export function toPlayLesson(
  course: ICourse,
  lesson: ILesson,
  questions: ICourseQuizQuestion[],
  options?: { includeCorrectIndex?: boolean },
) {
  const pages =
    lesson.pages && lesson.pages.length > 0
      ? lesson.pages.map((p) => ({
          title: p.title || lesson.title,
          content: p.content || "",
          imageUrl: p.imageUrl || lesson.imageUrl || lesson.mediaUrl,
          videoUrl: p.videoUrl,
          audioUrl: p.audioUrl,
          audioText: p.audioText || p.content || lesson.audioText,
        }))
      : [
          {
            title: lesson.title,
            content: lesson.content || "",
            imageUrl: lesson.imageUrl || lesson.mediaUrl,
            videoUrl: lesson.videoUrl,
            audioUrl: lesson.audioUrl,
            audioText: lesson.audioText || stripHtml(lesson.content || ""),
          },
        ];

  const facts = pages.map((p, i) => {
    const body = stripHtml(p.content || "");
    return body ? `${i + 1}. ${p.title} : ${body}` : `${i + 1}. ${p.title}`;
  });

  return {
    id: lessonSlug(lesson),
    mongoId: lesson._id.toString(),
    courseId: course._id.toString(),
    subjectSlug: courseSlug(course),
    title: lesson.title,
    badgeText: lesson.badgeText || lesson.title.toUpperCase(),
    mascotSpeech: lesson.mascotSpeech || `Let's learn about ${lesson.title}!`,
    facts,
    ctaText: lesson.ctaText || "Next",
    imageUrl: lesson.imageUrl || lesson.mediaUrl || pages[0]?.imageUrl,
    pages,
    quizQuestions: questions.map((q) => toPlayQuestion(q, options)),
    topicTitle: lesson.topicTitle || "Chapter",
    topicEmoji: lesson.topicEmoji || "📖",
    topicDescription: lesson.topicDescription,
  };
}
