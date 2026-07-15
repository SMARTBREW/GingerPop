"use client";

import { useEffect, useState } from "react";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import { InvitePlayLearner } from "@/components/InvitePlayLearner";
import { KidZone } from "@/components/layout/KidZone";
import { Spinner } from "@/components/ui/Spinner";
import type { InvitePlayLesson } from "@/components/MascotQuizPlayer";

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
    phase: string;
    completedLessonIds: string[];
    contentCompletedLessonIds: string[];
    invitedBy?: { name: string; email?: string } | null;
    score: number;
    maxScore: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    fetch(`/api/learn/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (cancelled) return;
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
          phase: res.invitation.phase,
          completedLessonIds: res.invitation.completedLessonIds,
          contentCompletedLessonIds: res.invitation.contentCompletedLessonIds ?? [],
          invitedBy: res.invitation.invitedBy ?? null,
          score: res.invitation.score,
          maxScore: res.invitation.maxScore,
        });
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Failed to load course");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  const reloadInvite = () => setReloadKey((k) => k + 1);

  if (loading) {
    return (
      <KidZone>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
          <Spinner label="Loading your quest..." />
          <p className="game-font text-lg font-semibold text-[var(--kid-muted)]">Get ready to play!</p>
        </div>
      </KidZone>
    );
  }

  if (error || !data) {
    return (
      <KidZone>
        <div className="flex min-h-screen items-center justify-center px-4">
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
      </KidZone>
    );
  }

  if (!data.playLessons.length) {
    return (
      <KidZone>
        <div className="flex min-h-screen items-center justify-center px-4">
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
