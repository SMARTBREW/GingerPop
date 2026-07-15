"use client";

import { useMemo, useState } from "react";
import {
  CourseQuizQuestion,
  EMPTY_LESSON,
  EMPTY_LESSON_PAGE,
  EMPTY_QUIZ_QUESTION,
  Lesson,
  LessonPage,
} from "@/types/course";
import { MediaUploader } from "@/components/media/MediaUploader";
import { getLessonQuestions } from "@/lib/course-rules";
import "@/styles/mascot-quiz.css";

type LessonRow = Lesson & { id: string };
type QuestionRow = CourseQuizQuestion & { id: string };
type View = "topics" | "lessons" | "play" | "quiz";

const OPTION_LABELS = ["A", "B", "C"] as const;

interface SubjectMeta {
  emoji: string;
  color: string;
  accent: string;
  slug: string;
}

interface SubjectContentEditorProps {
  subjectTitle: string;
  subjectDescription: string;
  meta: SubjectMeta;
  onMetaChange: (meta: SubjectMeta) => void;
  lessons: LessonRow[];
  quizQuestions: QuestionRow[];
  onLessonsChange: (lessons: LessonRow[]) => void;
  onQuestionsChange: (questions: QuestionRow[]) => void;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, "");
}

/** For display only — never use while editing (trim eats spaces between words). */
function plainPreview(html: string) {
  return stripHtml(html).replace(/\s+/g, " ").trim();
}

function topicKey(lesson: LessonRow) {
  return (lesson.topicTitle || "Numbers").trim() || "Numbers";
}

function Editable({
  value,
  onChange,
  className = "",
  placeholder,
  multiline,
  rows = 3,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
  style?: React.CSSProperties;
}) {
  const shared =
    "w-full bg-white outline-none placeholder:opacity-50 focus:ring-2 focus:ring-[#fdba74] rounded-xl border-2 border-[#e9d5ff] px-3 py-2";
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          const el = e.target;
          el.style.height = "auto";
          el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
        }}
        onInput={(e) => {
          const el = e.currentTarget;
          el.style.height = "auto";
          el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
        }}
        placeholder={placeholder}
        rows={rows}
        className={`${shared} resize-y ${className}`}
        style={{ minHeight: 160, ...style }}
      />
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${shared} ${className}`}
      style={style}
    />
  );
}

function QuizCardEditor({
  q,
  idx,
  total,
  onChange,
  onRemove,
}: {
  q: QuestionRow;
  idx: number;
  total: number;
  onChange: (updated: QuestionRow) => void;
  onRemove: () => void;
}) {
  const emojis = q.optionEmojis ?? ["🐊", "🐊", "😐", ""];

  return (
    <div className="kid-card mx-auto w-full max-w-2xl p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="kid-pill border border-[#fde68a] bg-[#fef9c3] text-[#92400e]">
          Q{idx + 1} OF {total}
        </span>
        <button type="button" onClick={onRemove} className="text-sm font-extrabold text-red-600">
          Delete
        </button>
      </div>

      <Editable
        value={stripHtml(q.question)}
        onChange={(question) => onChange({ ...q, question })}
        placeholder="Fill in the blank: 64 ___ 89"
        className="game-font text-2xl font-bold text-[var(--kid-text)] sm:text-3xl"
      />
      <Editable
        value={q.subtitle ?? ""}
        onChange={(subtitle) => onChange({ ...q, subtitle })}
        placeholder="Practice Question a"
        className="mt-2 text-base font-semibold text-[var(--kid-muted)]"
      />

      <div className="mt-4">
        <MediaUploader
          type="image"
          value={q.imageUrl || q.mediaUrl}
          onChange={(url) => onChange({ ...q, imageUrl: url, mediaUrl: url, type: "image" })}
          label="Question image (optional)"
        />
      </div>

      <div className="mt-6 space-y-3">
        {OPTION_LABELS.map((label, oIdx) => (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${
              q.correctIndex === oIdx
                ? "border-[#86efac] bg-[#f0fdf4]"
                : "border-gray-200 bg-white"
            }`}
          >
            <input
              value={emojis[oIdx] ?? ""}
              onChange={(e) => {
                const next = [...(q.optionEmojis ?? ["🐊", "🐊", "😐", ""])] as [
                  string,
                  string,
                  string,
                  string,
                ];
                next[oIdx] = e.target.value;
                onChange({ ...q, optionEmojis: next });
              }}
              className="w-12 rounded-lg border border-gray-200 bg-white px-1 py-1 text-center text-2xl"
              aria-label={`Emoji ${label}`}
            />
            <input
              value={stripHtml(q.options[oIdx] ?? "")}
              onChange={(e) => {
                const options = [...q.options] as [string, string, string, string];
                options[oIdx] = e.target.value;
                onChange({ ...q, options });
              }}
              placeholder={
                oIdx === 0 ? "< (Less Than)" : oIdx === 1 ? "> (Greater Than)" : "= (Equal To)"
              }
              className="flex-1 bg-transparent text-lg font-bold text-[var(--kid-text)] outline-none"
            />
            <button
              type="button"
              onClick={() => onChange({ ...q, correctIndex: oIdx })}
              className="shrink-0 text-xs font-extrabold text-[var(--kid-purple)]"
            >
              {q.correctIndex === oIdx ? "✓ Correct" : "Set correct"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="kid-pill mb-2 border border-[#fde68a] bg-[#fef9c3] text-[#92400e]">
            💡 hint
          </span>
          <Editable
            value={q.hint ?? ""}
            onChange={(hint) => onChange({ ...q, hint })}
            placeholder="89 is bigger than 64!"
            className="mt-2 rounded-xl border-2 border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm font-semibold"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-extrabold uppercase text-[var(--kid-muted)]">
            Correct / wrong explanations
          </span>
          <Editable
            value={q.explanation ?? ""}
            onChange={(explanation) => onChange({ ...q, explanation })}
            placeholder="Correct! 64 < 89"
            className="rounded-xl border-2 border-[#bbf7d0] bg-[#f0fdf4] px-3 py-2 text-sm font-semibold"
          />
          <Editable
            value={q.wrongExplanation ?? ""}
            onChange={(wrongExplanation) => onChange({ ...q, wrongExplanation })}
            placeholder="Oops — try again"
            className="mt-2 rounded-xl border-2 border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm font-semibold"
          />
        </label>
      </div>
    </div>
  );
}

