import { Router, Request, Response } from "express";
import { connectDB } from "@/lib/mongodb";
import { jsonError, jsonOk } from "@/lib/api";
import { Course, ICourse, ICourseQuizQuestion, ILesson } from "@/models/Course";
import {
  courseSlug,
  lessonSlug,
  stripHtml,
  toPlayLesson,
} from "@/lib/play-lesson";

const router = Router();

/** Public catalog shaped like SUBJECT_CATALOG for /subjects */
router.get("/catalog", async (_req: Request, res: Response) => {
  try {
    await connectDB();
    const courses = await Course.find({ published: true }).sort({ title: 1 });

    const subjects = courses.map((course) => {
      const lessons = [...course.lessons].sort((a, b) => a.order - b.order);
      const topicMap = new Map<
        string,
        {
          id: string;
          title: string;
          emoji?: string;
          description?: string;
          subtopics: {
            id: string;
            title: string;
            description?: string;
            emoji?: string;
            lessonId?: string;
          }[];
        }
      >();

      for (const lesson of lessons) {
        const topicKey = (lesson.topicTitle || "Lessons").trim() || "Lessons";
        const topicId = topicKey
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "");
        if (!topicMap.has(topicId)) {
          topicMap.set(topicId, {
            id: topicId,
            title: topicKey,
            emoji: lesson.topicEmoji || "📖",
            description: undefined,
            subtopics: [],
          });
        }
        topicMap.get(topicId)!.subtopics.push({
          id: lessonSlug(lesson),
          title: lesson.title,
          emoji: "✨",
          description: stripHtml(lesson.mascotSpeech || lesson.content || "").slice(0, 120),
          lessonId: lessonSlug(lesson),
        });
      }

      return {
        id: courseSlug(course),
        courseId: course._id.toString(),
        title: course.title,
        description: stripHtml(course.description || "Practice quests from your teacher"),
        emoji: course.emoji || "📚",
        color: course.color || "#fff7ed",
        accent: course.accent || "#ea580c",
        topics: Array.from(topicMap.values()),
      };
    });

    return jsonOk(res, { subjects });
  } catch (err) {
    console.error("Public catalog error:", err);
    return jsonError(res, "Failed to load catalog", 500);
  }
});

/** Full play lesson by slug (lesson slug or mongo id) */
router.get("/lessons/:slug", async (req: Request, res: Response) => {
  try {
    await connectDB();
    const { slug } = req.params;
    const courses = await Course.find({ published: true });

    for (const course of courses) {
      for (const lesson of course.lessons) {
        const matches =
          lessonSlug(lesson) === slug ||
          lesson._id.toString() === slug ||
          lesson.slug === slug;
        if (!matches) continue;

        const questions = course.quizQuestions
          .filter((q: ICourseQuizQuestion) => q.lessonId?.toString() === lesson._id.toString())
          .sort((a: ICourseQuizQuestion, b: ICourseQuizQuestion) => a.order - b.order);

        return jsonOk(res, { lesson: toPlayLesson(course as ICourse, lesson, questions) });
      }
    }

    return jsonError(res, "Lesson not found", 404);
  } catch (err) {
    console.error("Public lesson error:", err);
    return jsonError(res, "Failed to load lesson", 500);
  }
});

export default router;
