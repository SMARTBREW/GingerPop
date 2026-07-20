"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { KidZone } from "@/components/layout/KidZone";

/** Legacy route — password setup is now a modal on the student dashboard. */
function RedirectToDashboard() {
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/student/dashboard";

  useEffect(() => {
    const safeNext =
      nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/student/dashboard";
    if (safeNext === "/student/dashboard") {
      window.location.replace("/student/dashboard");
    } else {
      window.location.replace(
        `/student/dashboard?next=${encodeURIComponent(safeNext)}`,
      );
    }
  }, [nextPath]);

  return (
    <KidZone className="flex min-h-screen items-center justify-center game-font text-lg font-bold text-[var(--kid-muted)]">
      Opening dashboard…
    </KidZone>
  );
}

export default function StudentSetPasswordPage() {
  return (
    <Suspense
      fallback={
        <KidZone className="flex min-h-screen items-center justify-center game-font text-lg font-bold text-[var(--kid-muted)]">
          Loading…
        </KidZone>
      }
    >
      <RedirectToDashboard />
    </Suspense>
  );
}