function PlayLayoutEditor({
  lesson,
  pageIndex,
  onLessonChange,
  onPageIndex,
  onOpenQuiz,
}: {
  lesson: LessonRow;
  pageIndex: number;
  onLessonChange: (lesson: LessonRow) => void;
  onPageIndex: (idx: number) => void;
  onOpenQuiz: () => void;
}) {
  const pages = lesson.pages?.length ? lesson.pages : [{ ...EMPTY_LESSON_PAGE, title: "1. Topic" }];
  const page = pages[Math.min(pageIndex, pages.length - 1)] ?? pages[0];

  const updatePage = (patch: Partial<LessonPage>) => {
    const next = pages.map((p, i) => (i === pageIndex ? { ...p, ...patch } : p));
    onLessonChange({
      ...lesson,
      pages: next,
      content: next.map((p) => `${p.title}\n${p.content ?? ""}`).join("\n\n"),
      imageUrl: lesson.imageUrl || next[0]?.imageUrl,
      mediaUrl: lesson.imageUrl || next[0]?.imageUrl || lesson.mediaUrl,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--kid-muted)]">
        <span className="kid-pill bg-white text-[#c2410c]">
          LESSON · /play?lesson={lesson.slug || "…"}
        </span>
        <Editable
          value={lesson.slug ?? ""}
          onChange={(slug) => onLessonChange({ ...lesson, slug: slugify(slug) })}
          placeholder="comparing-numbers"
          className="max-w-[14rem] rounded-lg border border-[#fed7aa] bg-white px-2 py-1 text-xs"
        />
      </div>

      {/* Play card — same two-column layout as kid play page */}
      <div className="kid-card overflow-hidden p-4 sm:p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Left: title + image */}
          <div className="flex flex-col">
            <Editable
              value={lesson.title}
              onChange={(title) =>
                onLessonChange({
                  ...lesson,
                  title,
                  slug: lesson.slug || slugify(title),
                  badgeText: lesson.badgeText || title.toUpperCase(),
                })
              }
              placeholder="Comparing Numbers"
              className="game-font mb-3 text-2xl font-bold text-[var(--kid-text)] sm:text-3xl"
            />
            <div className="flex min-h-[220px] flex-1 flex-col rounded-2xl border-2 border-dashed border-[#fdba74] bg-[#fff7ed]/50 p-3">
              {(lesson.imageUrl || page.imageUrl || lesson.mediaUrl) && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={lesson.imageUrl || page.imageUrl || lesson.mediaUrl}
                  alt=""
                  className="mb-3 max-h-56 w-full rounded-xl object-contain"
                />
              )}
              <MediaUploader
                type="image"
                value={lesson.imageUrl || page.imageUrl || lesson.mediaUrl}
                onChange={(url) => {
                  onLessonChange({
                    ...lesson,
                    imageUrl: url,
                    mediaUrl: url,
                    type: "image",
                  });
                  updatePage({ imageUrl: url });
                }}
                label="Lesson image (left panel)"
              />
            </div>
            <p className="mt-3 text-sm font-extrabold text-[var(--kid-muted)]">
              Topic {pageIndex + 1} of {pages.length}
            </p>
          </div>

          {/* Right: badge, mascot speech, page text, audio */}
          <div className="flex flex-col">
            <Editable
              value={lesson.badgeText ?? ""}
              onChange={(badgeText) => onLessonChange({ ...lesson, badgeText })}
              placeholder="1. COMPARING NUMBERS"
              className="kid-pill mb-3 w-fit border-2 border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
            />

            <div className="mb-4 flex gap-3 rounded-2xl border-2 border-[#bbf7d0] bg-[#f0fdf4]/70 p-3">
              <span className="text-3xl" aria-hidden>
                🐸
              </span>
              <Editable
                value={lesson.mascotSpeech ?? ""}
                onChange={(mascotSpeech) => onLessonChange({ ...lesson, mascotSpeech })}
                placeholder="Hey there! Let's learn how to compare numbers…"
                multiline
                className="text-sm font-semibold leading-relaxed text-[var(--kid-text)]"
              />
            </div>

            <div className="mb-2">
              <p className="mb-1 text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">
                Heading (like “1. What is Compare in Maths?”)
              </p>
              <Editable
                value={page.title}
                onChange={(title) => updatePage({ title })}
                placeholder="1. What is Compare in Maths?"
                className="game-font text-xl font-bold text-[var(--kid-text)]"
              />
            </div>

            <div className="mb-4 flex min-h-[180px] flex-1 flex-col rounded-2xl border-2 border-[#e9d5ff] bg-[#faf5ff]/60 p-3">
              <p className="mb-1.5 text-xs font-extrabold uppercase tracking-wide text-[var(--kid-purple)]">
                Explanation / answer under the heading
              </p>
              <p className="mb-2 text-xs font-semibold text-[var(--kid-muted)]">
                Same paragraph kids see on play — e.g. “Compare karne ka matlab hota hai…”
              </p>
              <Editable
                value={stripHtml(page.content ?? "")}
                onChange={(content) => updatePage({ content })}
                placeholder="Compare karne ka matlab hota hai do ya zyada numbers ko dekhkar decide karna…"
                multiline
                rows={8}
                className="min-h-[160px] flex-1 text-base font-semibold leading-relaxed text-[var(--kid-muted)]"
              />
            </div>
            <div className="mt-auto rounded-2xl border-2 border-[#86efac] bg-[#ecfdf5] p-3">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#166534]">
                Audio for this explanation
              </p>
              <p className="mb-2 text-xs font-semibold text-[#166534]/80">
                Kids tap play under the answer text — upload audio or use TTS
              </p>
              <MediaUploader
                type="audio"
                value={page.audioUrl || lesson.audioUrl}
                onChange={(audioUrl) => updatePage({ audioUrl })}
                label="Upload lesson audio"
                onTranscript={(text) =>
                  updatePage({
                    audioText: `${page.audioText ?? ""} ${text}`.trim(),
                  })
                }
              />
              <Editable
                value={page.audioText ?? ""}
                onChange={(audioText) => updatePage({ audioText })}
                placeholder="Or paste TTS text if no audio file"
                multiline
                className="mt-2 rounded-xl border border-[#86efac] bg-white px-3 py-2 text-sm font-semibold"
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                disabled={pageIndex <= 0}
                onClick={() => onPageIndex(pageIndex - 1)}
                className="kid-btn-secondary !px-4 !py-2 !text-sm disabled:opacity-40"
              >
                ← Back
              </button>
              <div className="flex flex-wrap gap-2">
                {pageIndex < pages.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => onPageIndex(pageIndex + 1)}
                    className="kid-btn-primary !px-4 !py-2 !text-sm"
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      onLessonChange({
                        ...lesson,
                        pages: [
                          ...pages,
                          { ...EMPTY_LESSON_PAGE, title: `${pages.length + 1}. New topic` },
                        ],
                      })
                    }
                    className="kid-btn-secondary !px-4 !py-2 !text-sm"
                  >
                    + Topic page
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={onOpenQuiz} className="kid-btn-primary !px-5 !py-2.5 !text-sm">
          open quiz! 🎯
        </button>
        {pages.length > 1 && (
          <button
            type="button"
            onClick={() => {
              if (pages.length <= 1) return;
              const next = pages.filter((_, i) => i !== pageIndex);
              onLessonChange({ ...lesson, pages: next });
              onPageIndex(Math.min(pageIndex, next.length - 1));
            }}
            className="text-sm font-extrabold text-red-600"
          >
            Remove this topic page
          </button>
        )}
      </div>
    </div>
  );
}

