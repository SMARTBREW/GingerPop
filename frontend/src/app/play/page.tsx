"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MascotQuizPlayer } from "@/components/MascotQuizPlayer";

function PlayPageInner() {
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson") ?? undefined;
  return <MascotQuizPlayer initialLessonId={lessonId} />;
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] text-lg font-bold text-[#6b5b8a]">
          Loading your quest…
        </div>
      }
    >
      <PlayPageInner />
    </Suspense>
  );
}
