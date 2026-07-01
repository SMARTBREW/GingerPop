"use client";

import { useCallback, useRef, useState } from "react";
import { LessonViewer } from "@/components/LessonViewer";
import { QuizPlayer } from "@/components/QuizPlayer";
import { AnswerResult, PlayQuestion } from "@/types/quiz";
import { PublicLesson } from "@/types/course";
import { RichTextContent } from "@/components/editor/RichTextContent";
import { KidZone } from "@/components/layout/KidZone";
import Link from "next/link";
import { BrandName } from "@/components/BrandName";

type LearnerMode = "lesson" | "lesson_quiz" | "quiz_only" | "completed";

type PendingAfterQuiz =
  | { type: "course_complete" }
  | { type: "lesson_done"; nextLessonIdx: number };

interface CourseLearnerProps {
  token: string;
  courseTitle: string;
  courseDescription?: string;
  invitedBy?: { name: string; email?: string } | null;
  lessons: PublicLesson[];
  quizQuestions: PlayQuestion[];
  initialPhase: "learning" | "quiz" | "completed";
  completedLessonIds: string[];
  contentCompletedLessonIds: string[];
  pendingAssessmentLessonId?: string | null;
  isQuizOnly?: boolean;
  initialScore: number;
  maxScore: number;
  answeredQuestionIds: string[];
}

