"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import Link from "next/link";
import { EMPTY_QUESTION, Question, QuestionType } from "@/types/quiz";
import { AdminShell } from "@/components/layout/AdminShell";
import { MediaUploader } from "@/components/media/MediaUploader";

interface InvitationRow {
  id: string;
  email: string;
  status: string;
  score: number;
  maxScore: number;
  sentAt?: string;
  completedAt?: string;
}

interface ReferenceCourse {
  id: string;
  title: string;
  lessons: { id: string; title: string }[];
}

const TYPE_CYCLE: QuestionType[] = ["video", "audio", "text", "image"];

function newQuestion(order: number): Omit<Question, "id"> {
  return {
    ...EMPTY_QUESTION,
    type: TYPE_CYCLE[order % TYPE_CYCLE.length],
  };
}

export default function QuizEditorPage() {
  const id = useDynamicParam(2, "id");
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [referenceCourseId, setReferenceCourseId] = useState("");
  const [referenceLessonId, setReferenceLessonId] = useState("");
  const [referenceCourses, setReferenceCourses] = useState<ReferenceCourse[]>([]);
  const [questions, setQuestions] = useState<(Question & { id?: string })[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [inviteResults, setInviteResults] = useState<{ email: string; sent: boolean; inviteLink: string }[]>([]);
  const [tab, setTab] = useState<"questions" | "invites">("questions");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`/api/quizzes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/admin/dashboard");
          return;
        }
        setTitle(data.quiz.title);
        setDescription(data.quiz.description ?? "");
        setReferenceCourseId(data.quiz.referenceCourseId ?? "");
        setReferenceLessonId(data.quiz.referenceLessonId ?? "");
        setQuestions(
          data.quiz.questions.map((q: Question & { id: string }) => ({
            ...q,
            options: [...q.options] as [string, string, string, string],
          })),
        );
        setInvitations(data.invitations ?? []);
        return fetch("/api/quizzes/reference-options", { credentials: "include" });
      })
      .then(async (response) => {
        if (!response) return null;
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Failed to load reference lessons");
        return result;
      })
      .then((data) => {
        setReferenceCourses(data?.courses ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setMessage(err instanceof Error ? err.message : "Failed to load quiz");
        setLoading(false);
      });
  }, [id, router]);

  const handleSave = async () => {
    if (!referenceCourseId || !referenceLessonId) {
      setMessage("Select the subject and lesson this standalone quiz refers to.");
      return;
    }
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        referenceCourseId: referenceCourseId || null,
        referenceLessonId: referenceLessonId || null,
        questions: questions.map((q, idx) => ({
          type: q.type,
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex,
          points: q.points,
          timeLimit: q.timeLimit,
          mediaUrl: q.mediaUrl,
          mediaCaption: q.mediaCaption,
          order: idx,
        })),
      }),
    });
    setSaving(false);
    setMessage(res.ok ? "Saved successfully!" : "Failed to save");
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = emailInput.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    if (emails.length === 0) return;

    setInviting(true);
    setInviteResults([]);
    setMessage("");

    const res = await fetch(`/api/quizzes/${id}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    const data = await res.json();
    setInviting(false);

    if (res.ok) {
      setInviteResults(data.results);
      setEmailInput("");
      setMessage(`Invites processed for ${data.results.length} email(s)`);
      const refresh = await fetch(`/api/quizzes/${id}`).then((r) => r.json());
      setInvitations(refresh.invitations ?? []);
    } else {
      setMessage(data.error ?? "Failed to send invites");
    }
  };

  const updateQuestion = (idx: number, patch: Partial<Question>) => {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const updateOption = (qIdx: number, oIdx: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const options = [...q.options] as [string, string, string, string];
        options[oIdx] = value;
        return { ...q, options };
      }),
    );
  };

  if (loading) {
    return (
      <AdminShell>
        <p className="game-font text-lg font-bold text-[var(--kid-muted)]">Loading quiz…</p>
      </AdminShell>
    );
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-4xl">
        <Link href="/teacher/dashboard" className="text-sm font-bold text-[var(--kid-purple)] hover:underline">
          ← Back to dashboard
        </Link>

        <header className="kid-card mb-6 mt-4 p-6 sm:p-8">
          <p className="kid-pill mb-3 border-2 border-[#e9d5ff] bg-[#faf5ff] text-[#6d28d9]">
            🎯 Standalone quiz
          </p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Quiz title"
            className="game-font w-full bg-transparent text-3xl font-bold text-[var(--kid-text)] outline-none placeholder:text-gray-300"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="mt-2 w-full bg-transparent font-semibold text-[var(--kid-muted)] outline-none placeholder:text-gray-400"
          />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-[var(--kid-text)]">
                Reference subject
              </span>
              <select
                value={referenceCourseId}
                onChange={(e) => {
                  setReferenceCourseId(e.target.value);
                  setReferenceLessonId("");
                }}
                className="w-full rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 font-semibold text-[var(--kid-text)] outline-none focus:border-[#a78bfa]"
              >
                <option value="">Select subject</option>
                {referenceCourses.map((course) => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-bold text-[var(--kid-text)]">
                Reference lesson
              </span>
              <select
                value={referenceLessonId}
                onChange={(e) => setReferenceLessonId(e.target.value)}
                disabled={!referenceCourseId}
                className="w-full rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 font-semibold text-[var(--kid-text)] outline-none focus:border-[#a78bfa] disabled:bg-gray-100 disabled:opacity-60"
              >
                <option value="">Select lesson</option>
                {referenceCourses
                  .find((course) => course.id === referenceCourseId)
                  ?.lessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                  ))}
              </select>
            </label>
          </div>
        </header>

        <div className="mb-6 flex gap-2 rounded-2xl bg-white/70 p-2">
          {(["questions", "invites"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-2 text-sm font-extrabold capitalize ${
                tab === t
                  ? "bg-[#ffedd5] text-[#c2410c]"
                  : "text-[var(--kid-muted)] hover:bg-white"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {message && (
          <p className="mb-4 rounded-xl border-2 border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            {message}
          </p>
        )}

        {tab === "questions" && (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="kid-card p-5 sm:p-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="kid-pill bg-[#ede9fe] text-[#5b21b6]">Question {idx + 1}</span>
                  <button
                    onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-sm font-bold text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(idx, { type: e.target.value as QuestionType })}
                    className="rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 text-sm font-semibold text-[var(--kid-text)]"
                  >
                    <option value="text">Text</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                  </select>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(idx, { points: Number(e.target.value) })}
                    placeholder="Points"
                    className="rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 text-sm font-semibold text-[var(--kid-text)]"
                  />
                  <div className="rounded-xl border-2 border-[#e9d5ff] bg-[#faf5ff] px-3 py-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-[var(--kid-text)]">
                      <input
                        type="checkbox"
                        checked={(q.timeLimit ?? 0) > 0}
                        onChange={(e) => updateQuestion(idx, { timeLimit: e.target.checked ? 30 : 0 })}
                      />
                      Timer
                    </label>
                    {(q.timeLimit ?? 0) > 0 && (
                      <input
                        type="number"
                        min={5}
                        max={600}
                        value={q.timeLimit}
                        onChange={(e) => updateQuestion(idx, { timeLimit: Number(e.target.value) })}
                        placeholder="Seconds"
                        className="mt-2 w-full rounded-lg border border-[#e9d5ff] bg-white px-2 py-1 text-sm text-[var(--kid-text)] outline-none"
                      />
                    )}
                  </div>
                  <select
                    value={q.correctIndex}
                    onChange={(e) => updateQuestion(idx, { correctIndex: Number(e.target.value) })}
                    className="rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 text-sm font-semibold text-[var(--kid-text)]"
                  >
                    <option value={0}>Answer: A</option>
                    <option value={1}>Answer: B</option>
                    <option value={2}>Answer: C</option>
                    <option value={3}>Answer: D</option>
                  </select>
                </div>

                <textarea
                  value={q.question}
                  onChange={(e) => updateQuestion(idx, { question: e.target.value })}
                  placeholder="Question text..."
                  rows={2}
                  className="mb-3 w-full rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 font-semibold text-[var(--kid-text)]"
                />

                {(q.type === "image" || q.type === "video" || q.type === "audio") && (
                  <div className="mb-3 rounded-2xl border-2 border-[#e9d5ff] bg-[#faf5ff] p-3">
                    <MediaUploader
                      type={q.type}
                      value={q.mediaUrl}
                      onChange={(mediaUrl) => updateQuestion(idx, { mediaUrl })}
                      label={`${q.type[0].toUpperCase()}${q.type.slice(1)} for this question`}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      value={opt}
                      onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                      placeholder={`Option ${["A", "B", "C", "D"][oIdx]}`}
                      className="rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 text-sm font-semibold text-[var(--kid-text)]"
                    />
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setQuestions((prev) => [...prev, { ...newQuestion(prev.length), id: `new-${prev.length}` }])}
              className="kid-card w-full border-dashed py-3 font-extrabold text-[var(--kid-purple)] hover:bg-[#faf5ff]"
            >
              + Add Question
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="kid-btn-primary w-full justify-center py-3 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        )}

        {tab === "invites" && (
          <div className="space-y-6">
            <form onSubmit={handleInvite} className="kid-card p-5 sm:p-6">
              <h3 className="game-font mb-3 text-xl font-bold text-[var(--kid-text)]">Share quiz</h3>
              <p className="mb-3 text-sm font-semibold text-[var(--kid-muted)]">
                Enter emails separated by commas or new lines. Each member receives a unique invite link.
              </p>
              <textarea
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="member1@email.com, member2@email.com"
                rows={4}
                className="mb-3 w-full rounded-xl border-2 border-[#e9d5ff] bg-white px-3 py-2 text-[var(--kid-text)] outline-none focus:border-[#a78bfa]"
              />
              <button
                type="submit"
                disabled={inviting || questions.length === 0}
                className="kid-btn-primary px-6 py-2.5 disabled:opacity-50"
              >
                {inviting ? "Sending..." : "Send Invites"}
              </button>
              {questions.length === 0 && (
                <p className="mt-2 text-sm font-semibold text-orange-700">Add and save questions before sharing.</p>
              )}
            </form>

            {inviteResults.length > 0 && (
              <div className="kid-card p-5">
                <h3 className="game-font mb-3 text-lg font-bold">Invite links</h3>
                {inviteResults.map((r) => (
                  <div key={r.email} className="mb-3 text-sm">
                    <p className="font-semibold text-[var(--kid-text)]">{r.email} {r.sent ? "✉️ sent" : "📋 link only"}</p>
                    <p className="break-all text-[var(--kid-muted)]">{r.inviteLink}</p>
                  </div>
                ))}
              </div>
            )}

            {invitations.length > 0 && (
              <div className="kid-card p-5">
                <h3 className="game-font mb-3 text-lg font-bold">Invited learners</h3>
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="font-semibold text-[var(--kid-text)]">{inv.email}</span>
                      <span className="text-[var(--kid-muted)]">
                        {inv.status}
                        {inv.status === "completed" && ` — ${inv.score}/${inv.maxScore} pts`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
