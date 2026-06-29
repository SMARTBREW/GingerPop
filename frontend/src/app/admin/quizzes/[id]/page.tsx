"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import Link from "next/link";
import { EMPTY_QUESTION, Question, QuestionType } from "@/types/quiz";

interface InvitationRow {
  id: string;
  email: string;
  status: string;
  score: number;
  maxScore: number;
  sentAt?: string;
  completedAt?: string;
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
        setQuestions(
          data.quiz.questions.map((q: Question & { id: string }) => ({
            ...q,
            options: [...q.options] as [string, string, string, string],
          })),
        );
        setInvitations(data.invitations ?? []);
        setLoading(false);
      });
  }, [id, router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/quizzes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
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
      <main className="spotlight-bg flex min-h-screen items-center justify-center">
        <p className="text-kbc-gold-light">Loading quiz...</p>
      </main>
    );
  }

  return (
    <main className="spotlight-bg min-h-screen px-4 py-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/dashboard" className="text-sm text-kbc-gold hover:underline">
          ← Back to dashboard
        </Link>

        <header className="mt-4 mb-6">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-display text-3xl font-bold text-white outline-none"
          />
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="mt-2 w-full bg-transparent text-white/60 outline-none"
          />
        </header>

        <div className="mb-6 flex gap-2">
          {(["questions", "invites"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize ${
                tab === t ? "bg-kbc-gold text-kbc-navy" : "border border-kbc-gold/30 text-kbc-gold-light"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {message && (
          <p className="mb-4 rounded-lg border border-kbc-gold/30 bg-kbc-gold/10 px-4 py-2 text-sm text-kbc-gold-light">
            {message}
          </p>
        )}

        {tab === "questions" && (
          <div className="space-y-6">
            {questions.map((q, idx) => (
              <div key={idx} className="rounded-xl border border-kbc-gold/20 bg-kbc-blue/20 p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-kbc-gold">Question {idx + 1}</span>
                  <button
                    onClick={() => setQuestions((prev) => prev.filter((_, i) => i !== idx))}
                    className="text-sm text-red-400 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(idx, { type: e.target.value as QuestionType })}
                    className="rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-sm text-white"
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
                    className="rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-sm text-white"
                  />
                  <input
                    type="number"
                    value={q.timeLimit}
                    onChange={(e) => updateQuestion(idx, { timeLimit: Number(e.target.value) })}
                    placeholder="Seconds"
                    className="rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-sm text-white"
                  />
                  <select
                    value={q.correctIndex}
                    onChange={(e) => updateQuestion(idx, { correctIndex: Number(e.target.value) })}
                    className="rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-sm text-white"
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
                  className="mb-3 w-full rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-white"
                />

                {(q.type === "image" || q.type === "video" || q.type === "audio") && (
                  <input
                    value={q.mediaUrl ?? ""}
                    onChange={(e) => updateQuestion(idx, { mediaUrl: e.target.value })}
                    placeholder="Media URL (image / video / audio link)"
                    className="mb-3 w-full rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-sm text-white"
                  />
                )}

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {q.options.map((opt, oIdx) => (
                    <input
                      key={oIdx}
                      value={opt}
                      onChange={(e) => updateOption(idx, oIdx, e.target.value)}
                      placeholder={`Option ${["A", "B", "C", "D"][oIdx]}`}
                      className="rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-sm text-white"
                    />
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setQuestions((prev) => [...prev, { ...newQuestion(prev.length), id: `new-${prev.length}` }])}
              className="w-full rounded-xl border border-dashed border-kbc-gold/40 py-3 text-kbc-gold-light hover:bg-kbc-gold/10"
            >
              + Add Question
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full rounded-xl bg-kbc-gold py-3 font-semibold text-kbc-navy hover:bg-kbc-gold-light disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Quiz"}
            </button>
          </div>
        )}

        {tab === "invites" && (
          <div className="space-y-6">
            <form onSubmit={handleInvite} className="rounded-xl border border-kbc-gold/20 bg-kbc-blue/20 p-5">
              <h3 className="mb-3 font-semibold text-kbc-gold-light">Invite Members</h3>
              <p className="mb-3 text-sm text-white/50">
                Enter emails separated by commas or new lines. Each member receives a unique invite link.
              </p>
              <textarea
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="member1@email.com, member2@email.com"
                rows={4}
                className="mb-3 w-full rounded-lg border border-kbc-gold/30 bg-kbc-navy/60 px-3 py-2 text-white"
              />
              <button
                type="submit"
                disabled={inviting || questions.length === 0}
                className="rounded-xl bg-kbc-gold px-6 py-2.5 font-semibold text-kbc-navy hover:bg-kbc-gold-light disabled:opacity-50"
              >
                {inviting ? "Sending..." : "Send Invites"}
              </button>
              {questions.length === 0 && (
                <p className="mt-2 text-sm text-orange-400">Add and save questions before inviting.</p>
              )}
            </form>

            {inviteResults.length > 0 && (
              <div className="rounded-xl border border-kbc-gold/20 bg-white/5 p-5">
                <h3 className="mb-3 font-semibold text-kbc-gold-light">Invite Links</h3>
                {inviteResults.map((r) => (
                  <div key={r.email} className="mb-3 text-sm">
                    <p className="text-white">{r.email} {r.sent ? "✉️ sent" : "📋 link only (SMTP not configured)"}</p>
                    <p className="break-all text-white/50">{r.inviteLink}</p>
                  </div>
                ))}
              </div>
            )}

            {invitations.length > 0 && (
              <div className="rounded-xl border border-kbc-gold/20 bg-white/5 p-5">
                <h3 className="mb-3 font-semibold text-kbc-gold-light">Invited Members</h3>
                <div className="space-y-2">
                  {invitations.map((inv) => (
                    <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                      <span className="text-white">{inv.email}</span>
                      <span className="text-white/50">
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
    </main>
  );
}