export function CourseLearner({
  token,
  courseTitle,
  courseDescription,
  invitedBy,
  lessons,
  quizQuestions: initialQuizQuestions,
  initialPhase,
  completedLessonIds,
  contentCompletedLessonIds,
  pendingAssessmentLessonId,
  isQuizOnly = false,
  initialScore,
  maxScore,
  answeredQuestionIds,
}: CourseLearnerProps) {
  const [mode, setMode] = useState<LearnerMode>(() => {
    if (initialPhase === "completed") return "completed";
    if (isQuizOnly) return "quiz_only";
    if (pendingAssessmentLessonId) return "lesson_quiz";
    return "lesson";
  });

  const [completedIds, setCompletedIds] = useState<string[]>(completedLessonIds);
  const [contentCompletedIds, setContentCompletedIds] = useState<string[]>(
    contentCompletedLessonIds,
  );
  const [lessonQuizQuestions, setLessonQuizQuestions] = useState<PlayQuestion[]>(
    pendingAssessmentLessonId ? initialQuizQuestions : [],
  );
  const [activeLessonQuizId, setActiveLessonQuizId] = useState<string | null>(
    pendingAssessmentLessonId ?? null,
  );
  const [score, setScore] = useState(initialScore);
  const [answeredIds, setAnsweredIds] = useState<string[]>(answeredQuestionIds);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(() => {
    const firstIncomplete = lessons.findIndex((l) => !completedLessonIds.includes(l.id));
    return firstIncomplete >= 0 ? firstIncomplete : 0;
  });
  const [marking, setMarking] = useState(false);
  const pendingAfterQuizRef = useRef<PendingAfterQuiz | null>(null);

  const handleQuizFinished = useCallback(() => {
    const pending = pendingAfterQuizRef.current;
    pendingAfterQuizRef.current = null;
    if (!pending) return;

    if (pending.type === "course_complete") {
      setMode("completed");
      return;
    }

    setMode("lesson");
    setActiveLessonQuizId(null);
    setLessonQuizQuestions([]);
    if (pending.nextLessonIdx >= 0) setCurrentLessonIdx(pending.nextLessonIdx);
  }, []);

  const currentLesson = lessons[currentLessonIdx];
  const progress = lessons.length > 0 ? (completedIds.length / lessons.length) * 100 : 0;
  const isLessonFullyDone = currentLesson ? completedIds.includes(currentLesson.id) : false;
  const isContentDone = currentLesson
    ? contentCompletedIds.includes(currentLesson.id)
    : false;

  const handleCompleteLesson = async () => {
    if (!currentLesson || marking) return;
    setMarking(true);

    try {
      const res = await fetch(`/api/learn/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete_lesson", lessonId: currentLesson.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setContentCompletedIds(data.contentCompletedLessonIds ?? []);
      if (data.needsAssessment && data.assessmentQuestions?.length) {
        setLessonQuizQuestions(data.assessmentQuestions);
        setActiveLessonQuizId(data.lessonId);
        setMode("lesson_quiz");
      }
    } finally {
      setMarking(false);
    }
  };

  const handleQuizAnswer = useCallback(
    async (questionId: string, selectedIndex: number | null): Promise<AnswerResult> => {
      const res = await fetch(`/api/learn/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "quiz_answer", questionId, selectedIndex }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setScore(data.score);
      setAnsweredIds((prev) => [...prev, questionId]);

      if (data.completed) {
        const prematureQuizComplete =
          isQuizOnly && answeredIds.length + 1 < initialQuizQuestions.length;
        if (!prematureQuizComplete && !isQuizOnly) {
          pendingAfterQuizRef.current = { type: "course_complete" };
        }
      } else if (!isQuizOnly) {
        if (data.completedLessonIds) setCompletedIds(data.completedLessonIds);
        if (activeLessonQuizId && data.completedLessonIds?.includes(activeLessonQuizId)) {
          const nextIdx = lessons.findIndex(
            (l) => !data.completedLessonIds.includes(l.id),
          );
          pendingAfterQuizRef.current = { type: "lesson_done", nextLessonIdx: nextIdx };
        }
      }

      return data;
    },
    [token, isQuizOnly, activeLessonQuizId, lessons, answeredIds.length, initialQuizQuestions.length],
  );

  const lessonQuizTitle = activeLessonQuizId
    ? `${lessons.find((l) => l.id === activeLessonQuizId)?.title ?? "Lesson"} — Assessment`
    : `${courseTitle} — Assessment`;

  if (mode === "completed") {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const stars = percentage >= 80 ? 3 : percentage >= 50 ? 2 : 1;
    return (
      <KidZone>
        <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
          <div className="kid-card max-w-lg p-8 text-center sm:p-10">
            <div className="game-trophy" aria-hidden>
              🏆
            </div>
            <div className="game-star-row" aria-label={`${stars} out of 3 stars`}>
              {[0, 1, 2].map((i) => (
                <span key={i} className={i < stars ? "game-sparkle" : "dim"}>
                  ⭐
                </span>
              ))}
            </div>
            <h1 className="game-font mt-4 text-3xl font-bold text-[var(--kid-text)]">
              {isQuizOnly ? "Quest complete!" : "Adventure complete!"}
            </h1>
            <p className="mt-2 font-semibold text-[var(--kid-muted)]">{courseTitle}</p>
            <p className="game-font mt-6 text-4xl font-bold tabular-nums text-[var(--kid-text)]">
              {score}
              <span className="text-xl font-semibold text-[var(--kid-muted)]"> / {maxScore} stars</span>
            </p>
            <p className="mt-3 text-base text-[var(--kid-muted)]">
              You collected {percentage}% of all the stars!
            </p>
          </div>
        </main>
      </KidZone>
    );
  }

  if (mode === "quiz_only") {
    return (
      <KidZone>
        {invitedBy && (
          <div className="game-invite-banner">
            <span className="game-font">🎉</span>{" "}
            <span className="font-bold">{invitedBy.name}</span> invited you on a quest!
          </div>
        )}
        <QuizPlayer
          questions={initialQuizQuestions}
          quizTitle={courseTitle}
          onSubmitAnswer={handleQuizAnswer}
          onQuizFinished={handleQuizFinished}
          skipQuestionIds={answeredQuestionIds}
          initialScore={score}
          completed={false}
          finalScore={score}
          finalMaxScore={maxScore}
          showHomeLink={false}
          gamified
        />
      </KidZone>
    );
  }

  if (mode === "lesson_quiz") {
    return (
      <KidZone>
        <QuizPlayer
          questions={lessonQuizQuestions}
          quizTitle={lessonQuizTitle.replace(" — Assessment", " Quest")}
          onSubmitAnswer={handleQuizAnswer}
          onQuizFinished={handleQuizFinished}
          skipQuestionIds={answeredQuestionIds}
          initialScore={score}
          completed={false}
          finalScore={score}
          finalMaxScore={maxScore}
          showHomeLink={false}
          gamified
        />
      </KidZone>
    );
  }

  return (
    <KidZone>
      <header className="sticky top-0 z-40 border-b-2 border-white/60 bg-white/75 backdrop-blur-md">
        <div className="page-shell flex min-h-14 flex-col justify-center gap-0.5 py-2 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
          <Link href="/" className="game-font text-xl font-bold text-[var(--kid-text)]">
            <BrandName />
          </Link>
          <div className="min-w-0 sm:max-w-[55%] sm:text-right">
            <span className="block truncate text-base font-bold text-[var(--kid-text)]">
              🗺️ {courseTitle}
            </span>
            {invitedBy && (
              <span className="block truncate text-sm font-semibold text-[var(--kid-muted)]">
                Quest guide: {invitedBy.name}
              </span>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <div className="kid-card lg:sticky lg:top-20 p-4 sm:p-5">
            {invitedBy && (
              <p className="mb-3 rounded-xl border-2 border-[#fcd34d] bg-[#fef9c3] px-3 py-2.5 text-sm font-semibold text-[#92400e]">
                🧭 Guided by <span className="font-bold">{invitedBy.name}</span>
              </p>
            )}
            <h1 className="game-font text-lg font-bold text-[var(--kid-text)] sm:text-xl">
              Quest map
            </h1>
            {courseDescription && (
              <RichTextContent
                html={courseDescription}
                className="mt-1.5 line-clamp-3 text-sm text-[var(--kid-muted)] sm:text-base"
              />
            )}

            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-sm font-semibold text-[var(--kid-muted)]">
                <span>Levels beaten</span>
                <span className="tabular-nums">
                  {completedIds.length}/{lessons.length}
                </span>
              </div>
              <div className="game-progress-track h-3">
                <div className="game-progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <nav className="mt-5 max-h-[50vh] space-y-1 overflow-y-auto">
              {lessons.map((lesson, idx) => {
                const done = completedIds.includes(lesson.id);
                const active = idx === currentLessonIdx;
                const locked = idx > 0 && !completedIds.includes(lessons[idx - 1].id);
                return (
                  <button
                    key={lesson.id}
                    type="button"
                    disabled={locked}
                    onClick={() => !locked && setCurrentLessonIdx(idx)}
                    className={`flex w-full min-h-11 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-base font-semibold transition-all ${
                      active
                        ? "border-2 border-[var(--kid-purple)] bg-[#ede9fe] text-[#5b21b6]"
                        : locked
                          ? "cursor-not-allowed text-gray-300"
                          : "text-[var(--kid-muted)] hover:bg-[#f5f3ff]"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                        done
                          ? "bg-[#bbf7d0] text-[#166534]"
                          : locked
                            ? "bg-gray-100 text-gray-400"
                            : "bg-[#ddd6fe] text-[#6d28d9]"
                      }`}
                    >
                      {done ? "✓" : locked ? "🔒" : idx + 1}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="kid-card p-5 sm:p-8">
            {currentLesson ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="game-font text-sm font-bold uppercase tracking-wide text-[var(--kid-muted)] sm:text-base">
                      Level {currentLessonIdx + 1} of {lessons.length}
                    </p>
                    <h2 className="game-font mt-1 text-xl font-bold text-[var(--kid-text)] sm:text-2xl">
                      {currentLesson.title}
                    </h2>
                  </div>
                  {isLessonFullyDone && (
                    <span className="kid-pill bg-[#bbf7d0] text-[#166534]">✅ Done!</span>
                  )}
                  {isContentDone && !isLessonFullyDone && (
                    <span className="kid-pill bg-[#fef9c3] text-[#92400e]">⚔️ Boss quiz!</span>
                  )}
                </div>

                <LessonViewer lesson={currentLesson} />

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-2 border-[#ede9fe] pt-6">
                  <button
                    type="button"
                    className="kid-btn-secondary !px-4 !py-2 !text-sm disabled:opacity-40"
                    disabled={currentLessonIdx === 0}
                    onClick={() => setCurrentLessonIdx((i) => i - 1)}
                  >
                    ← Back
                  </button>

                  <div className="flex gap-3">
                    {!isContentDone && !isLessonFullyDone && (
                      <button
                        type="button"
                        className="kid-btn-primary !px-5 !py-2 !text-sm disabled:opacity-60"
                        onClick={handleCompleteLesson}
                        disabled={marking}
                      >
                        {marking ? "Saving..." : "Finish level → Quiz!"}
                      </button>
                    )}
                    {isContentDone && !isLessonFullyDone && (
                      <button
                        type="button"
                        className="kid-btn-primary !px-5 !py-2 !text-sm"
                        onClick={() => setMode("lesson_quiz")}
                      >
                        Start boss quiz!
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--kid-muted)]">No levels in this quest yet.</p>
            )}
          </div>
        </div>
      </div>
    </KidZone>
  );
}
