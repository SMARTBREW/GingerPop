"use client";

import { useEffect, useState } from "react";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import { CourseLearner } from "@/components/CourseLearner";
import { KidZone } from "@/components/layout/KidZone";
import { PlayQuestion } from "@/types/quiz";
import { PublicLesson } from "@/types/course";
import { Spinner } from "@/components/ui/Spinner";

export default function LearnPage() {
  const token = useDynamicParam(1, "token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<{
    courseTitle: string;
    courseDescription?: string;
    lessons: PublicLesson[];
    quizQuestions: PlayQuestion[];
    phase: "learning" | "quiz" | "completed";
    completedLessonIds: string[];
    contentCompletedLessonIds: string[];
    pendingAssessmentLessonId?: string | null;
    isQuizOnly: boolean;
    invitedBy?: { name: string; email?: string } | null;
    score: number;
    maxScore: number;
    answeredQuestionIds: string[];
  } | null>(null);

  useEffect(() => {
    fetch(`/api/learn/${token}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.error) {
          setError(res.error);
          setLoading(false);
          return;
        }
        setData({
          courseTitle: res.course.title,
          courseDescription: res.course.description,
          lessons: res.course.lessons,
          quizQuestions: res.course.quizQuestions ?? [],
          phase: res.invitation.phase,
          completedLessonIds: res.invitation.completedLessonIds,
          contentCompletedLessonIds: res.invitation.contentCompletedLessonIds ?? [],
          pendingAssessmentLessonId: res.invitation.pendingAssessmentLessonId,
          isQuizOnly: res.invitation.isQuizOnly ?? false,
          invitedBy: res.invitation.invitedBy ?? null,
          score: res.invitation.score,
          maxScore: res.invitation.maxScore,
          answeredQuestionIds: res.answeredQuestionIds ?? [],
        });
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load course");
        setLoading(false);
      });
  }, [token]);

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

  return (
    <CourseLearner
      token={token}
      courseTitle={data.courseTitle}
      courseDescription={data.courseDescription}
      invitedBy={data.invitedBy}
      lessons={data.lessons}
      quizQuestions={data.quizQuestions}
      initialPhase={data.phase}
      completedLessonIds={data.completedLessonIds}
      contentCompletedLessonIds={data.contentCompletedLessonIds}
      pendingAssessmentLessonId={data.pendingAssessmentLessonId}
      isQuizOnly={data.isQuizOnly}
      initialScore={data.score}
      maxScore={data.maxScore}
      answeredQuestionIds={data.answeredQuestionIds}
    />
  );
}
