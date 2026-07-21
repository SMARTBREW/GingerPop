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
import { FieldHint } from "@/components/admin/FieldHint";
import { SubjectWizardChrome, WizardStepFooter } from "@/components/admin/SubjectWizardChrome";
import { getLessonQuestions } from "@/lib/course-rules";
import "@/styles/mascot-quiz.css";

type LessonRow = Lesson & { id: string };
type QuestionRow = CourseQuizQuestion & { id: string };
type View = "topics" | "lessons" | "play" | "quiz";

const OPTION_LABELS = ["A", "B", "C", "D"] as const;

interface SubjectMeta {
  emoji: string;
  color: string;
  accent: string;
  slug: string;
}

type QuestionsUpdater = QuestionRow[] | ((prev: QuestionRow[]) => QuestionRow[]);

interface SubjectContentEditorProps {
  subjectTitle: string;
  subjectDescription: string;
  meta: SubjectMeta;
  onMetaChange: (meta: SubjectMeta) => void;
  lessons: LessonRow[];
  quizQuestions: QuestionRow[];
  onLessonsChange: (lessons: LessonRow[]) => void;
  onQuestionsChange: (questions: QuestionsUpdater) => void;
  onSave?: () => void;
  saving?: boolean;
  onBackToSubject?: () => void;
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
  const title = lesson.topicTitle ?? "";
  return title.trim() ? title : "Numbers";
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
  const emojis = q.optionEmojis ?? ["🐊", "🐊", "🐊", "😐"];
  const previewImage = q.imageUrl || q.mediaUrl;
  const previewVideo = q.videoUrl;
  const hasVisual = Boolean(previewImage || previewVideo);

  return (
    <div className="admin-quiz-editor">
      <div className="admin-mascot-preview mascot-card-wrapper">
        <div className="mascot-player-card">
        {hasVisual && (
          <div className="mascot-player-left-quiz" style={{ flexDirection: "column", gap: "0.75rem" }}>
            {previewVideo ? (
              <video src={previewVideo} controls playsInline className="max-h-56 w-full rounded-xl bg-black" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewImage} alt="" className="max-h-56 w-full rounded-xl object-contain" />
            )}
            <p className="text-xs font-bold text-[var(--kid-muted)]">
              Question {idx + 1} of {total}
            </p>
          </div>
        )}

        <div className="mascot-player-right-quiz" style={{ width: hasVisual ? undefined : "100%", flex: 1 }}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="kid-pill border border-[#fde68a] bg-[#fef9c3] text-[#92400e]">
              Q{idx + 1} OF {total}
            </span>
            <button type="button" onClick={onRemove} className="text-sm font-extrabold text-red-600">
              Delete
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MediaUploader
              type="image"
              value={previewImage}
              onChange={(url) =>
                onChange({
                  ...q,
                  imageUrl: url,
                  mediaUrl: url,
                  type: q.videoUrl ? "video" : url ? "image" : q.audioUrl ? "audio" : "text",
                })
              }
              label="Quiz image — left panel (optional)"
            />
            <MediaUploader
              type="video"
              value={previewVideo}
              onChange={(videoUrl) =>
                onChange({
                  ...q,
                  videoUrl,
                  type: videoUrl ? "video" : previewImage ? "image" : q.audioUrl ? "audio" : "text",
                })
              }
              label="Quiz video — record or upload (optional)"
            />
          </div>

          <FieldHint
            label="Question text"
            hint="Big bold prompt on the quiz card"
            example="Fill in the blank: 64 ___ 89"
          >
            <Editable
              value={stripHtml(q.question)}
              onChange={(question) => onChange({ ...q, question })}
              placeholder="Fill in the blank: 64 ___ 89"
              className="game-font text-xl font-bold text-[var(--kid-text)] sm:text-2xl"
            />
          </FieldHint>

          <FieldHint
            label="Subtitle"
            hint="Small grey line under the question"
            example="Practice Question a"
            className="mt-2"
          >
            <Editable
              value={q.subtitle ?? ""}
              onChange={(subtitle) => onChange({ ...q, subtitle })}
              placeholder="Practice Question a"
              className="text-sm font-semibold text-[var(--kid-muted)]"
            />
          </FieldHint>

