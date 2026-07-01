import Link from "next/link";
import { KidMarketingHeader } from "@/components/layout/KidMarketingHeader";
import { KidZone } from "@/components/layout/KidZone";
import { BrandName } from "@/components/BrandName";

const steps = [
  {
    icon: "📧",
    title: "Get your link",
    description: "Your teacher sends a special quest link to your email. Tap it to start!",
  },
  {
    icon: "🎮",
    title: "Play the quiz",
    description: "Read fun questions, pick your answers, and beat the timer if there is one!",
  },
  {
    icon: "⭐",
    title: "Earn stars",
    description: "Answer correctly to collect stars. Finish the quest and see your score!",
  },
];

export default function HomePage() {
  return (
    <KidZone className="relative overflow-hidden">
      <div
        className="kid-blob -left-16 top-24 h-40 w-40 bg-[var(--kid-sun)]"
        aria-hidden
      />
      <div
        className="kid-blob right-0 top-8 h-32 w-32 bg-[var(--kid-purple)]"
        aria-hidden
      />
      <div
        className="kid-blob bottom-32 left-1/4 h-28 w-28 bg-[var(--kid-grass)]"
        aria-hidden
      />

      <KidMarketingHeader />

      <main className="relative">
        <section className="page-shell py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <span className="kid-pill border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">
              <span className="game-sparkle">✨</span> Learning adventures for kids
            </span>

            <h1 className="game-font mt-6 text-4xl font-bold leading-tight text-[var(--kid-text)] sm:text-5xl md:text-6xl">
              Learn. Play.
              <span className="mt-1 block bg-gradient-to-r from-[var(--kid-orange)] to-[var(--kid-pink)] bg-clip-text text-transparent">
                Level up!
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[var(--kid-muted)] sm:text-xl">
              <BrandName /> turns quizzes into mini games. Open the link from your email and
              start your quest — no sign-up needed!
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/play" className="kid-btn-primary w-full sm:w-auto">
                Try a practice quest
              </Link>
              <p className="max-w-xs text-center text-sm font-semibold text-[var(--kid-muted)] sm:text-left">
                Got an email invite? Tap that link to begin your real quest!
              </p>
            </div>

            <div className="game-float mx-auto mt-10 inline-block text-7xl sm:text-8xl" aria-hidden>
              🏆
            </div>
          </div>
        </section>

        <section className="page-shell pb-16 sm:pb-20">
          <h2 className="game-font mb-8 text-center text-2xl font-bold text-[var(--kid-text)] sm:text-3xl">
            How your quest works
          </h2>
          <div className="grid gap-5 sm:grid-cols-3 sm:gap-6">
            {steps.map((step, i) => (
              <article key={step.title} className="kid-step-card">
                <div className="kid-step-icon">{step.icon}</div>
                <span className="kid-pill mb-2 bg-[#ede9fe] text-[#6d28d9]">Step {i + 1}</span>
                <h3 className="game-font text-lg font-semibold text-[var(--kid-text)]">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--kid-muted)]">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="page-shell pb-16">
          <div className="kid-card mx-auto max-w-2xl p-8 text-center sm:p-10">
            <p className="text-4xl" aria-hidden>
              🌟🎯🚀
            </p>
            <h2 className="game-font mt-4 text-2xl font-bold text-[var(--kid-text)]">
              Ready to play?
            </h2>
            <p className="mt-2 text-[var(--kid-muted)]">
              Check your inbox for your quest link, or try a practice round first.
            </p>
            <Link href="/play" className="kid-btn-secondary mt-6 inline-flex">
              Start practice quest
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-white/50 bg-white/40 py-6">
        <div className="page-shell flex flex-col items-center justify-between gap-3 text-sm text-[var(--kid-muted)] sm:flex-row">
          <span className="game-font font-semibold text-[var(--kid-text)]">
            <BrandName />
          </span>
          <div className="flex items-center gap-4">
            <Link href="/admin/login" className="font-semibold hover:text-[var(--kid-text)]">
              Teachers sign in
            </Link>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </KidZone>
  );
}