export function SubjectContentEditor({
  subjectTitle,
  subjectDescription,
  meta,
  onMetaChange,
  lessons,
  quizQuestions,
  onLessonsChange,
  onQuestionsChange,
}: SubjectContentEditorProps) {
  const [view, setView] = useState<View>("topics");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);

  const topics = useMemo(() => {
    const map = new Map<string, { title: string; emoji: string; lessons: LessonRow[] }>();
    for (const lesson of lessons) {
      const title = topicKey(lesson);
      if (!map.has(title)) {
        map.set(title, {
          title,
          emoji: lesson.topicEmoji || "🐊",
          lessons: [],
        });
      }
      map.get(title)!.lessons.push(lesson);
    }
    return Array.from(map.values());
  }, [lessons]);

  const activeLesson = lessons.find((l) => l.id === activeLessonId) ?? null;
  const lessonQuestions = activeLesson
    ? getLessonQuestions(quizQuestions, activeLesson.id)
    : [];

  const addTopic = () => {
    const name = `Chapter ${topics.length + 1}`;
    const id = `new-${Date.now()}`;
    onLessonsChange([
      ...lessons,
      {
        ...EMPTY_LESSON,
        id,
        topicTitle: name,
        topicEmoji: "📖",
        title: "New lesson",
        slug: `lesson-${Date.now()}`,
        order: lessons.length,
      },
    ]);
    setActiveTopic(name);
    setView("lessons");
  };

  const addLesson = (topicTitle: string, topicEmoji: string) => {
    const id = `new-${Date.now()}`;
    onLessonsChange([
      ...lessons,
      {
        ...EMPTY_LESSON,
        id,
        topicTitle,
        topicEmoji,
        title: "New subtopic",
        slug: `lesson-${Date.now()}`,
        badgeText: "1. NEW LESSON",
        mascotSpeech: "Hey there! Let's start this lesson.",
        order: lessons.length,
      },
    ]);
    setActiveLessonId(id);
    setPageIndex(0);
    setView("play");
  };

  const openLesson = (lesson: LessonRow) => {
    setActiveLessonId(lesson.id);
    setPageIndex(0);
    setQuizIndex(0);
    setView("play");
  };

  /* ─────────── TOPICS (like Maths topics page) ─────────── */
  if (view === "topics") {
    return (
      <div className="relative">
        <p className="kid-pill mb-3 border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">
          📖 Choose your adventure — editor
        </p>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Editable
            value={meta.emoji}
            onChange={(emoji) => onMetaChange({ ...meta, emoji })}
            className="w-14 text-3xl"
            placeholder="🔢"
          />
          <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">
            {subjectTitle || "Subject"} topics
          </h1>
        </div>
        <p className="mb-4 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
          Open a chapter to see the lessons inside — same cards kids see on Subjects.
        </p>

        <div className="mb-6 kid-card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-extrabold uppercase text-[var(--kid-muted)]">
            Subject slug
            <Editable
              value={meta.slug}
              onChange={(slug) => onMetaChange({ ...meta, slug: slugify(slug) })}
              placeholder="maths"
              className="mt-1 rounded-xl border-2 border-[#fed7aa] bg-white px-3 py-2 text-sm font-bold text-[var(--kid-text)]"
            />
          </label>
          <label className="text-xs font-extrabold uppercase text-[var(--kid-muted)]">
            Card color
            <input
              type="color"
              value={meta.color || "#fff7ed"}
              onChange={(e) => onMetaChange({ ...meta, color: e.target.value })}
              className="mt-1 h-10 w-full cursor-pointer rounded-xl border-2 border-[#fed7aa]"
            />
          </label>
          <label className="text-xs font-extrabold uppercase text-[var(--kid-muted)]">
            Accent
            <input
              type="color"
              value={meta.accent || "#ea580c"}
              onChange={(e) => onMetaChange({ ...meta, accent: e.target.value })}
              className="mt-1 h-10 w-full cursor-pointer rounded-xl border-2 border-[#fed7aa]"
            />
          </label>
          <div
            className="rounded-2xl border-2 border-white p-3 shadow-sm"
            style={{ background: meta.color || "#fff7ed" }}
          >
            <span className="text-2xl">{meta.emoji || "📚"}</span>
            <p className="game-font font-bold" style={{ color: meta.accent }}>
              {subjectTitle || "Preview"}
            </p>
            <p className="line-clamp-2 text-xs font-semibold text-[var(--kid-muted)]">
              {plainPreview(subjectDescription) || "Subject description…"}
            </p>
          </div>
        </div>

        <nav className="mb-6 text-sm font-bold text-[var(--kid-muted)]">
          Subjects › <span className="text-[var(--kid-text)]">{subjectTitle || "Subject"}</span>
        </nav>

        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map((t) => (
            <button
              key={t.title}
              type="button"
              onClick={() => {
                setActiveTopic(t.title);
                setView("lessons");
              }}
              className="kid-card p-5 text-left transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-3">
                <input
                  value={t.emoji}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    const emoji = e.target.value;
                    onLessonsChange(
                      lessons.map((l) =>
                        topicKey(l) === t.title ? { ...l, topicEmoji: emoji } : l,
                      ),
                    );
                  }}
                  className="w-12 rounded-lg border border-transparent bg-transparent text-center text-3xl outline-none focus:border-[#fed7aa] focus:bg-white"
                />
                <div className="min-w-0 flex-1">
                  <input
                    value={t.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const nextName = e.target.value;
                      onLessonsChange(
                        lessons.map((l) =>
                          topicKey(l) === t.title ? { ...l, topicTitle: nextName } : l,
                        ),
                      );
                      if (activeTopic === t.title) setActiveTopic(nextName);
                    }}
                    className="game-font w-full bg-transparent text-xl font-bold text-[var(--kid-text)] outline-none"
                  />
                  <p className="mt-3 text-sm font-extrabold text-[var(--kid-purple)]">
                    {t.lessons.length} lesson{t.lessons.length === 1 ? "" : "s"} →
                  </p>
                </div>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={addTopic}
            className="kid-card border-dashed p-5 text-left text-[var(--kid-muted)] transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl">＋</span>
            <p className="game-font mt-3 text-xl font-bold">Add topic / chapter</p>
            <p className="mt-1 text-sm font-semibold">Like Numbers, Data Handling, Geometry</p>
          </button>
        </div>
      </div>
    );
  }

  /* ─────────── LESSONS (like Numbers → Comparing Numbers) ─────────── */
  if (view === "lessons" && activeTopic) {
    const topicLessons = lessons.filter((l) => topicKey(l) === activeTopic);
    const topicEmoji = topicLessons[0]?.topicEmoji || "🐊";

    return (
      <div>
        <p className="kid-pill mb-3 border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">
          📖 Choose your adventure — editor
        </p>
        <h1 className="game-font flex items-center gap-2 text-3xl font-bold text-[var(--kid-text)]">
          <span>{topicEmoji}</span> {activeTopic}
        </h1>
        <p className="mt-2 text-base font-semibold text-[var(--kid-muted)]">
          Tap a lesson to edit the play page (image, text, audio) and quiz.
        </p>
        <nav className="mb-6 mt-4 text-sm font-bold text-[var(--kid-muted)]">
          <button type="button" className="text-[var(--kid-purple)]" onClick={() => setView("topics")}>
            Subjects
          </button>
          {" › "}
          <button type="button" className="text-[var(--kid-purple)]" onClick={() => setView("topics")}>
            {subjectTitle || "Subject"}
          </button>
          {" › "}
          <span className="text-[var(--kid-text)]">{activeTopic}</span>
        </nav>

        <div className="grid gap-4 sm:grid-cols-2">
          {topicLessons.map((lesson) => (
            <button
              key={lesson.id}
              type="button"
              onClick={() => openLesson(lesson)}
              className="kid-card p-5 text-left transition-transform hover:-translate-y-1"
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl" aria-hidden>
                  ⚖️
                </span>
                <div>
                  <h2 className="game-font text-xl font-bold text-[var(--kid-text)]">
                    {lesson.title || "Untitled lesson"}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                    {(lesson.pages?.length ?? 1)} topic page
                    {(lesson.pages?.length ?? 1) === 1 ? "" : "s"} ·{" "}
                    {getLessonQuestions(quizQuestions, lesson.id).length} quiz Qs
                  </p>
                  <p className="mt-3 text-sm font-extrabold text-[#ea580c]">Start lesson →</p>
                </div>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={() => addLesson(activeTopic, topicEmoji)}
            className="kid-card border-dashed p-5 text-left transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl">＋</span>
            <p className="game-font mt-3 text-xl font-bold text-[var(--kid-text)]">Add subtopic lesson</p>
            <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
              Opens the play-page editor
            </p>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setView("topics")}
          className="kid-btn-secondary mt-8 !px-5 !py-2.5 !text-sm"
        >
          ← Back
        </button>
      </div>
    );
  }

  /* ─────────── PLAY / QUIZ editors ─────────── */
  if (!activeLesson || (view !== "play" && view !== "quiz")) {
    return (
      <div className="kid-card p-6 text-center">
        <p className="font-semibold text-[var(--kid-muted)]">Pick a lesson to edit.</p>
        <button
          type="button"
          className="kid-btn-secondary mt-4 !px-4 !py-2 !text-sm"
          onClick={() => setView("topics")}
        >
          ← Back to topics
        </button>
      </div>
    );
  }

  return (
    <div>
      <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--kid-muted)]">
        <button type="button" className="text-[var(--kid-purple)]" onClick={() => setView("topics")}>
          Subjects
        </button>
        <span>›</span>
        <button
          type="button"
          className="text-[var(--kid-purple)]"
          onClick={() => {
            setActiveTopic(topicKey(activeLesson));
            setView("lessons");
          }}
        >
          {topicKey(activeLesson)}
        </button>
        <span>›</span>
        <span className="text-[var(--kid-text)]">{activeLesson.title}</span>
      </nav>

      <div className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("play")}
          className={
            view === "play"
              ? "kid-btn-primary !px-4 !py-2 !text-sm"
              : "kid-btn-secondary !px-4 !py-2 !text-sm"
          }
        >
          📖 Lesson (image · text · audio)
        </button>
        <button
          type="button"
          onClick={() => setView("quiz")}
          className={
            view === "quiz"
              ? "kid-btn-primary !px-4 !py-2 !text-sm"
              : "kid-btn-secondary !px-4 !py-2 !text-sm"
          }
        >
          🎯 Quiz
        </button>
        <button
          type="button"
          onClick={() => {
            if (
              window.confirm("Delete this lesson and its quiz questions? Save to apply fully.")
            ) {
              onLessonsChange(lessons.filter((l) => l.id !== activeLesson.id));
              onQuestionsChange(quizQuestions.filter((q) => q.lessonId !== activeLesson.id));
              setActiveLessonId(null);
              setView("lessons");
            }
          }}
          className="ml-auto text-sm font-extrabold text-red-600"
        >
          Delete lesson
        </button>
      </div>

      {view === "play" && (
        <PlayLayoutEditor
          lesson={activeLesson}
          pageIndex={pageIndex}
          onPageIndex={setPageIndex}
          onOpenQuiz={() => setView("quiz")}
          onLessonChange={(updated) =>
            onLessonsChange(lessons.map((l) => (l.id === updated.id ? updated : l)))
          }
        />
      )}

      {view === "quiz" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="game-font text-xl font-bold text-[var(--kid-text)]">
              Quiz — same card kids see on play
            </p>
            <button
              type="button"
              className="kid-btn-primary !px-4 !py-2 !text-sm"
              onClick={() => {
                const next: QuestionRow = {
                  ...EMPTY_QUIZ_QUESTION,
                  id: `new-q-${Date.now()}`,
                  lessonId: activeLesson.id,
                  order: lessonQuestions.length,
                  options: ["", "", "", ""],
                  optionEmojis: ["🐊", "🐊", "😐", ""],
                };
                onQuestionsChange([...quizQuestions, next]);
                setQuizIndex(lessonQuestions.length);
              }}
            >
              + Add question
            </button>
          </div>

          {lessonQuestions.length === 0 ? (
            <div className="kid-card p-8 text-center">
              <p className="text-5xl">🎯</p>
              <p className="game-font mt-3 text-2xl font-bold">No quiz questions yet</p>
              <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
                Add questions with emoji options and a hint — just like the play quiz.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {lessonQuestions.map((q, i) => (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setQuizIndex(i)}
                    className={`kid-pill border-2 ${
                      quizIndex === i
                        ? "border-[#ea580c] bg-[#ffedd5] text-[#c2410c]"
                        : "border-gray-200 bg-white text-[var(--kid-muted)]"
                    }`}
                  >
                    Q{i + 1}
                  </button>
                ))}
              </div>
              <QuizCardEditor
                q={lessonQuestions[Math.min(quizIndex, lessonQuestions.length - 1)]}
                idx={Math.min(quizIndex, lessonQuestions.length - 1)}
                total={lessonQuestions.length}
                onChange={(updated) =>
                  onQuestionsChange(
                    quizQuestions.map((q) => (q.id === updated.id ? updated : q)),
                  )
                }
                onRemove={() => {
                  const id = lessonQuestions[Math.min(quizIndex, lessonQuestions.length - 1)].id;
                  onQuestionsChange(quizQuestions.filter((q) => q.id !== id));
                  setQuizIndex(0);
                }}
              />
            </>
          )}

          <button
            type="button"
            onClick={() => setView("play")}
            className="kid-btn-secondary !px-5 !py-2.5 !text-sm"
          >
            ← open lesson! 📖
          </button>
        </div>
      )}
    </div>
  );
}
