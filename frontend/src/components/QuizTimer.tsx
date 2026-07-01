"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_TIME_LIMIT } from "@/types/quiz";

interface QuizTimerProps {
  seconds: number;
  running: boolean;
  onExpire: () => void;
  resetKey: number;
  gamified?: boolean;
}

export function QuizTimer({ seconds, running, onExpire, resetKey, gamified = false }: QuizTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const expiredRef = useRef(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    expiredRef.current = false;
    setTimeLeft(seconds);
  }, [seconds, resetKey]);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          if (!expiredRef.current) {
            expiredRef.current = true;
            onExpireRef.current();
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running, resetKey]);

  const limit = seconds || DEFAULT_TIME_LIMIT;
  const progress = (timeLeft / limit) * 100;
  const isLow = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  const ringColor = isCritical ? "text-red-500" : isLow ? "text-amber-500" : "text-[var(--primary)]";
  const textColor = isCritical ? "text-red-600" : isLow ? "text-amber-600" : "text-slate-900";
  const borderColor = isCritical
    ? "border-red-300"
    : isLow
      ? "border-amber-300"
      : "border-slate-200";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`relative flex h-14 w-14 items-center justify-center rounded-full border-2 bg-white ${borderColor} ${isCritical ? "animate-pulse" : ""} ${gamified ? "border-[3px] border-[#c4b5fd] shadow-[0_3px_0_#a78bfa]" : ""}`}
      >
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="none" stroke="#e2e8f0" strokeWidth="3" />
          <circle
            cx="32"
            cy="32"
            r="28"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeDasharray={`${2 * Math.PI * 28}`}
            strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
            strokeLinecap="round"
            className={ringColor}
          />
        </svg>
        <span className={`text-lg font-bold ${textColor} ${gamified ? "game-font" : ""}`}>{timeLeft}</span>
      </div>
      <span className={`text-xs font-medium ${gamified ? "game-font font-semibold text-[var(--kid-muted)]" : "text-slate-400"}`}>
        {gamified ? "⏱️ Time" : "Time left"}
      </span>
    </div>
  );
}
