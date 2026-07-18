"use client";

import { useEffect, useState } from "react";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import { InvitePlayLearner } from "@/components/InvitePlayLearner";
import { KidZone } from "@/components/layout/KidZone";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Spinner } from "@/components/ui/Spinner";
import { CourseLearner } from "@/components/CourseLearner";
import type { InvitePlayLesson } from "@/components/MascotQuizPlayer";
import type { PlayQuestion } from "@/types/quiz";

interface PlayLessonApi {
  id: string;
  mongoId: string;
  title: string;
  badgeText?: string;
  mascotSpeech: string;
  facts: string[];
  ctaText?: string;
  imageUrl?: string;
  pages?: {
    title: string;
    content?: string;
    imageUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
    audioText?: string;
  }[];
  quizQuestions: InvitePlayLesson["quizQuestions"];
  topicTitle?: string;
  topicEmoji?: string;
}

export default function LearnPage() {
  const token = useDynamicParam(1, "token");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [error, setError] = useState("");
  const [data, setData] = useState<{
    courseTitle: string;
    courseDescription?: string;
    emoji?: string;
    color?: string;
    accent?: string;
    topics: {
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
    }[];
    playLessons: InvitePlayLesson[];
    quizQuestions: PlayQuestion[];
    isQuizOnly: boolean;
    answeredQuestionIds: string[];
    phase: string;
    completedLessonIds: string[];
    contentCompletedLessonIds: string[];
    invitedBy?: { name: string; email?: string } | null;
    score: number;
    maxScore: number;
  } | null>(null);

  useEffect(() => {
    if (!token || token === "_") {
      setLoading(true);
      return;
    }

    let cancelled = false;
    const showSpinner = !data;
    if (showSpinner) {
      setLoading(true);
      setError("");
    }

    fetch(`/api/learn/${encodeURIComponent(token)}`, {
      cache: "no-store",
      credentials: "include",
    })
      .then(async (r) => {
        const res = await r.json();
        if (cancelled) return;

        if (r.status === 401) {
          const next = `/learn/${encodeURIComponent(token)}`;
          window.location.href = `/login/student?next=${encodeURIComponent(next)}`;
          return;
        }

        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }

        const playLessons: InvitePlayLesson[] = (res.course.playLessons ?? []).map(
          (l: PlayLessonApi) => ({
            id: l.id,
            mongoId: l.mongoId,
            title: l.title,
            badgeText: l.badgeText,
            mascotSpeech: l.mascotSpeech,
            facts: l.facts ?? [],
            ctaText: l.ctaText || "Next",
            imageUrl: l.imageUrl,
            pages: l.pages,
            quizQuestions: l.quizQuestions ?? [],
          }),
        );

        setData({
          courseTitle: res.course.title,
          courseDescription: res.course.description,
          emoji: res.course.emoji,
          color: res.course.color,
          accent: res.course.accent,
          topics: res.course.topics ?? [],
          playLessons,
          quizQuestions: res.course.quizQuestions ?? [],
          isQuizOnly: Boolean(res.invitation.isQuizOnly),
          answeredQuestionIds: res.answeredQuestionIds ?? [],
          phase: res.invitation.phase,
          completedLessonIds: res.invitation.completedLessonIds ?? [],
          contentCompletedLessonIds: res.invitation.contentCompletedLessonIds ?? [],
          invitedBy: res.invitation.invitedBy ?? null,
          score: Number(res.invitation.score) || 0,
          maxScore: Number(res.invitation.maxScore) || 0,
        });
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        if (showSpinner) setError("Failed to load course");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch on token/reloadKey; keep map UI mounted on silent refresh
  }, [token, reloadKey]);

  useEffect(() => {
    if (!token || token === "_") return;
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setReloadKey((k) => k + 1);
    };
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [token]);

  const reloadInvite = () => setReloadKey((k) => k + 1);

  if (loading) {
    return (
      <KidZone className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <Spinner label="Loading your quest..." />
          <p className="game-font text-lg font-semibold text-[var(--kid-muted)]">Get ready to play!</p>
        </div>
        <SiteFooter showAuthLinks={false} />
      </KidZone>
    );
  }

  if (error || !data) {
    return (
      <KidZone className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="kid-card max-w-md p-8 text-center">
            <p className="text-4xl" aria-hidden>
              😕
            </p>
            <p className="game-font mt-4 text-lg font-bold text-red-600">
              {error || "This quest link expired or was not found."}
            </p>
            <p className="mt-2 text-sm text-[var(--kid-muted)]">
              Ask your teacher to send you a new link!
            </p>
          </div>
        </div>
        <SiteFooter />
      </KidZone>
    );
  }

  if (data.isQuizOnly) {
    return (
      <CourseLearner
        token={token}
        courseTitle={data.courseTitle}
        courseDescription={data.courseDescription}
        invitedBy={data.invitedBy}
        lessons={[]}
        quizQuestions={data.quizQuestions}
        initialPhase={data.phase as "learning" | "quiz" | "completed"}
        completedLessonIds={[]}
        contentCompletedLessonIds={[]}
        isQuizOnly
        initialScore={data.score}
        maxScore={data.maxScore}
        answeredQuestionIds={data.answeredQuestionIds}
      />
    );
  }

  if (!data.playLessons.length) {
    return (
      <KidZone className="relative flex min-h-screen flex-col">
        <SiteHeader />
        <div className="flex flex-1 items-center justify-center px-4">
          <div className="kid-card max-w-md p-8 text-center">
            <p className="text-4xl">📚</p>
            <p className="game-font mt-4 text-lg font-bold text-[var(--kid-text)]">
              No lessons yet
            </p>
            <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
              Ask your teacher to add topics and lessons, then publish the subject.
            </p>
          </div>
        </div>
        <SiteFooter />
      </KidZone>
    );
  }

  return (
    <InvitePlayLearner
      token={token}
      courseTitle={data.courseTitle}
      courseDescription={data.courseDescription}
      emoji={data.emoji}
      color={data.color}
      accent={data.accent}
      topics={data.topics}
      playLessons={data.playLessons}
      score={data.score}
      maxScore={data.maxScore}
      phase={data.phase}
      completedLessonIds={data.completedLessonIds}
      contentCompletedLessonIds={data.contentCompletedLessonIds}
      invitedBy={data.invitedBy}
      onProgressReset={reloadInvite}
    />
  );
}
