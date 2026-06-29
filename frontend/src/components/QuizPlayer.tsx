"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { QuestionCard } from "@/components/QuestionCard";
import { QuizTimer } from "@/components/QuizTimer";
import { AnswerResult, DEFAULT_TIME_LIMIT, getMaxScore, PlayQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const ADVANCE_DELAY_MS = 1500;

interface QuizPlayerProps {
  questions: PlayQuestion[];
  quizTitle?: string;
  onSubmitAnswer?: (
    questionId: string,
    selectedIndex: number | null,
  ) => Promise<AnswerResult>;
  skipQuestionIds?: string[];
  initialScore?: number;
  completed?: boolean;
  finalScore?: number;
  finalMaxScore?: number;
  showHomeLink?: boolean;
  playAgainHref?: string;
}

function ScoreRing({ percentage }: { percentage: number }) {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color =
    percentage >= 80 ? "var(--success)" : percentage >= 50 ? "var(--primary)" : "var(--warning)";

  return (
    <div className="relative mx-auto h-32 w-32">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-semibold tabular-nums text-gray-900">{percentage}%</span>
      </div>
    </div>
  );
}

export function QuizPlayer({
  questions,
  quizTitle,
  onSubmitAnswer,
  skipQuestionIds = [],
  initialScore = 0,
  completed = false,
  finalScore,
  finalMaxScore,
  showHomeLink = true,
  playAgainHref,
}: QuizPlayerProps) {
  const playable = questions.filter((q) => !skipQuestionIds.includes(q.id));
  const maxScore = finalMaxScore ?? getMaxScore(questions);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [revealedCorrectIndex, setRevealedCorrectIndex] = useState<number | null>(null);
  const [score, setScore] = useState(initialScore);
  const [gameOver, setGameOver] = useState(completed);
  const [timedOut, setTimedOut] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const question = playable[currentIndex];
  const timeLimit = question?.timeLimit ?? DEFAULT_TIME_LIMIT;
  const isRemote = Boolean(onSubmitAnswer);

  const finishQuiz = useCallback((final: number) => {
    setScore(final);
    setGameOver(true);
  }, []);

  const goToNext = useCallback(
    (nextScore?: number, done?: boolean) => {
      if (done || currentIndex >= playable.length - 1) {
        finishQuiz(nextScore ?? score);
        return;
      }
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setRevealedCorrectIndex(null);
      setTimedOut(false);
    },
    [currentIndex, playable.length, finishQuiz, score],
  );

  const submitAnswer = useCallback(
    async (option: number | null, fromTimeout = false) => {
      if (isAnswered || submitting || !question) return;

      setSubmitting(true);
      setIsAnswered(true);
      setTimedOut(fromTimeout);
      if (option !== null) setSelectedOption(option);

      if (isRemote && onSubmitAnswer) {
        try {
          const result = await onSubmitAnswer(question.id, option);
          setRevealedCorrectIndex(result.correctIndex);
          setScore(result.score);
          setTimeout(() => goToNext(result.score, result.completed), ADVANCE_DELAY_MS);
        } catch {
          setIsAnswered(false);
          setTimedOut(false);
          setSelectedOption(null);
        } finally {
          setSubmitting(false);
        }
        return;
      }

      setSubmitting(false);

      if (question.correctIndex !== undefined) {
        const correct = option === question.correctIndex;
        const newScore = correct ? score + question.points : score;
        if (correct) setScore(newScore);
        setRevealedCorrectIndex(question.correctIndex);
        const isLast = currentIndex >= playable.length - 1;
        setTimeout(() => goToNext(newScore, isLast), ADVANCE_DELAY_MS);
      }
    },
    [isAnswered, submitting, question, isRemote, onSubmitAnswer, goToNext, currentIndex, playable.length, score],
  );

  const handleSelect = (index: number) => {
    if (isAnswered || submitting) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (selectedOption === null || isAnswered) return;
    submitAnswer(selectedOption);
  };

  const handleTimeout = useCallback(() => {
    submitAnswer(null, true);
  }, [submitAnswer]);

  if (gameOver) {
    const displayScore = finalScore ?? score;
    const displayMax = finalMaxScore ?? maxScore;
    const percentage = displayMax > 0 ? Math.round((displayScore / displayMax) * 100) : 0;
    const passed = percentage >= 50;

    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--background)] px-4 py-12">
        <Card className="animate-fade-in w-full max-w-lg text-center">
          <Badge variant={passed ? "success" : "warning"} className="mb-4">
            {passed ? "Assessment passed" : "Assessment complete"}
          </Badge>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">Results</h1>
          {quizTitle && <p className="mt-2 text-sm text-gray-500">{quizTitle}</p>}

          <div className="my-8">
            <ScoreRing percentage={percentage} />
          </div>

          <p className="text-3xl font-semibold tabular-nums text-gray-900">
            {displayScore}
            <span className="text-lg font-normal text-gray-400"> / {displayMax} points</span>
          </p>
          <p className="mt-3 text-sm text-gray-600">
            {percentage >= 80
              ? "Excellent performance. You demonstrated strong mastery of the material."
              : percentage >= 50
                ? "Satisfactory result. Review any missed topics to reinforce your understanding."
                : "Consider revisiting the course material before retaking the assessment."}
          </p>

          {playAgainHref && (
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href={playAgainHref}>
                <Button>Retake assessment</Button>
              </Link>
              {showHomeLink && (
                <Link href="/">
                  <Button variant="secondary">Return home</Button>
                </Link>
              )}
            </div>
          )}
        </Card>
      </main>
    );
  }

  if (!question) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <p className="text-sm text-gray-500">No questions available.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {quizTitle && (
          <h1 className="mb-6 text-xl font-semibold tracking-tight text-gray-900">{quizTitle}</h1>
        )}

        <Card>
          <header className="mb-8 flex items-center justify-between border-b border-gray-100 pb-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Score</p>
              <p className="text-2xl font-semibold tabular-nums text-gray-900">{score} pts</p>
            </div>

            <QuizTimer
              key={`${question.id}-${currentIndex}`}
              seconds={timeLimit}
              running={!isAnswered && !submitting}
              onExpire={handleTimeout}
              resetKey={currentIndex}
            />

            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Progress</p>
              <p className="text-2xl font-semibold tabular-nums text-gray-900">
                {currentIndex + 1}/{playable.length}
              </p>
            </div>
          </header>

          <QuestionCard
            question={question}
            questionNumber={currentIndex + 1}
            totalQuestions={playable.length}
            selectedOption={selectedOption}
            isAnswered={isAnswered}
            correctIndex={revealedCorrectIndex}
            onSelect={handleSelect}
          />

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-gray-100 pt-6">
            {!isAnswered && (
              <Button
                onClick={handleSubmit}
                disabled={selectedOption === null || submitting}
                className="min-w-[160px]"
              >
                {submitting ? "Submitting..." : "Submit answer"}
              </Button>
            )}
            {isAnswered && (
              <p className="text-sm font-medium text-gray-600">
                {timedOut
                  ? "Time expired."
                  : revealedCorrectIndex !== null
                    ? selectedOption === revealedCorrectIndex
                      ? `Correct — +${question.points} points`
                      : "Incorrect."
                    : "Answer recorded."}
              </p>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
