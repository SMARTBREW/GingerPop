"use client";

import { useEffect, useState } from "react";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import { CourseLearner } from "@/components/CourseLearner";
import { KidZone } from "@/components/layout/KidZone";
import { Spinner } from "@/components/ui/Spinner";
import type { PlayQuestion } from "@/types/quiz";

interface QuizInviteData {
  title: string;
  description?: string;
  reference?: { subjectTitle: string; lessonTitle: string } | null;
  questions: PlayQuestion[];
  score: number;
  maxScore: number;
  phase: "quiz" | "completed";
  answeredQuestionIds: string[];
  invitedBy?: { name: string; email?: string } | null;
}

export default function InviteQuizPage() {
  const token = useDynamicParam(1, "token");
  const [data, setData] = useState<QuizInviteData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || token === "_") return;
    fetch(`/api/invite/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const result = await response
          .json()
          .catch(() => ({} as { error?: string }));

        if (response.status === 401) {
          const next = `/invite/${encodeURIComponent(token)}`;
          window.location.href = `/login/student?next=${encodeURIComponent(next)}`;
          return;
        }

        if (!response.ok) throw new Error(result.error ?? "Failed to load quiz");
        const reference = result.quiz.reference;
        setData({
          title: result.quiz.title,
          description: [
            result.quiz.description,
            reference
              ? `Reference: ${reference.subjectTitle} → ${reference.lessonTitle}`
              : null,
          ]
            .filter(Boolean)
            .join("\n"),
          reference,
          questions: result.quiz.questions ?? [],
          score: Number(result.invitation.score) || 0,
          maxScore: Number(result.invitation.maxScore) || 0,
          phase:
            result.invitation.status === "completed" ? "completed" : "quiz",
          answeredQuestionIds: result.answeredQuestionIds ?? [],
          invitedBy: result.invitation.invitedBy,
        });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load quiz"));
  }, [token]);

  if (error) {
    return (
      <KidZone className="flex min-h-screen items-center justify-center px-4">
        <div className="kid-card max-w-md p-8 text-center font-bold text-red-700">{error}</div>
      </KidZone>
    );
  }

  if (!data) {
    return (
      <KidZone className="flex min-h-screen items-center justify-center">
        <Spinner label="Loading quiz…" />
      </KidZone>
    );
  }

  return (
    <CourseLearner
      token={token}
      courseTitle={data.title}
      courseDescription={data.description}
      invitedBy={data.invitedBy}
      lessons={[]}
      quizQuestions={data.questions}
      initialPhase={data.phase}
      completedLessonIds={[]}
      contentCompletedLessonIds={[]}
      isQuizOnly
      initialScore={data.score}
      maxScore={data.maxScore}
      answeredQuestionIds={data.answeredQuestionIds}
      apiBase="invite"
    />
  );
}
