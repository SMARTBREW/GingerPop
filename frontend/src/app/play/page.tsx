"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MascotQuizPlayer } from "@/components/MascotQuizPlayer";

function PlayPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonId = searchParams.get("lesson") ?? undefined;

  useEffect(() => {
    if (!lessonId) router.replace("/subjects");
  }, [lessonId, router]);

  if (!lessonId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#fff8f0] text-lg font-bold text-[#6b5b8a]">
        Loading your quest…
      </div>
    );
  }

  return <MascotQuizPlayer initialLessonId={lessonId} staticDemo />;
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
