"use client";

import { cn } from "@/lib/cn";

interface AnswerFeedbackProps {
  type: "correct" | "wrong";
  points?: number;
  visible: boolean;
  exiting?: boolean;
}

export function AnswerFeedback({ type, points, visible, exiting }: AnswerFeedbackProps) {
  if (!visible) return null;

  const isCorrect = type === "correct";

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center px-4 pb-6 sm:pb-8",
        exiting
          ? "answer-feedback-exit"
          : isCorrect
            ? "answer-feedback-rise"
            : "answer-feedback-wrong-rise",
      )}
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          "flex w-full max-w-md items-center gap-4 rounded-2xl px-5 py-4 shadow-lg",
          isCorrect
            ? "border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white"
            : "border border-red-200 bg-gradient-to-r from-red-50 to-white",
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl",
            isCorrect ? "bg-emerald-100 animate-celebrate-pop" : "bg-red-100",
          )}
        >
          {isCorrect ? "🎉" : "✕"}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-lg font-semibold",
              isCorrect ? "text-emerald-800" : "text-red-800",
            )}
          >
            {isCorrect ? "Congratulations!" : "Incorrect"}
          </p>
          <p className={cn("text-sm", isCorrect ? "text-emerald-700" : "text-red-600")}>
            {isCorrect
              ? points
                ? `Great job — +${points} points`
                : "Great job — that's the right answer!"
              : "That wasn't the right answer. Keep going!"}
          </p>
        </div>
      </div>
    </div>
  );
}
