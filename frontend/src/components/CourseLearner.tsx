"use client";

import { useCallback, useState } from "react";
import { LessonViewer } from "@/components/LessonViewer";
import { QuizPlayer } from "@/components/QuizPlayer";
import { LearnerHeader } from "@/components/layout/LearnerHeader";
import { AnswerResult, PlayQuestion } from "@/types/quiz";
import { PublicLesson } from "@/types/course";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

type LearnerMode = "lesson" | "lesson_quiz" | "quiz_only" | "completed";

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
        setMode("completed");
      } else if (!isQuizOnly) {
        if (data.completedLessonIds) setCompletedIds(data.completedLessonIds);
        if (activeLessonQuizId && data.completedLessonIds?.includes(activeLessonQuizId)) {
          setMode("lesson");
          setActiveLessonQuizId(null);
          setLessonQuizQuestions([]);
          const nextIdx = lessons.findIndex(
            (l) => !data.completedLessonIds.includes(l.id),
          );
          if (nextIdx >= 0) setCurrentLessonIdx(nextIdx);
        }
      }

      return data;
    },
    [token, isQuizOnly, activeLessonQuizId, lessons],
  );

  const lessonQuizTitle = activeLessonQuizId
    ? `${lessons.find((l) => l.id === activeLessonQuizId)?.title ?? "Lesson"} — Assessment`
    : `${courseTitle} — Assessment`;

  if (mode === "completed") {
    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
        <Card className="max-w-lg text-center">
          <Badge variant={percentage >= 50 ? "success" : "warning"} className="mb-4">
            {isQuizOnly ? "Assessment complete" : "Course complete"}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">{courseTitle}</h1>
          <p className="mt-6 text-3xl font-semibold tabular-nums text-gray-900">
            {score}
            <span className="text-lg font-normal text-gray-400"> / {maxScore} points</span>
          </p>
          <p className="mt-3 text-sm text-gray-600">
            You scored {percentage}% across all assessments.
          </p>
        </Card>
      </main>
    );
  }

  if (mode === "quiz_only") {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        {invitedBy && (
          <div className="border-b border-[var(--accent)]/20 bg-[var(--accent-muted)] px-4 py-3 text-center text-base text-[var(--accent-hover)] sm:px-6">
            <span className="font-medium">{invitedBy.name}</span> invited you to complete this
            assessment.
          </div>
        )}
        <QuizPlayer
          questions={initialQuizQuestions}
          quizTitle={`${courseTitle} — Assessment`}
          onSubmitAnswer={handleQuizAnswer}
          skipQuestionIds={answeredIds}
          initialScore={score}
          completed={false}
          finalScore={score}
          finalMaxScore={maxScore}
          showHomeLink={false}
        />
      </div>
    );
  }

  if (mode === "lesson_quiz") {
    return (
      <QuizPlayer
        questions={lessonQuizQuestions}
        quizTitle={lessonQuizTitle}
        onSubmitAnswer={handleQuizAnswer}
        skipQuestionIds={answeredIds}
        initialScore={score}
        completed={false}
        finalScore={score}
        finalMaxScore={maxScore}
        showHomeLink={false}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <LearnerHeader courseTitle={courseTitle} invitedBy={invitedBy} />

      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-6 sm:gap-6 sm:px-6 sm:py-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-72">
          <Card className="lg:sticky lg:top-20 !p-4 sm:!p-5">
            {invitedBy && (
              <p className="mb-3 rounded-md bg-[var(--primary-muted)] px-3 py-2.5 text-sm text-[var(--primary)]">
                Invited by <span className="font-medium">{invitedBy.name}</span>
              </p>
            )}
            <h1 className="text-lg font-semibold text-gray-900 sm:text-xl">{courseTitle}</h1>
            {courseDescription && (
              <p className="mt-1.5 text-sm text-gray-600 line-clamp-3 sm:text-base">{courseDescription}</p>
            )}

            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-sm text-gray-500">
                <span>Progress</span>
                <span className="tabular-nums">
                  {completedIds.length}/{lessons.length}
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <nav className="mt-5 max-h-[50vh] space-y-0.5 overflow-y-auto">
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
                    className={`flex w-full min-h-11 items-center gap-2.5 rounded-md px-3 py-2.5 text-left text-base transition-colors ${
                      active
                        ? "bg-[var(--primary-muted)] font-medium text-[var(--primary)]"
                        : locked
                          ? "cursor-not-allowed text-gray-300"
                          : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                        done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {done ? "✓" : idx + 1}
                    </span>
                    <span className="truncate">{lesson.title}</span>
                  </button>
                );
              })}
            </nav>
          </Card>
        </aside>

        <div className="min-w-0 flex-1">
          <Card>
            {currentLesson ? (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-wide text-gray-400 sm:text-base">
                      Lesson {currentLessonIdx + 1} of {lessons.length}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-gray-900 sm:text-2xl">{currentLesson.title}</h2>
                  </div>
                  {isLessonFullyDone && <Badge variant="success">Completed</Badge>}
                  {isContentDone && !isLessonFullyDone && (
                    <Badge variant="primary">Assessment pending</Badge>
                  )}
                </div>

                <LessonViewer lesson={currentLesson} />

                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100 pt-6">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentLessonIdx === 0}
                    onClick={() => setCurrentLessonIdx((i) => i - 1)}
                  >
                    Previous
                  </Button>

                  <div className="flex gap-3">
                    {!isContentDone && !isLessonFullyDone && (
                      <Button onClick={handleCompleteLesson} disabled={marking}>
                        {marking ? "Saving..." : "Complete & take assessment"}
                      </Button>
                    )}
                    {isContentDone && !isLessonFullyDone && (
                      <Button onClick={() => setMode("lesson_quiz")}>Continue assessment</Button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-500">No lessons in this course.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
