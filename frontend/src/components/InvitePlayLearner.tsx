"use client";

import { useMemo, useState } from "react";
import { BrandName } from "@/components/BrandName";
import { KidZone } from "@/components/layout/KidZone";
import { MascotQuizPlayer, type InvitePlayLesson } from "@/components/MascotQuizPlayer";

interface TopicNode {
  id: string;
  title: string;
  emoji: string;
  subtopics: {
    id: string;
    title: string;
    emoji: string;
    lessonMongoId: string;
    lessonSlug: string;
  }[];
}

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
}: InvitePlayLearnerProps) {
  const [level, setLevel] = useState<Level>(
    playLessons.length === 1 ? "play" : "topics",
  );
  const [topicId, setTopicId] = useState<string | null>(
    playLessons.length === 1 ? topics[0]?.id ?? null : null,
  );
  const [activeSlug, setActiveSlug] = useState<string | undefined>(
    playLessons.length === 1 ? playLessons[0]?.id : undefined,
  );

  const activeTopic = useMemo(
    () => topics.find((t) => t.id === topicId) ?? null,
    [topics, topicId],
  );

  if (phase === "completed") {
    return (
      <KidZone className="relative min-h-screen overflow-hidden">
        <div className="page-shell flex min-h-screen items-center justify-center py-12">
          <div className="kid-card max-w-lg p-8 text-center sm:p-10">
            <p className="text-5xl" aria-hidden>
              🏆
            </p>
            <h1 className="game-font mt-4 text-3xl font-bold text-[var(--kid-text)]">
              Quest complete!
            </h1>
            <p className="mt-2 font-semibold text-[var(--kid-muted)]">{courseTitle}</p>
            <p className="game-font mt-6 text-4xl font-bold tabular-nums text-[var(--kid-text)]">
              {score}
              <span className="text-xl font-semibold text-[var(--kid-muted)]"> / {maxScore}</span>
            </p>
            {invitedBy && (
              <p className="mt-3 text-sm text-[var(--kid-muted)]">
                Invited by {invitedBy.name}
              </p>
            )}
          </div>
        </div>
      </KidZone>
    );
  }

  if (level === "play" && activeSlug) {
    return (
      <MascotQuizPlayer
        initialLessonId={activeSlug}
        invite={{
          token,
          lessons: playLessons,
          score,
          maxScore,
          completedLessonIds,
          contentCompletedLessonIds,
          onExitToMap: playLessons.length > 1 ? () => setLevel("topics") : undefined,
        }}
      />
    );
  }

  return (
    <KidZone className="relative min-h-screen overflow-hidden">
      <div className="kid-blob -left-16 top-20 h-40 w-40 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob right-0 top-10 h-32 w-32 bg-[var(--kid-purple)]" aria-hidden />

      <header className="sticky top-0 z-40 border-b-2 border-white/60 bg-white/75 backdrop-blur-md">
        <div className="page-shell flex h-16 items-center justify-between">
          <span className="game-font text-2xl font-bold text-[var(--kid-text)]">
            <BrandName />
          </span>
          <span className="kid-pill border border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]">
            ⭐ {score}/{maxScore}
          </span>
        </div>
      </header>

      <main className="page-shell relative py-8 sm:py-12">
        <p className="kid-pill mb-3 border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">
          📖 Your invited quest
        </p>

        {level === "topics" && (
          <>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-3xl">{emoji}</span>
              <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">
                {courseTitle} topics
              </h1>
            </div>
            <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
              {courseDescription
                ? courseDescription.replace(/<[^>]*>/g, " ").trim()
                : "Open a chapter, then a lesson — same as Subjects & Play."}
            </p>
            {invitedBy && (
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
              Tap a lesson to learn, then open the quiz — same as the play page.
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
                const done = completedLessonIds.includes(sub.lessonMongoId);
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
                          {done ? "View again →" : "Start lesson →"}
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
    </KidZone>
  );
}
