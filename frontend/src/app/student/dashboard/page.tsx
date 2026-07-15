"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { BrandName } from "@/components/BrandName";
import { KidZone } from "@/components/layout/KidZone";

interface StudentCourseItem {
  invitationId: string;
  token: string;
  phase: string;
  score: number;
  maxScore: number;
  expired: boolean;
  learnUrl: string;
  course: { id: string; title: string; description: string } | null;
}

interface StudentSession {
  id: string;
  name: string;
  email: string;
}

function phaseLabel(phase: string, expired: boolean) {
  if (expired) return "Expired";
  if (phase === "completed") return "Completed";
  if (phase === "quiz") return "Quiz time";
  return "In progress";
}

function phaseColor(phase: string, expired: boolean) {
  if (expired) return { bg: "#fef3c7", text: "#92400e" };
  if (phase === "completed") return { bg: "#dcfce7", text: "#166534" };
  if (phase === "quiz") return { bg: "#ede9fe", text: "#5b21b6" };
  return { bg: "#e0f2fe", text: "#075985" };
}

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<StudentSession | null>(null);
  const [courses, setCourses] = useState<StudentCourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const meRes = await fetch("/api/student/auth/me", { credentials: "include" });
        const meData = await meRes.json();
        if (!meRes.ok || !meData.student) {
          window.location.href = "/login/student";
          return;
        }
        if (cancelled) return;
        setStudent(meData.student);

        const coursesRes = await fetch("/api/student/courses", { credentials: "include" });
        const coursesData = await coursesRes.json();
        if (!coursesRes.ok) throw new Error(coursesData.error ?? "Failed to load courses");
        if (!cancelled) setCourses(coursesData.courses ?? []);
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
    const active = courses.filter((c) => !c.expired && c.phase !== "completed").length;
    const completed = courses.filter((c) => c.phase === "completed").length;
    const stars = courses.reduce((sum, c) => sum + (c.score || 0), 0);
    return { active, completed, stars, total: courses.length };
  }, [courses]);

  const logout = async () => {
    await fetch("/api/student/auth/logout", { method: "POST", credentials: "include" });
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <KidZone>
        <div className="flex min-h-screen items-center justify-center game-font text-lg font-bold text-[var(--kid-muted)]">
          Loading your dashboard…
        </div>
      </KidZone>
    );
  }

  return (
    <KidZone className="relative min-h-screen overflow-hidden">
      <div className="kid-blob -left-16 top-24 h-40 w-40 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob right-0 top-16 h-32 w-32 bg-[var(--kid-grass)]" aria-hidden />

      <header className="sticky top-0 z-40 border-b-2 border-white/60 bg-white/75 backdrop-blur-md">
        <div className="page-shell flex h-16 items-center justify-between gap-3 sm:h-[4.5rem]">
          <Link href="/student/dashboard" className="game-font text-xl font-bold text-[var(--kid-text)] sm:text-2xl">
            <BrandName />
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            {student && (
              <span className="kid-pill hidden border border-[#bbf7d0] bg-[#f0fdf4] text-[#166534] sm:inline-flex">
                🎒 {student.name}
              </span>
            )}
            <Link href="/subjects" className="kid-btn-secondary !px-3 !py-1.5 !text-sm">
              Practice
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--kid-muted)] hover:bg-white/80"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <main className="page-shell relative py-8 sm:py-12">
        <section className="kid-card mb-8 overflow-hidden p-6 sm:p-8" style={{ background: "linear-gradient(135deg, #f0fdf4, #ecfeff)" }}>
          <p className="kid-pill mb-3 border-2 border-[#bbf7d0] bg-white text-[#166534]">Student dashboard</p>
          <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">
            Hi {student?.name?.split(" ")[0] ?? "there"}! 👋
          </h1>
          <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
            This is your home after login. Open invited courses below, or jump into practice quests anytime.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/subjects" className="kid-btn-primary !px-5 !py-2.5 !text-sm">
              Browse subjects →
            </Link>
            <a href="#my-courses" className="kid-btn-secondary !px-5 !py-2.5 !text-sm">
              My courses
            </a>
          </div>
        </section>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="kid-card p-5 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">Active quests</p>
            <p className="game-font mt-1 text-3xl font-bold text-[#166534]">{stats.active}</p>
          </div>
          <div className="kid-card p-5 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">Completed</p>
            <p className="game-font mt-1 text-3xl font-bold text-[var(--kid-purple)]">{stats.completed}</p>
          </div>
          <div className="kid-card p-5 text-center">
            <p className="text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">Stars earned</p>
            <p className="game-font mt-1 text-3xl font-bold text-[#b45309]">⭐ {stats.stars}</p>
          </div>
        </div>

        <section id="my-courses">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">My courses</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                Invites sent to {student?.email}
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          {!error && courses.length === 0 && (
            <div className="kid-card p-8 text-center sm:p-10">
              <p className="text-5xl" aria-hidden>
                📭
              </p>
              <p className="game-font mt-4 text-2xl font-bold text-[var(--kid-text)]">No course invites yet</p>
              <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[var(--kid-muted)]">
                Ask your teacher to invite <strong>{student?.email}</strong>, or start a practice quest while you wait.
              </p>
              <Link href="/subjects" className="kid-btn-primary mt-6 inline-flex">
                Start practice quest
              </Link>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((item) => {
              const colors = phaseColor(item.phase, item.expired);
              return (
                <div key={item.invitationId} className="kid-card flex flex-col p-5 sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span
                        className="kid-pill"
                        style={{ background: colors.bg, color: colors.text }}
                      >
                        {phaseLabel(item.phase, item.expired)}
                      </span>
                      <h3 className="game-font mt-3 text-xl font-bold text-[var(--kid-text)]">
                        {item.course?.title ?? "Course"}
                      </h3>
                      {item.course?.description && (
                        <p className="mt-1 line-clamp-2 text-sm font-semibold text-[var(--kid-muted)]">
                          {item.course.description}
                        </p>
                      )}
                      {item.maxScore > 0 && (
                        <p className="mt-2 text-sm font-extrabold text-[var(--kid-purple)]">
                          Score {item.score}/{item.maxScore}
                        </p>
                      )}
                    </div>
                    <span className="text-3xl" aria-hidden>
                      🗺️
                    </span>
                  </div>

                  <div className="mt-auto pt-5">
                    {!item.expired ? (
                      <Link
                        href={item.learnUrl}
                        className="kid-btn-primary inline-flex !px-4 !py-2 !text-sm"
                      >
                        {item.phase === "completed" ? "Review quest →" : "Continue quest →"}
                      </Link>
                    ) : (
                      <p className="text-sm font-bold text-[#b45309]">Ask your teacher for a new invite</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </KidZone>
  );
}
