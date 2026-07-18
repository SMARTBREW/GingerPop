"use client";

import { useEffect, useMemo, useState } from "react";
import { KidZone } from "@/components/layout/KidZone";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MascotQuizPlayer, type InvitePlayLesson } from "@/components/MascotQuizPlayer";

interface TopicNode {
  id: string;
  title: string;
  emoji: string;
  description?: string;
  subtopics: {
    id: string;
    title: string;
    emoji: string;
    lessonMongoId: string;
    lessonSlug: string;
  }[];
}

export type InviteProgressUpdate = {
  score?: number;
  maxScore?: number;
  phase?: string;
  completedLessonIds?: string[];
  contentCompletedLessonIds?: string[];
};

interface InvitePlayLearnerProps {
  token: string;
  courseTitle: string;
  courseDescription?: string;
  emoji?: string;
  color?: string;
  accent?: string;
  topics: TopicNode[];
  playLessons: InvitePlayLesson[];
  score: number;
  maxScore: number;
  phase: string;
  completedLessonIds: string[];
  contentCompletedLessonIds: string[];
  invitedBy?: { name: string; email?: string } | null;
  onProgressReset?: () => void;
}

type Level = "topics" | "lessons" | "play";

export function InvitePlayLearner({
  token,
  courseTitle,
  courseDescription,
  emoji = "📚",
  color = "#fff7ed",
  accent = "#ea580c",
  topics,
  playLessons,
  score,
  maxScore,
  phase,
  completedLessonIds,
  contentCompletedLessonIds,
  invitedBy,
  onProgressReset,
}: InvitePlayLearnerProps) {
  const [level, setLevel] = useState<Level>("topics");
  const [topicId, setTopicId] = useState<string | null>(null);
  const [activeSlug, setActiveSlug] = useState<string | undefined>(undefined);
  const [resetting, setResetting] = useState(false);
  const [liveScore, setLiveScore] = useState(score);
  const [liveMaxScore, setLiveMaxScore] = useState(maxScore);
  const [livePhase, setLivePhase] = useState(phase);
  const [liveCompletedLessonIds, setLiveCompletedLessonIds] = useState(completedLessonIds);
  const [liveContentCompletedLessonIds, setLiveContentCompletedLessonIds] = useState(
    contentCompletedLessonIds,
  );

  useEffect(() => {
    setLiveScore(score);
    setLiveMaxScore(maxScore);
    setLivePhase(phase);
    setLiveCompletedLessonIds(completedLessonIds);
    setLiveContentCompletedLessonIds(contentCompletedLessonIds);
  }, [score, maxScore, phase, completedLessonIds, contentCompletedLessonIds]);

  const applyProgress = (update: InviteProgressUpdate) => {
    if (typeof update.score === "number") setLiveScore(update.score);
    if (typeof update.maxScore === "number") setLiveMaxScore(update.maxScore);
    if (update.phase) setLivePhase(update.phase);
    if (update.completedLessonIds) setLiveCompletedLessonIds(update.completedLessonIds);
    if (update.contentCompletedLessonIds) {
      setLiveContentCompletedLessonIds(update.contentCompletedLessonIds);
    }
  };

  const activeTopic = useMemo(
    () => topics.find((t) => t.id === topicId) ?? null,
    [topics, topicId],
  );

  const isCompleted = livePhase === "completed";
  const hasProgress =
    isCompleted ||
    liveScore > 0 ||
    liveCompletedLessonIds.length > 0 ||
    liveContentCompletedLessonIds.length > 0;
  const reviewMode = isCompleted;

  const handleReset = async (mode: "try_again" | "reset") => {
    const message =
      mode === "try_again"
        ? "Start a fresh graded attempt? Your saved score will be cleared and you can earn stars again."
        : "Reset all progress on this invite? Score, answers, and lesson completion will be cleared.";
    if (!window.confirm(message)) return;

    setResetting(true);
    try {
      const res = await fetch(`/api/learn/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "reset_attempt" }),
      });
      const raw = await res.text();
      let data: { error?: string } = {};
      try {
        data = JSON.parse(raw) as { error?: string };
      } catch {
        throw new Error("Could not reset. Please refresh and try again.");
      }
      if (!res.ok) throw new Error(data.error ?? "Could not reset progress");
      onProgressReset?.();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Could not reset progress");
    } finally {
      setResetting(false);
    }
  };

  if (level === "play" && activeSlug) {
    return (
      <MascotQuizPlayer
        initialLessonId={activeSlug}
        invite={{
          token,
          lessons: playLessons,
          score: liveScore,
          maxScore: liveMaxScore,
          completedLessonIds: liveCompletedLessonIds,
          contentCompletedLessonIds: liveContentCompletedLessonIds,
          reviewMode,
          onProgress: applyProgress,
          onExitToMap: () => {
            setLevel("topics");
            setActiveSlug(undefined);
            onProgressReset?.();
          },
        }}
      />
    );
  }

  return (
    <KidZone className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="kid-blob -left-16 top-20 h-40 w-40 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob right-0 top-10 h-32 w-32 bg-[var(--kid-purple)]" aria-hidden />

      <SiteHeader
        actions={
          <span className="kid-pill border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]">
            ⭐ {liveScore}/{liveMaxScore}
          </span>
        }
      />

      <main className="page-shell relative flex-1 py-8 sm:py-12">
        <p className="kid-pill mb-3 border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">
          {isCompleted ? "🏆 Quest complete — review or try again" : "📖 Your invited quest"}
        </p>

        {isCompleted && level === "topics" && (
          <div className="kid-card mb-8 border-2 border-[#86efac] bg-[#f0fdf4] p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="game-font text-2xl font-bold text-[#065f46]">Quest complete!</h2>
                <p className="mt-1 text-sm font-semibold text-[#047857]">
                  You finished {courseTitle}. Review below, or start a new graded attempt.
                </p>
                {invitedBy && (
                  <p className="mt-1 text-xs font-semibold text-[var(--kid-muted)]">
                    Invited by {invitedBy.name}
                  </p>
                )}
              </div>
              <p className="game-font text-4xl font-bold tabular-nums text-[#065f46]">
                {liveScore}
                <span className="text-lg font-semibold text-[#047857]"> / {liveMaxScore}</span>
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={resetting}
                onClick={() => void handleReset("try_again")}
                className="kid-btn-primary !px-5 !py-2.5 !text-sm"
              >
                {resetting ? "Starting…" : "Try again →"}
              </button>
              <button
                type="button"
                disabled={resetting}
                onClick={() => void handleReset("reset")}
                className="kid-btn-secondary !px-5 !py-2.5 !text-sm"
              >
                Reset progress
              </button>
            </div>
          </div>
        )}

        {!isCompleted && hasProgress && level === "topics" && (
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-[#e9d5ff] bg-[#faf5ff]/80 px-4 py-3">
            <p className="text-sm font-semibold text-[var(--kid-muted)]">
              Progress saved. You can wipe it and start over anytime.
            </p>
            <button
              type="button"
              disabled={resetting}
              onClick={() => void handleReset("reset")}
              className="kid-btn-secondary !px-4 !py-2 !text-sm"
            >
              {resetting ? "Resetting…" : "Reset progress"}
            </button>
          </div>
        )}

        {level === "topics" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-3xl">{emoji}</span>
              <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">
                {courseTitle} chapters
              </h1>
            </div>
            <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
              {courseDescription
                ? courseDescription.replace(/<[^>]*>/g, " ").trim()
                : isCompleted
                  ? "Open any chapter to review — or tap Try again for a new graded run."
                  : "Open a chapter, then a lesson — same as Subjects & Play."}
            </p>
            {invitedBy && !isCompleted && (
              <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
                From {invitedBy.name}
              </p>
            )}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {topics.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setTopicId(t.id);
                    setLevel("lessons");
                  }}
                  className="kid-card p-5 text-left transition-transform hover:-translate-y-1"
                  style={{ background: color }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{t.emoji}</span>
                    <div>
                      <h2 className="game-font text-xl font-bold" style={{ color: accent }}>
                        {t.title}
                      </h2>
                      {t.description && (
                        <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                          {t.description}
                        </p>
                      )}
                      <p className="mt-3 text-sm font-extrabold" style={{ color: accent }}>
                        {t.subtopics.length} lesson{t.subtopics.length === 1 ? "" : "s"} →
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {level === "lessons" && activeTopic && (
          <>
            <h1 className="game-font flex items-center gap-2 text-3xl font-bold text-[var(--kid-text)]">
              <span>{activeTopic.emoji}</span> {activeTopic.title}
            </h1>
            <p className="mt-2 text-base font-semibold text-[var(--kid-muted)]">
              {isCompleted
                ? "Tap a lesson to review the content and practice the quiz (no new score)."
                : "Tap a lesson to learn, then open the quiz — same as the play page."}
            </p>
            <nav className="mb-6 mt-4 text-sm font-bold text-[var(--kid-muted)]">
              <button
                type="button"
                className="text-[var(--kid-purple)]"
                onClick={() => setLevel("topics")}
              >
                {courseTitle}
              </button>
              {" › "}
              <span className="text-[var(--kid-text)]">{activeTopic.title}</span>
            </nav>

            <div className="grid gap-4 sm:grid-cols-2">
              {activeTopic.subtopics.map((sub) => {
                const done = liveCompletedLessonIds.includes(sub.lessonMongoId);
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => {
                      setActiveSlug(sub.lessonSlug);
                      setLevel("play");
                    }}
                    className="kid-card p-5 text-left transition-transform hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{sub.emoji}</span>
                      <div>
                        <h2 className="game-font text-xl font-bold text-[var(--kid-text)]">
                          {sub.title}
                        </h2>
                        <p className="mt-3 text-sm font-extrabold text-[#ea580c]">
                          {done || isCompleted ? "Review →" : "Start lesson →"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setLevel("topics")}
              className="kid-btn-secondary mt-8 !px-5 !py-2.5 !text-sm"
            >
              ← Back
            </button>
          </>
        )}
      </main>

      <SiteFooter showAuthLinks={false} />
    </KidZone>
  );
}
