import Link from "next/link";
import { KidZone } from "@/components/layout/KidZone";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader, SiteHeaderLink } from "@/components/layout/SiteHeader";

export default function LoginChooserPage() {
  return (
    <KidZone className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="kid-blob -left-16 top-24 h-40 w-40 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob right-4 top-16 h-32 w-32 bg-[var(--kid-purple)]" aria-hidden />

      <SiteHeader actions={<SiteHeaderLink href="/">← Home</SiteHeaderLink>} />

      <main className="page-shell relative flex flex-1 flex-col items-center py-12 sm:py-16">
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

      <SiteFooter />
    </KidZone>
  );
}
