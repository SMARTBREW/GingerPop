import Link from "next/link";
import { BrandName } from "@/components/BrandName";
import { KidZone } from "@/components/layout/KidZone";

export default function LoginChooserPage() {
  return (
    <KidZone className="relative min-h-screen overflow-hidden">
      <div className="kid-blob -left-16 top-24 h-40 w-40 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob right-4 top-16 h-32 w-32 bg-[var(--kid-purple)]" aria-hidden />

      <header className="sticky top-0 z-40 border-b-2 border-white/60 bg-white/75 backdrop-blur-md">
        <div className="page-shell flex h-16 items-center justify-between sm:h-[4.5rem]">
          <Link href="/" className="game-font text-2xl font-bold text-[var(--kid-text)]">
            <BrandName />
          </Link>
          <Link
            href="/"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--kid-muted)] hover:bg-white/80"
          >
            ← Home
          </Link>
        </div>
      </header>

      <main className="page-shell relative flex flex-col items-center py-12 sm:py-16">
        <span className="kid-pill mb-4 border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">
          👋 Welcome back
        </span>
        <h1 className="game-font text-center text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">
          Sign in
        </h1>
        <p className="mt-2 max-w-md text-center text-base font-semibold text-[var(--kid-muted)]">
          Choose how you want to continue
        </p>

        <div className="mt-10 grid w-full max-w-2xl gap-5 sm:grid-cols-2">
          <Link
            href="/login/student"
            className="kid-card group block p-7 no-underline transition-transform hover:-translate-y-1"
            style={{ background: "linear-gradient(160deg, #f0fdf4, #dcfce7)" }}
          >
            <span className="text-4xl" aria-hidden>
              🎒
            </span>
            <h2 className="game-font mt-3 text-2xl font-bold text-[#166534]">Student login</h2>
            <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
              Open your quests, lessons, and invited courses.
            </p>
            <p className="mt-5 text-sm font-extrabold text-[#16a34a]">Continue as student →</p>
          </Link>

          <Link
            href="/login/teacher"
            className="kid-card group block p-7 no-underline transition-transform hover:-translate-y-1"
            style={{ background: "linear-gradient(160deg, #fff7ed, #ffedd5)" }}
          >
            <span className="text-4xl" aria-hidden>
              👩‍🏫
            </span>
            <h2 className="game-font mt-3 text-2xl font-bold text-[#c2410c]">Teacher login</h2>
            <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
              Create courses, invite learners, and manage quizzes.
            </p>
            <p className="mt-5 text-sm font-extrabold text-[#ea580c]">Continue as teacher →</p>
          </Link>
        </div>
      </main>
    </KidZone>
  );
}
