"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { SUBJECT_CATALOG } from "@/data/subject-catalog";
import { KidZone } from "@/components/layout/KidZone";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader, SiteHeaderLink } from "@/components/layout/SiteHeader";

interface CatalogSubtopic {
  id: string;
  title: string;
  description?: string;
  emoji?: string;
  lessonId?: string;
}

interface CatalogTopic {
  id: string;
  title: string;
  emoji?: string;
  description?: string;
  subtopics: CatalogSubtopic[];
}

interface CatalogSubject {
  id: string;
  courseId: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  accent: string;
  topics: CatalogTopic[];
}

type Level = "subjects" | "topics" | "subtopics";

function previewCatalog(): CatalogSubject[] {
  return SUBJECT_CATALOG.map((subject) => ({
    ...subject,
    courseId: `preview-${subject.id}`,
    topics: subject.topics.map((topic) => ({
      ...topic,
      subtopics: topic.subtopics.map((sub) => ({ ...sub })),
    })),
  }));
}

export default function SubjectsPage() {
  /** Static demo catalog only — no API (preview Maths / Science / English). */
  const catalog = useMemo(() => previewCatalog(), []);
  const [level, setLevel] = useState<Level>("subjects");
  const [subject, setSubject] = useState<CatalogSubject | null>(null);
  const [topic, setTopic] = useState<CatalogTopic | null>(null);

  const breadcrumb = useMemo(() => {
    const bits: { label: string; onClick?: () => void }[] = [
      {
        label: "Subjects",
        onClick: () => {
          setLevel("subjects");
          setSubject(null);
          setTopic(null);
        },
      },
    ];
    if (subject) {
      bits.push({
        label: subject.title,
        onClick: () => {
          setLevel("topics");
          setTopic(null);
        },
      });
    }
    if (topic) {
      bits.push({ label: topic.title });
    }
    return bits;
  }, [subject, topic]);

  const openSubject = (s: CatalogSubject) => {
    setSubject(s);
    setTopic(null);
    setLevel("topics");
  };

  const openTopic = (t: CatalogTopic) => {
    setTopic(t);
    setLevel("subtopics");
  };

  return (
    <KidZone className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="kid-blob -left-16 top-20 h-40 w-40 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob right-0 top-10 h-32 w-32 bg-[var(--kid-purple)]" aria-hidden />

      <SiteHeader actions={<SiteHeaderLink href="/">← Home</SiteHeaderLink>} />

      <main className="page-shell relative flex-1 py-8 sm:py-12">
        <div className="mb-6">
          <p className="kid-pill mb-3 border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">
            📖 Choose your adventure
          </p>
          <p className="mb-3 text-sm font-semibold text-[var(--kid-muted)]">
            Demo preview — sample subjects, chapters, and built-in Maths lessons.
          </p>
          <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">
            {level === "subjects" && "Pick a subject"}
            {level === "topics" && `${subject?.emoji ?? ""} ${subject?.title} chapters`}
            {level === "subtopics" && `${topic?.emoji ?? ""} ${topic?.title}`}
          </h1>
          <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
            {level === "subjects" && "Just like your school books — subject, then chapter, then lesson."}
            {level === "topics" && "Open a chapter to see the lessons inside."}
            {level === "subtopics" && "Tap a lesson to start learning and play the quiz."}
          </p>
        </div>

        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--kid-muted)]">
          {breadcrumb.map((crumb, i) => (
            <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-2">
              {i > 0 && <span aria-hidden>›</span>}
              {crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="rounded-lg px-1.5 py-0.5 text-[var(--kid-purple)] hover:bg-white/70"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-[var(--kid-text)]">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        {level === "subjects" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {catalog.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => openSubject(s)}
                className="kid-card group p-6 text-left transition-transform hover:-translate-y-1"
                style={{ background: s.color }}
              >
                <span className="text-4xl" aria-hidden>
                  {s.emoji}
                </span>
                <h2 className="game-font mt-3 text-2xl font-bold" style={{ color: s.accent }}>
                  {s.title}
                </h2>
                <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">{s.description}</p>
                <p className="mt-4 text-sm font-extrabold" style={{ color: s.accent }}>
                  {s.topics.length} chapter{s.topics.length === 1 ? "" : "s"} →
                </p>
              </button>
            ))}
          </div>
        )}

        {level === "topics" && subject && (
          <div className="grid gap-4 sm:grid-cols-2">
            {subject.topics.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => openTopic(t)}
                className="kid-card p-5 text-left transition-transform hover:-translate-y-1"
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl" aria-hidden>
                    {t.emoji}
                  </span>
                  <div>
                    <h2 className="game-font text-xl font-bold text-[var(--kid-text)]">{t.title}</h2>
                    {t.description && (
                      <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">{t.description}</p>
                    )}
                    <p className="mt-3 text-sm font-extrabold text-[var(--kid-purple)]">
                      {t.subtopics.length} lesson{t.subtopics.length === 1 ? "" : "s"} →
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {level === "subtopics" && subject && topic && (
          <div className="grid gap-4 sm:grid-cols-2">
            {topic.subtopics.map((sub) => {
              const ready = Boolean(sub.lessonId);
              const card = (
                <div
                  className={`kid-card p-5 ${ready ? "transition-transform hover:-translate-y-1" : "opacity-75"}`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl" aria-hidden>
                      {sub.emoji ?? "📘"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="game-font text-xl font-bold text-[var(--kid-text)]">{sub.title}</h2>
                        {!ready && (
                          <span className="kid-pill bg-[#fef3c7] text-[#92400e]">Soon</span>
                        )}
                      </div>
                      {sub.description && (
                        <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                          {sub.description}
                        </p>
                      )}
                      <p
                        className="mt-3 text-sm font-extrabold"
                        style={{ color: ready ? subject.accent : "#9ca3af" }}
                      >
                        {ready ? "Start lesson →" : "Coming soon"}
                      </p>
                    </div>
                  </div>
                </div>
              );

              if (!ready || !sub.lessonId) {
                return (
                  <div key={sub.id} aria-disabled>
                    {card}
                  </div>
                );
              }

              return (
                <Link
                  key={sub.id}
                  href={`/play?lesson=${encodeURIComponent(sub.lessonId)}`}
                  className="block no-underline"
                >
                  {card}
                </Link>
              );
            })}
          </div>
        )}

        {level !== "subjects" && (
          <button
            type="button"
            onClick={() => {
              if (level === "subtopics") {
                setTopic(null);
                setLevel("topics");
              } else {
                setSubject(null);
                setTopic(null);
                setLevel("subjects");
              }
            }}
            className="kid-btn-secondary mt-8 !px-5 !py-2.5 !text-sm"
          >
            ← Back
          </button>
        )}
      </main>

      <SiteFooter />
    </KidZone>
  );
}