          <div className="mt-3 rounded-2xl border-2 border-[#e9d5ff] bg-[#faf5ff] p-3">
            <label className="flex cursor-pointer items-center justify-between gap-3">
              <span>
                <span className="block text-sm font-bold text-[var(--kid-text)]">Question timer</span>
                <span className="block text-xs font-semibold text-[var(--kid-muted)]">
                  Turn it off when learners should have unlimited time.
                </span>
              </span>
              <input
                type="checkbox"
                checked={(q.timeLimit ?? 0) > 0}
                onChange={(e) => onChange({ ...q, timeLimit: e.target.checked ? 30 : 0 })}
                className="h-5 w-5 rounded border-gray-300 text-[var(--kid-purple)]"
              />
            </label>
            {(q.timeLimit ?? 0) > 0 && (
              <label className="mt-3 block">
                <span className="text-xs font-bold text-[var(--kid-muted)]">Seconds allowed</span>
                <input
                  type="number"
                  min={5}
                  max={600}
                  value={q.timeLimit}
                  onChange={(e) =>
                    onChange({
                      ...q,
                      timeLimit: Math.max(5, Math.min(600, Number(e.target.value) || 30)),
                    })
                  }
                  className="mt-1 w-32 rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 font-bold outline-none focus:border-[#a78bfa]"
                />
              </label>
            )}
          </div>

          <div className="mt-3">
            <MediaUploader
              type="audio"
              value={q.audioUrl}
              onChange={(url) =>
                onChange({
                  ...q,
                  audioUrl: url,
                  type: q.videoUrl ? "video" : url ? "audio" : previewImage ? "image" : "text",
                })
              }
              onTranscript={(audioText) => onChange({ ...q, audioText })}
              label="Question audio (optional)"
            />
          </div>

