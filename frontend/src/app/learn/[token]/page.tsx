"use client";

import { useEffect, useState } from "react";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import { CourseLearner } from "@/components/CourseLearner";
import { PlayQuestion } from "@/types/quiz";
import { PublicLesson } from "@/types/course";
import { Spinner } from "@/components/ui/Spinner";
import { Card } from "@/components/ui/Card";

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
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Spinner label="Loading course..." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4">
        <Card className="max-w-md text-center">
          <p className="text-sm text-red-600">{error || "Course not found or link expired."}</p>
        </Card>
      </div>
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
