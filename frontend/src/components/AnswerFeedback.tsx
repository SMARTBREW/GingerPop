"use client";

import { cn } from "@/lib/cn";

interface AnswerFeedbackProps {
  type: "correct" | "wrong";
  points?: number;
  visible: boolean;
  exiting?: boolean;
  gamified?: boolean;
}

export function AnswerFeedback({ type, points, visible, exiting, gamified = false }: AnswerFeedbackProps) {
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
          gamified && "rounded-3xl border-[3px] shadow-[0_6px_0_rgba(45,27,78,0.12)]",
          isCorrect
            ? gamified
              ? "border-[#86efac] bg-gradient-to-r from-[#ecfdf5] to-[#d1fae5]"
              : "border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white"
            : gamified
              ? "border-[#fca5a5] bg-gradient-to-r from-[#fef2f2] to-[#fecaca]"
              : "border border-red-200 bg-gradient-to-r from-red-50 to-white",
        )}
      >
        <div
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl",
            isCorrect ? "bg-emerald-100 animate-celebrate-pop" : "bg-red-100",
            gamified && "h-14 w-14 text-2xl",
          )}
        >
          {isCorrect ? (gamified ? "🌟" : "🎉") : gamified ? "😅" : "✕"}
        </div>
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              gamified ? "game-font text-xl font-bold" : "text-lg font-semibold",
              isCorrect ? "text-emerald-800" : "text-red-800",
            )}
          >
            {isCorrect
              ? gamified
                ? "You got it!"
                : "Congratulations!"
              : gamified
                ? "Oops, not quite!"
                : "Incorrect"}
          </p>
          <p className={cn("text-sm", isCorrect ? "text-emerald-700" : "text-red-600", gamified && "text-base font-semibold")}>
            {isCorrect
              ? points
                ? gamified
                  ? `+${points} stars collected!`
                  : `Great job — +${points} points`
                : gamified
                  ? "That's the right answer!"
                  : "Great job — that's the right answer!"
              : gamified
                ? "Keep going — you've got this!"
                : "That wasn't the right answer. Keep going!"}
          </p>
        </div>
      </div>
    </div>
  );
}