          <p className="mt-4 text-xs font-extrabold uppercase tracking-wide text-[var(--kid-muted)]">
            Answer options — tap “Set correct” for the right one
          </p>
          <div className="mt-2 space-y-3">
            {OPTION_LABELS.map((label, oIdx) => {
              const isEmpty = !stripHtml(q.options[oIdx] ?? "").trim();
              return (
                <div
                  key={label}
                  className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3 ${
                    q.correctIndex === oIdx
                      ? "border-[#86efac] bg-[#f0fdf4]"
                      : isEmpty
                        ? "border-dashed border-gray-200 bg-gray-50/80"
                        : "border-gray-200 bg-white"
                  }`}
                >
                  <span className="w-6 text-center text-xs font-extrabold text-[var(--kid-muted)]">
                    {label}
                  </span>
                  <input
                    value={emojis[oIdx] ?? ""}
                    onChange={(e) => {
                      const next = [...(q.optionEmojis ?? ["🐊", "🐊", "🐊", "😐"])] as [
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
                      oIdx === 3 ? "4th option (optional)" : `Option ${OPTION_LABELS[oIdx]}`
                    }
                    className="flex-1 bg-transparent text-base font-bold text-[var(--kid-text)] outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => onChange({ ...q, correctIndex: oIdx })}
                    className="shrink-0 text-xs font-extrabold text-[var(--kid-purple)]"
                  >
                    {q.correctIndex === oIdx ? "✓ Correct" : "Set correct"}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <FieldHint label="Hint button" hint="Orange hint kids tap" example="89 is bigger than 64!">
              <Editable
                value={q.hint ?? ""}
                onChange={(hint) => onChange({ ...q, hint })}
                placeholder="89 is bigger than 64!"
                className="rounded-xl border-2 border-[#fde68a] bg-[#fffbeb] px-3 py-2 text-sm font-semibold"
              />
            </FieldHint>
            <FieldHint label="Correct answer message" example="Correct! 64 < 89">
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
            </FieldHint>
          </div>
        </div>
      </div>
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
  const pages = lesson.pages?.length
    ? lesson.pages
    : [{ ...EMPTY_LESSON_PAGE, title: "Lesson page 1" }];
  const page = pages[Math.min(pageIndex, pages.length - 1)] ?? pages[0];

  const updatePage = (patch: Partial<LessonPage>, lessonPatch: Partial<LessonRow> = {}) => {
    const next = pages.map((p, i) => (i === pageIndex ? { ...p, ...patch } : p));
    onLessonChange({
      ...lesson,
      ...lessonPatch,
      pages: next,
      content: next.map((p) => `${p.title}\n${p.content ?? ""}`).join("\n\n"),
      imageUrl: next[0]?.imageUrl || "",
      mediaUrl: next[0]?.imageUrl || "",
    });
  };

  return (
    <div className="admin-play-editor space-y-4">
      <div className="admin-mascot-preview mascot-card-wrapper">
        <div className="mascot-player-card">
        <div
          className={`mascot-player-left mascot-player-left--topics${
            lesson.imageUrl || page.imageUrl || lesson.mediaUrl ? "" : " mascot-player-left--no-image"
          }`}
        >
          <FieldHint
            label="Lesson title (left panel)"
            hint="Big heading on the left of the play card"
            example="Comparing Numbers"
          >
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
              className="game-font w-full bg-white/80 text-xl font-bold text-[var(--kid-text)] sm:text-2xl"
            />
          </FieldHint>

          <div className="mt-3 flex min-h-[200px] w-full flex-1 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[#fdba74] bg-[#fff7ed]/50 p-3">
            {(page.videoUrl || lesson.videoUrl) && (
              <video
                src={page.videoUrl || lesson.videoUrl}
                controls
                playsInline
                className="max-h-64 w-full rounded-xl bg-black object-contain"
              />
            )}
            {!(page.videoUrl || lesson.videoUrl) && (lesson.imageUrl || page.imageUrl || lesson.mediaUrl) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={lesson.imageUrl || page.imageUrl || lesson.mediaUrl}
                alt=""
                className="max-h-64 w-full rounded-xl object-contain"
              />
            )}
            {!(page.videoUrl || lesson.videoUrl || lesson.imageUrl || page.imageUrl || lesson.mediaUrl) && (
              <p className="px-4 text-center text-sm font-bold text-[var(--kid-muted)]">
                Your lesson image or video preview appears here.
              </p>
            )}
          </div>
          <p className="mt-3 text-sm font-extrabold text-[var(--kid-muted)]">
            Lesson page {pageIndex + 1} of {pages.length}
          </p>
        </div>

        <div className="mascot-player-right">
          <FieldHint
            label="Green badge (top right)"
            hint="Small pill above mascot speech"
            example="1. COMPARING NUMBERS"
          >
            <Editable
              value={lesson.badgeText ?? ""}
              onChange={(badgeText) => onLessonChange({ ...lesson, badgeText })}
              placeholder="1. COMPARING NUMBERS"
              className="mascot-badge w-fit border-2 border-[#bbf7d0] bg-[#f0fdf4] text-[#166534]"
            />
          </FieldHint>

          <div className="mb-4 mt-3 flex gap-3 rounded-2xl border-2 border-[#bbf7d0] bg-[#f0fdf4]/70 p-3">
            <span className="text-3xl" aria-hidden>
              🐸
            </span>
            <FieldHint
              label="Mascot speech bubble"
              hint="Friendly intro kids read next to the frog"
              example="Hey there! Let's learn how to compare numbers…"
              className="flex-1"
            >
              <Editable
                value={lesson.mascotSpeech ?? ""}
                onChange={(mascotSpeech) => onLessonChange({ ...lesson, mascotSpeech })}
                placeholder="Hey there! Let's learn how to compare numbers…"
                multiline
                className="w-full bg-transparent text-sm font-semibold leading-relaxed text-[var(--kid-text)]"
              />
            </FieldHint>
          </div>

          <FieldHint
            label="Lesson page heading"
            hint="Bold heading under the mascot — like “1. What is Compare in Maths?”"
            example="1. What is Compare in Maths?"
          >
            <Editable
              value={page.title}
              onChange={(title) => updatePage({ title })}
              placeholder="1. What is Compare in Maths?"
              className="game-font w-full text-xl font-bold text-[var(--kid-text)]"
            />
          </FieldHint>

          <FieldHint
            label="Explanation text"
            hint="Paragraph under the heading on the play page"
            example="Compare karne ka matlab hota hai do ya zyada numbers ko dekhkar…"
            className="mt-3"
          >
            <Editable
              value={stripHtml(page.content ?? "")}
              onChange={(content) => updatePage({ content })}
              placeholder="Compare karne ka matlab hota hai…"
              multiline
              rows={6}
              className="min-h-[120px] w-full text-base font-semibold leading-relaxed text-[var(--kid-muted)]"
            />
          </FieldHint>

          <div className="mt-4 rounded-2xl border-2 border-[#86efac] bg-[#ecfdf5] p-3">
            <FieldHint
              label="Audio player"
              hint="Kids tap play under the explanation — upload or paste TTS text"
            >
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
                placeholder="Or paste spoken text if no audio file"
                multiline
                className="mt-2 w-full rounded-xl border border-[#86efac] bg-white px-3 py-2 text-sm font-semibold"
              />
            </FieldHint>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={pageIndex <= 0}
                onClick={() => onPageIndex(pageIndex - 1)}
                className="kid-btn-secondary !px-4 !py-2 !text-sm disabled:opacity-40"
              >
                ← Back
              </button>
              {pages.length > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    const next = pages.filter((_, i) => i !== pageIndex);
                    onLessonChange({ ...lesson, pages: next });
                    onPageIndex(Math.min(pageIndex, next.length - 1));
                  }}
                  className="rounded-full border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700 hover:bg-red-100"
                >
                  Remove page
                </button>
              )}
            </div>
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
                  onClick={() => {
                    onLessonChange({
                      ...lesson,
                      pages: [
                        ...pages,
                        { ...EMPTY_LESSON_PAGE, title: `Lesson page ${pages.length + 1}` },
                      ],
                    });
                    onPageIndex(pages.length);
                  }}
                  className="kid-btn-secondary !px-4 !py-2 !text-sm"
                >
                  + Lesson page
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="kid-card grid items-start gap-4 p-4 lg:grid-cols-2 sm:p-5">
        <MediaUploader
          type="image"
          value={page.imageUrl || lesson.imageUrl || lesson.mediaUrl}
          onChange={(imageUrl) =>
            updatePage(
              { imageUrl },
              {
                type: imageUrl ? "image" : page.videoUrl ? "video" : page.audioUrl ? "audio" : "text",
              },
            )
          }
          label="Lesson image — upload or remove the left-panel poster"
        />
        <MediaUploader
          type="video"
          value={page.videoUrl || lesson.videoUrl}
          onChange={(videoUrl) =>
            updatePage(
              { videoUrl },
              {
                videoUrl,
                type: videoUrl ? "video" : page.imageUrl ? "image" : page.audioUrl ? "audio" : "text",
              },
            )
          }
          label="Lesson video — record, upload, or remove (optional)"
        />
      </div>

     
    </div>
  );
}

export function StandaloneQuizEditor({
  lessons,
  quizQuestions,
  onLessonsChange,
  onQuestionsChange,
  onSave,
  saving,
  onBack,
  onNext,
}: {
  lessons: LessonRow[];
  quizQuestions: QuestionRow[];
  onLessonsChange: (lessons: LessonRow[]) => void;
  onQuestionsChange: (questions: QuestionsUpdater) => void;
  onSave: () => void;
  saving?: boolean;
  onBack: () => void;
  onNext: () => void;
}) {
  const standaloneQuestions = quizQuestions.filter((q) => !q.lessonId);
  const [questionIndex, setQuestionIndex] = useState(0);

  const addQuestion = () => {
    const next: QuestionRow = {
      ...EMPTY_QUIZ_QUESTION,
      id: `new-q-${Date.now()}`,
      order: standaloneQuestions.length,
      options: ["", "", "", ""],
      optionEmojis: ["🐊", "🐊", "🐊", "😐"],
      timeLimit: 0,
    };
    onQuestionsChange([...quizQuestions, next]);
    setQuestionIndex(standaloneQuestions.length);
  };

  return (
    <SubjectWizardChrome
      title="🎯 Standalone quiz"
      subtitle="An alternative to chapters and lessons. Learners open the quiz directly."
      breadcrumbs={[{ label: "Subject", onClick: onBack }, { label: "Standalone quiz" }]}
      footer={
        <WizardStepFooter
          onBack={onBack}
          backLabel="← Chapters & lessons"
          onSave={onSave}
          saving={saving}
          onNext={onNext}
          nextLabel="Next: Learners →"
          nextDisabled={lessons.length > 0 || standaloneQuestions.length === 0}
        />
      }
    >
      {lessons.length > 0 ? (
        <div className="kid-card border-amber-200 bg-amber-50 p-6">
          <h2 className="game-font text-xl font-bold text-amber-900">Choose one course format</h2>
          <p className="mt-2 text-sm font-semibold text-amber-800">
            This subject already has chapters and lessons. A standalone quiz has no lessons, so it
            cannot be combined with that format.
          </p>
          <button
            type="button"
            onClick={() => {
              const ok = window.confirm(
                "Remove every chapter, lesson, and lesson-linked quiz question and switch to a standalone quiz?",
              );
              if (!ok) return;
              onLessonsChange([]);
              onQuestionsChange(quizQuestions.filter((q) => !q.lessonId));
            }}
            className="mt-4 rounded-full border-2 border-red-200 bg-white px-4 py-2 text-sm font-extrabold text-red-700 hover:bg-red-50"
          >
            Remove lessons and use standalone quiz
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-semibold text-[var(--kid-muted)]">
              {standaloneQuestions.length} standalone question
              {standaloneQuestions.length === 1 ? "" : "s"}
            </p>
            <button type="button" onClick={addQuestion} className="kid-btn-primary !px-4 !py-2 !text-sm">
              + Add quiz question
            </button>
          </div>

          {standaloneQuestions.length === 0 ? (
            <div className="kid-card p-8 text-center">
              <p className="text-5xl">🎯</p>
              <h2 className="game-font mt-3 text-2xl font-bold">No standalone questions yet</h2>
              <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
                Add a question to create a quiz learners can play without opening a lesson.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {standaloneQuestions.map((question, index) => (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => setQuestionIndex(index)}
                    className={`kid-pill border-2 ${
                      questionIndex === index
                        ? "border-[#ea580c] bg-[#ffedd5] text-[#c2410c]"
                        : "border-gray-200 bg-white text-[var(--kid-muted)]"
                    }`}
                  >
                    Q{index + 1}
                  </button>
                ))}
              </div>
              <QuizCardEditor
                key={standaloneQuestions[Math.min(questionIndex, standaloneQuestions.length - 1)]?.id}
                q={standaloneQuestions[Math.min(questionIndex, standaloneQuestions.length - 1)]}
                idx={Math.min(questionIndex, standaloneQuestions.length - 1)}
                total={standaloneQuestions.length}
                onChange={(updated) =>
                  onQuestionsChange((prev) =>
                    prev.map((question) => (question.id === updated.id ? updated : question)),
                  )
                }
                onRemove={() => {
                  const current =
                    standaloneQuestions[Math.min(questionIndex, standaloneQuestions.length - 1)];
                  onQuestionsChange((prev) => prev.filter((question) => question.id !== current.id));
                  setQuestionIndex((index) => Math.max(0, index - 1));
                }}
              />
            </>
          )}
        </div>
      )}
    </SubjectWizardChrome>
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
  onSave,
  saving,
  onBackToSubject,
}: SubjectContentEditorProps) {
  const [view, setView] = useState<View>("topics");
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [quizIndex, setQuizIndex] = useState(0);

  const topics = useMemo(() => {
    const map = new Map<
      string,
      { title: string; emoji: string; description: string; lessons: LessonRow[] }
    >();
    for (const lesson of lessons) {
      const title = topicKey(lesson);
      if (!map.has(title)) {
        map.set(title, {
          title,
          emoji: lesson.topicEmoji || "🐊",
          description: lesson.topicDescription || "",
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
        topicDescription: "",
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
    const topicDescription =
      lessons.find((lesson) => topicKey(lesson) === topicTitle)?.topicDescription || "";
    onLessonsChange([
      ...lessons,
      {
        ...EMPTY_LESSON,
        id,
        topicTitle,
        topicEmoji,
        topicDescription,
        title: "New lesson",
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

  const deleteTopic = (topicTitle: string) => {
    const topicLessons = lessons.filter((l) => topicKey(l) === topicTitle);
    const ok = window.confirm(
      `Delete chapter “${topicTitle}”?\n\nThis removes ${topicLessons.length} lesson(s) and their quizzes from this subject. Save changes to store on the server.`,
    );
    if (!ok) return;

    const lessonIds = new Set(topicLessons.map((l) => l.id));
    onLessonsChange(lessons.filter((l) => !lessonIds.has(l.id)));
    onQuestionsChange(quizQuestions.filter((q) => !q.lessonId || !lessonIds.has(q.lessonId)));
    if (activeTopic === topicTitle) {
      setActiveTopic(null);
      setView("topics");
    }
  };

  const deleteLesson = (lesson: LessonRow) => {
    const ok = window.confirm(
      `Delete lesson “${lesson.title || "Untitled lesson"}”?\n\nThis removes the lesson and its quiz questions. Save changes to store on the server.`,
    );
    if (!ok) return;

    onLessonsChange(lessons.filter((l) => l.id !== lesson.id));
    onQuestionsChange(quizQuestions.filter((q) => q.lessonId !== lesson.id));
    if (activeLessonId === lesson.id) {
      setActiveLessonId(null);
      setView("lessons");
    }
  };

  /* ─────────── CHAPTERS ─────────── */
  if (view === "topics") {
    return (
      <SubjectWizardChrome
        title={`${meta.emoji || "📚"} ${subjectTitle || "Subject"} chapters`}
        subtitle="Open a chapter to see the lessons inside — same cards kids see on Subjects."
        breadcrumbs={[
          { label: "Subjects", onClick: onBackToSubject },
          { label: subjectTitle || "Subject" },
        ]}
        footer={
          <WizardStepFooter
            onBack={onBackToSubject}
            backLabel="← Subject setup"
            onSave={onSave}
            saving={saving}
            onNext={() => {
              if (topics.length === 0) return;
              setActiveTopic(topics[0].title);
              setView("lessons");
            }}
            nextLabel="Next: Lessons →"
            nextDisabled={topics.length === 0}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {topics.map((t) => (
            <div
              key={t.lessons[0]?.id ?? t.title}
              className="kid-card relative p-5 text-left transition-transform hover:-translate-y-1"
            >
              <button
                type="button"
                className="absolute right-3 top-3 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-700 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTopic(t.title);
                }}
              >
                Delete
              </button>
              <div className="flex items-start gap-3 pr-16">
                <input
                  value={t.emoji}
                  onChange={(e) => {
                    const emoji = e.target.value;
                    onLessonsChange(
                      lessons.map((l) =>
                        topicKey(l) === t.title ? { ...l, topicEmoji: emoji } : l,
                      ),
                    );
                  }}
                  className="w-12 rounded-lg border border-transparent bg-transparent text-center text-3xl outline-none focus:border-[#fed7aa] focus:bg-white"
                  aria-label="Chapter emoji"
                />
                <div className="min-w-0 flex-1 space-y-2">
                  <label className="block">
                    <span className="text-xs font-bold text-[var(--kid-muted)]">Chapter name</span>
                    <input
                      value={t.title}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        onLessonsChange(
                          lessons.map((l) =>
                            topicKey(l) === t.title ? { ...l, topicTitle: nextName } : l,
                          ),
                        );
                        if (activeTopic === t.title) setActiveTopic(nextName);
                      }}
                      className="game-font mt-1 w-full rounded-lg border border-[#e9d5ff] bg-white px-2 py-1.5 text-xl font-bold text-[var(--kid-text)] outline-none focus:border-[#a78bfa]"
                      placeholder="Example: Numbers"
                    />
                  </label>
                  <label className="block">
                    <span className="text-xs font-bold text-[var(--kid-muted)]">
                      Chapter description
                    </span>
                    <textarea
                      value={t.description}
                      onChange={(e) => {
                        const topicDescription = e.target.value;
                        onLessonsChange(
                          lessons.map((l) =>
                            topicKey(l) === t.title ? { ...l, topicDescription } : l,
                          ),
                        );
                      }}
                      rows={2}
                      className="mt-1 w-full resize-y rounded-lg border border-[#e9d5ff] bg-white px-2 py-1.5 text-sm font-semibold text-[var(--kid-muted)] outline-none focus:border-[#a78bfa]"
                      placeholder="Example: Compare, count and play with numbers"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTopic(t.title);
                      setView("lessons");
                    }}
                    className="text-sm font-extrabold text-[var(--kid-purple)]"
                  >
                    Edit {t.lessons.length} lesson{t.lessons.length === 1 ? "" : "s"} →
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addTopic}
            className="kid-card border-dashed p-5 text-left text-[var(--kid-muted)] transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl">＋</span>
            <p className="game-font mt-3 text-xl font-bold">Add chapter</p>
            <p className="mt-1 text-sm font-semibold">Like Numbers, Data Handling, Geometry</p>
          </button>
        </div>
      </SubjectWizardChrome>
    );
  }

  /* ─────────── LESSONS (like Numbers → Comparing Numbers) ─────────── */
  if (view === "lessons" && activeTopic) {
    const topicLessons = lessons.filter((l) => topicKey(l) === activeTopic);
    const topicEmoji = topicLessons[0]?.topicEmoji || "🐊";

    return (
      <SubjectWizardChrome
        title={`${topicEmoji} ${activeTopic}`}
        subtitle="Tap a lesson to edit the play page (image, text, audio) and quiz."
        breadcrumbs={[
          { label: "Subjects", onClick: onBackToSubject },
          { label: subjectTitle || "Subject", onClick: () => setView("topics") },
          { label: activeTopic },
        ]}
        footer={
          <WizardStepFooter
            onBack={() => setView("topics")}
            backLabel="← Chapters"
            onSave={onSave}
            saving={saving}
            onNext={() => {
              if (topicLessons.length === 0) return;
              openLesson(topicLessons[0]);
            }}
            nextLabel="Next: Lesson →"
            nextDisabled={topicLessons.length === 0}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {topicLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="kid-card relative p-5 text-left transition-transform hover:-translate-y-1"
            >
              <button
                type="button"
                className="absolute right-3 top-3 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-700 hover:bg-red-100"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteLesson(lesson);
                }}
              >
                Delete
              </button>
              <button type="button" onClick={() => openLesson(lesson)} className="w-full text-left">
                <div className="flex items-start gap-3 pr-16">
                  <span className="text-3xl" aria-hidden>
                    ⚖️
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="game-font text-xl font-bold text-[var(--kid-text)]">
                      {lesson.title || "Untitled lesson"}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                      Greater than, less than & equal to
                    </p>
                    <p className="mt-3 text-sm font-extrabold text-[#ea580c]">Start lesson →</p>
                  </div>
                </div>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => addLesson(activeTopic, topicEmoji)}
            className="kid-card border-dashed p-5 text-left transition-transform hover:-translate-y-1"
          >
            <span className="text-3xl">＋</span>
            <p className="game-font mt-3 text-xl font-bold text-[var(--kid-text)]">Add lesson</p>
            <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
              Like Comparing Numbers — opens the play-page editor
            </p>
          </button>
        </div>
      </SubjectWizardChrome>
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
          ← Back to chapters
        </button>
      </div>
    );
  }

  return (
    <SubjectWizardChrome
      title={view === "play" ? activeLesson.title || "Lesson" : "Quiz"}
      subtitle={
        view === "play"
          ? "Same play card kids see — edit each field, save, then open quiz."
          : "Same quiz card kids see after the lesson — add questions with emoji options."
      }
      breadcrumbs={[
        { label: "Subjects", onClick: onBackToSubject },
        { label: subjectTitle || "Subject", onClick: () => setView("topics") },
        {
          label: topicKey(activeLesson),
          onClick: () => {
            setActiveTopic(topicKey(activeLesson));
            setView("lessons");
          },
        },
        { label: activeLesson.title || "Lesson" },
      ]}
      footer={
        <WizardStepFooter
          onBack={() => {
            if (view === "quiz") setView("play");
            else {
              setActiveTopic(topicKey(activeLesson));
              setView("lessons");
            }
          }}
          backLabel={view === "quiz" ? "← Lesson" : "← Lessons"}
          onSave={onSave}
          saving={saving}
          onNext={view === "play" ? () => setView("quiz") : undefined}
          nextLabel="Next: Quiz →"
          extra={
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
              className="text-sm font-extrabold text-red-600"
            >
              Delete lesson
            </button>
          }
        />
      }
    >
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
            <p className="text-sm font-semibold text-[var(--kid-muted)]">
              {lessonQuestions.length} question{lessonQuestions.length === 1 ? "" : "s"} for this lesson
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
                  optionEmojis: ["🐊", "🐊", "🐊", "😐"],
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
                key={lessonQuestions[Math.min(quizIndex, lessonQuestions.length - 1)]?.id}
                q={lessonQuestions[Math.min(quizIndex, lessonQuestions.length - 1)]}
                idx={Math.min(quizIndex, lessonQuestions.length - 1)}
                total={lessonQuestions.length}
                onChange={(updated) =>
                  onQuestionsChange((prev) =>
                    prev.map((q) => (q.id === updated.id ? updated : q)),
                  )
                }
                onRemove={() => {
                  const id = lessonQuestions[Math.min(quizIndex, lessonQuestions.length - 1)].id;
                  onQuestionsChange((prev) => prev.filter((q) => q.id !== id));
                  setQuizIndex(0);
                }}
              />
            </>
          )}
        </div>
      )}
    </SubjectWizardChrome>
  );
}
