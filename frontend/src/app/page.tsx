import Link from "next/link";
import { MarketingHeader } from "@/components/layout/MarketingHeader";
import { Button } from "@/components/ui/Button";
import { BrandName } from "@/components/BrandName";

const features = [
  {
    title: "Multimedia lessons",
    description:
      "Combine text, video, audio, and image content in a structured learning path.",
  },
  {
    title: "Built-in assessments",
    description:
      "Configurable timed quizzes with scoring, delivered after course completion.",
  },
  {
    title: "Role-based access",
    description:
      "Super administrators manage teams; course admins create content and invite learners.",
  },
  {
    title: "Invite-based delivery",
    description:
      "Send secure, unique links to learners. Track progress and completion centrally.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <MarketingHeader />

      <main>
        <section className="hero-ginger-pop border-b border-[var(--border)]">
          <div className="page-shell py-14 sm:py-20 md:py-24">
            <div className="mx-auto max-w-3xl text-center animate-fade-in">
              <div className="mb-5 inline-flex items-center rounded-full border border-[var(--primary)]/20 bg-[var(--primary-muted)] px-4 py-1.5 text-sm font-medium text-[var(--primary)]">
                Enterprise learning platform
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl md:text-5xl md:leading-tight">
                Deliver training that{" "}
                <span className="text-[var(--primary)]">sticks</span>.
                <span className="mt-3 block text-2xl font-normal text-[var(--accent)] sm:text-3xl md:text-4xl">
                  Courses, lessons, and assessments in one place.
                </span>
              </h1>
              <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
                Ginger Pop helps organizations build structured courses, invite learners by email,
                and measure outcomes with timed final quizzes.
              </p>
              <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
                <Link href="/admin/login" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Open admin console
                  </Button>
                </Link>
                <Link href="/play" className="w-full sm:w-auto">
                  <Button variant="accent" size="lg" className="w-full sm:w-auto">
                    View demo assessment
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="page-shell py-14 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Everything you need to run a training program
            </h2>
            <p className="mt-2 text-base text-gray-600 sm:text-lg">
              From content authoring to learner delivery — without switching tools.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            {features.map((f) => (
              <article
                key={f.title}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md sm:p-6"
              >
                <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{f.title}</h3>
                <p className="mt-2 text-base leading-relaxed text-gray-600">{f.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white">
          <div className="page-shell py-12 text-center sm:py-16">
            <h2 className="text-xl font-semibold text-gray-900 sm:text-2xl">Ready to get started?</h2>
            <p className="mt-2 text-base text-gray-600">
              Sign in to the admin console to create your first course.
            </p>
            <Link href="/admin/login" className="mt-6 inline-block w-full sm:w-auto">
              <Button className="w-full sm:w-auto">Sign in to admin console</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-8">
        <div className="page-shell flex flex-col items-center justify-between gap-4 text-base text-gray-500 sm:flex-row">
          <span className="font-medium text-gray-700">
            <BrandName />
          </span>
          <span>© {new Date().getFullYear()} Ginger Pop. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
