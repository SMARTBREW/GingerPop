"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { PaginatedList } from "@/components/ui/PaginatedList";

interface CourseSummary {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  lessonCount: number;
  quizCount: number;
  updatedAt: string;
}

interface TeacherSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface StandaloneQuizSummary {
  id: string;
  title: string;
  description?: string;
  questionCount: number;
  referenceCourseTitle?: string;
  referenceLessonTitle?: string;
}

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherSession | null>(null);
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [standaloneQuizzes, setStandaloneQuizzes] = useState<StandaloneQuizSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const [creatingQuiz, setCreatingQuiz] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await fetch("/api/auth/me", { credentials: "include" });
        const meData = await meRes.json();
        if (!meRes.ok || !meData.admin) {
          window.location.href = "/login/teacher";
          return;
        }
        if (cancelled) return;
        setTeacher(meData.admin);

        const coursesRes = await fetch("/api/courses", { credentials: "include" });
        const coursesData = await coursesRes.json();
        if (!coursesRes.ok) throw new Error(coursesData.error ?? "Failed to load courses");
        if (!cancelled) setCourses(coursesData.courses ?? []);

        const quizzesRes = await fetch("/api/quizzes", { credentials: "include" });
        const quizzesData = await quizzesRes.json();
        if (!quizzesRes.ok) throw new Error(quizzesData.error ?? "Failed to load quizzes");
        if (!cancelled) setStandaloneQuizzes(quizzesData.quizzes ?? []);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.published).length;
    const lessons = courses.reduce((s, c) => s + c.lessonCount, 0);
    const questions = courses.reduce((s, c) => s + c.quizCount, 0);
    return { published, lessons, questions, total: courses.length };
  }, [courses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create course");
      router.push(`/admin/courses/${data.course.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create course");
      setCreating(false);
    }
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;
    setCreatingQuiz(true);
    setError("");
    try {
      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newQuizTitle }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create standalone quiz");
      router.push(`/admin/quizzes/${data.quiz.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create standalone quiz");
      setCreatingQuiz(false);
    }
  };

  const firstName = teacher?.name?.split(" ")[0] ?? "Teacher";

  const handleDeleteSubject = async (course: CourseSummary) => {
    const ok = window.confirm(
      `Delete subject “${course.title}”?\n\nThis permanently removes its lessons, quizzes, and all invite links. This cannot be undone.`,
    );
    if (!ok) return;

    setError("");
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Failed to delete subject");
      setCourses((prev) => prev.filter((c) => c.id !== course.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete subject");
    }
  };

  const handleDeleteQuiz = async (quiz: StandaloneQuizSummary) => {
    const ok = window.confirm(
      `Delete standalone quiz “${quiz.title}”? This also removes its share links and cannot be undone.`,
    );
    if (!ok) return;
    const res = await fetch(`/api/quizzes/${quiz.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Failed to delete standalone quiz");
      return;
    }
    setStandaloneQuizzes((current) => current.filter((item) => item.id !== quiz.id));
  };

  return (
    <AdminShell>
      {loading ? (
        <p className="game-font text-lg font-bold text-[var(--kid-muted)]">Loading dashboard…</p>
      ) : (
        <>
          <section
            className="kid-card mb-8 overflow-hidden p-6 sm:p-8"
            style={{ background: "linear-gradient(135deg, #fff7ed, #fef9c3)" }}
          >
            <p className="kid-pill mb-3 border-2 border-[#fed7aa] bg-white text-[#c2410c]">Teacher dashboard</p>
            <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">
              Hi {firstName}! 👋
            </h1>
            <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
              Build subjects with chapters and lessons, or create a standalone quiz to reference and share.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#create-course" className="kid-btn-primary !px-5 !py-2.5 !text-sm">
                Create a subject →
              </a>
            </div>
          </section>

          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="kid-card p-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">Subjects</p>
              <p className="game-font mt-1 text-3xl font-bold text-[#c2410c]">{stats.total}</p>
            </div>
            <div className="kid-card p-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">Published</p>
              <p className="game-font mt-1 text-3xl font-bold text-[#166534]">{stats.published}</p>
            </div>
            <div className="kid-card p-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">Lessons</p>
              <p className="game-font mt-1 text-3xl font-bold text-[var(--kid-purple)]">{stats.lessons}</p>
            </div>
            <div className="kid-card p-5 text-center">
              <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">Questions</p>
              <p className="game-font mt-1 text-3xl font-bold text-[#b45309]">{stats.questions}</p>
            </div>
          </div>

          <section id="create-course" className="kid-card mb-8 p-6 sm:p-8">
            <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">Quick start</h2>
            <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
              Name a subject (like Maths), then add topics, lessons, images, audio, and quiz.
            </p>
            <form onSubmit={handleCreate} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Subject title</span>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="e.g. Maths"
                  className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                />
              </label>
              <button type="submit" disabled={creating} className="kid-btn-primary shrink-0 !px-5 !py-3 !text-sm">
                {creating ? "Creating..." : "Create subject"}
              </button>
            </form>
            <div className="my-6 border-t border-[#fed7aa]" />
            <h3 className="game-font text-xl font-bold text-[var(--kid-text)]">
              Create standalone quiz
            </h3>
            <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
              Create questions, select a lesson as the reference, then share the quiz independently.
            </p>
            <form onSubmit={handleCreateQuiz} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Quiz title</span>
                <input
                  value={newQuizTitle}
                  onChange={(e) => setNewQuizTitle(e.target.value)}
                  required
                  placeholder="e.g. Comparing Numbers Check"
                  className="w-full rounded-xl border-2 border-[#e9d5ff] bg-white px-4 py-3 text-base font-semibold outline-none focus:border-[#a78bfa]"
                />
              </label>
              <button type="submit" disabled={creatingQuiz} className="kid-btn-secondary shrink-0 !px-5 !py-3 !text-sm">
                {creatingQuiz ? "Creating..." : "Create standalone quiz"}
              </button>
            </form>
          </section>

          <section id="all-courses">
            <div className="mb-4">
              <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">Your subjects</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                Open a subject to edit chapters and lessons
              </p>
            </div>

            {error && (
              <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            {!error && courses.length === 0 && (
              <div className="kid-card p-8 text-center sm:p-10">
                <p className="text-5xl" aria-hidden>
                  📚
                </p>
                <p className="game-font mt-4 text-2xl font-bold text-[var(--kid-text)]">No subjects yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[var(--kid-muted)]">
                  Create your first subject above to publish lessons on Subjects & Play.
                </p>
                <a href="#create-course" className="kid-btn-primary mt-6 inline-flex">
                  Create a subject
                </a>
              </div>
            )}

            <PaginatedList
              items={courses}
              pageSize={5}
              keyExtractor={(course) => course.id}
              renderItem={(course) => (
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="hidden text-2xl sm:inline" aria-hidden>
                      🗺️
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className="kid-pill !text-xs"
                          style={{
                            background: course.published ? "#dcfce7" : "#fef3c7",
                            color: course.published ? "#166534" : "#92400e",
                          }}
                        >
                          {course.published ? "Published" : "Draft"}
                        </span>
                        <p className="text-sm font-extrabold text-[var(--kid-purple)]">
                          {course.lessonCount} lessons · {course.quizCount} questions
                        </p>
                      </div>
                      <h3 className="game-font mt-1.5 text-lg font-bold text-[var(--kid-text)] sm:text-xl">
                        {course.title}
                      </h3>
                      {course.description && (
                        <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--kid-muted)]">
                          {course.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <Link
                      href={`/admin/courses/${course.id}`}
                      className="kid-btn-primary inline-flex !px-4 !py-2 !text-sm"
                    >
                      Edit subject →
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDeleteSubject(course)}
                      className="rounded-full border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700 transition hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          </section>

          <section className="mt-10" id="standalone-quizzes">
            <div className="mb-4">
              <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">
                Standalone quizzes
              </h2>
              <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                Independent quizzes that can reference a lesson and be shared directly
              </p>
            </div>
            <PaginatedList
              items={standaloneQuizzes}
              pageSize={5}
              keyExtractor={(quiz) => quiz.id}
              empty={
                <div className="kid-card p-8 text-center">
                  <p className="text-4xl">🎯</p>
                  <p className="game-font mt-3 text-xl font-bold">No standalone quizzes yet</p>
                </div>
              }
              renderItem={(quiz) => (
                <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="kid-pill bg-[#ede9fe] text-[#5b21b6]">Standalone quiz</span>
                      <span className="text-sm font-bold text-[var(--kid-muted)]">
                        {quiz.questionCount} question{quiz.questionCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <h3 className="game-font mt-2 text-xl font-bold">{quiz.title}</h3>
                    {quiz.referenceLessonTitle && (
                      <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                        Reference: {quiz.referenceCourseTitle} → {quiz.referenceLessonTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/admin/quizzes/${quiz.id}`} className="kid-btn-primary !px-4 !py-2 !text-sm">
                      Edit & share →
                    </Link>
                    <button
                      type="button"
                      onClick={() => void handleDeleteQuiz(quiz)}
                      className="rounded-full border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            />
          </section>
        </>
      )}
    </AdminShell>
  );
}
