"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDynamicParam } from "@/lib/use-dynamic-param";
import { AdminShell, useAdminSession } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { SubjectContentEditor } from "@/components/admin/SubjectContentEditor";
import { SubjectSetupStep } from "@/components/admin/SubjectSetupStep";
import { canPublishCourse } from "@/lib/course-rules";
import { validateCourseContent } from "@/lib/content-limits";
import { buildCourseSnapshot, snapshotFromApiCourse } from "@/lib/course-snapshot";
import { usePagination } from "@/lib/use-pagination";
import {
  CourseQuizQuestion,
  Lesson,
} from "@/types/course";

interface InvitationRow {
  id: string;
  email: string;
  phase: string;
  score: number;
  maxScore: number;
  lessonsCompleted: number;
  sentAt?: string;
  expiresAt?: string;
  completedAt?: string;
  invitedByName?: string | null;
  inviteLink?: string;
  token?: string;
}

type LessonRow = Lesson & { id: string };
type QuestionRow = CourseQuizQuestion & { id: string };
type SetupPhase = "subject" | "build" | "invites";

export default function CourseEditorPage() {
  const id = useDynamicParam(2, "id");
  const router = useRouter();
  const admin = useAdminSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [subjectMeta, setSubjectMeta] = useState({
    emoji: "📚",
    color: "#fff7ed",
    accent: "#ea580c",
    slug: "",
  });
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuestionRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [inviteResults, setInviteResults] = useState<
    { email: string; sent: boolean; inviteLink: string; reset?: boolean }[]
  >([]);
  const [tab, setTab] = useState<"content" | "invites">("content");
  const [setupPhase, setSetupPhase] = useState<SetupPhase>("subject");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [reinvitingEmail, setReinvitingEmail] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const applyCoursePayload = useCallback(
    (course: {
      title: string;
      description?: string;
      published: boolean;
      emoji?: string;
      color?: string;
      accent?: string;
      slug?: string;
      lessons: (Lesson & { id: string })[];
      quizQuestions: (CourseQuizQuestion & { id: string })[];
    }) => {
      setTitle(course.title);
      setDescription(course.description ?? "");
      setPublished(course.published);
      setSubjectMeta({
        emoji: course.emoji || "📚",
        color: course.color || "#fff7ed",
        accent: course.accent || "#ea580c",
        slug: course.slug || "",
      });
      setLessons(
        course.lessons.map((l) => ({
          ...l,
          id: l.id,
          pages: l.pages?.length
            ? l.pages
            : l.content
              ? [{ title: l.title || "Lesson page 1", content: l.content, imageUrl: l.imageUrl || l.mediaUrl }]
              : [{ title: "Lesson page 1", content: "", imageUrl: l.imageUrl || l.mediaUrl }],
        })),
      );
      setQuizQuestions(
        course.quizQuestions.map((q) => ({
          ...q,
          id: q.id,
          optionEmojis: q.optionEmojis ?? ["🐊", "🐊", "🐊", "😐"],
        })),
      );
    },
    [],
  );

  const captureCurrentSnapshot = useCallback(
    (
      overrides?: Partial<{
        title: string;
        description: string;
        published: boolean;
        subjectMeta: typeof subjectMeta;
        lessons: LessonRow[];
        quizQuestions: QuestionRow[];
      }>,
    ) =>
      buildCourseSnapshot({
        title: overrides?.title ?? title,
        description: overrides?.description ?? description,
        published: overrides?.published ?? published,
        subjectMeta: overrides?.subjectMeta ?? subjectMeta,
        lessons: overrides?.lessons ?? lessons,
        quizQuestions: overrides?.quizQuestions ?? quizQuestions,
      }),
    [title, description, published, subjectMeta, lessons, quizQuestions],
  );

  const isDirty = savedSnapshot !== null && captureCurrentSnapshot() !== savedSnapshot;

  const loadCourse = useCallback(() => {
    return fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/admin/dashboard");
          return;
        }

        applyCoursePayload(data.course);
        setSavedSnapshot(snapshotFromApiCourse(data.course));

        setInvitations(data.invitations ?? []);
        setLoading(false);
      });
  }, [id, router, applyCoursePayload]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const publishCheck = canPublishCourse(lessons, quizQuestions);

  const persistCourse = async (
    nextLessons: LessonRow[],
    nextQuestions: QuestionRow[],
    options?: { publishedOverride?: boolean },
  ) => {
    const nextPublished = options?.publishedOverride ?? published;
    const structureCheck = canPublishCourse(nextLessons, nextQuestions);
    if (nextPublished && !structureCheck.valid) {
      setMessage({ type: "error", text: structureCheck.error ?? "Invalid course structure." });
      return false;
    }

    const limitCheck = validateCourseContent(nextLessons, nextQuestions);
    if (!limitCheck.valid) {
      setMessage({ type: "error", text: limitCheck.error });
      return false;
    }

    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        published: nextPublished,
        emoji: subjectMeta.emoji,
        color: subjectMeta.color,
        accent: subjectMeta.accent,
        slug: subjectMeta.slug,
        lessons: nextLessons.map((l, idx) => ({
          id: l.id,
          type: l.type || "text",
          title: l.title,
          content: l.content,
          mediaUrl: l.imageUrl || l.mediaUrl,
          mediaCaption: l.mediaCaption,
          order: idx,
          slug: l.slug,
          topicTitle: l.topicTitle,
          topicEmoji: l.topicEmoji,
          topicDescription: l.topicDescription,
          badgeText: l.badgeText,
          mascotSpeech: l.mascotSpeech,
          ctaText: l.ctaText,
          imageUrl: l.imageUrl || l.mediaUrl,
          videoUrl: l.pages?.length ? "" : l.videoUrl,
          audioUrl: l.pages?.length ? "" : l.audioUrl,
          audioText: l.audioText,
          pages: l.pages,
        })),
        quizQuestions: nextQuestions.map((q, idx) => ({
          id: q.id.startsWith("new-") ? undefined : q.id,
          lessonId: q.lessonId,
          type: q.type || "text",
          question: q.question,
          examples: q.examples,
          options: q.options,
          correctIndex: q.correctIndex,
          points: q.points,
          timeLimit: q.timeLimit,
          mediaUrl: q.imageUrl || q.mediaUrl,
          mediaCaption: q.mediaCaption,
          order: idx,
          subtitle: q.subtitle,
          hint: q.hint,
          explanation: q.explanation,
          wrongExplanation: q.wrongExplanation,
          optionEmojis: q.optionEmojis,
          imageUrl: q.imageUrl || q.mediaUrl,
          videoUrl: q.videoUrl,
          audioUrl: q.audioUrl,
          audioText: q.audioText,
        })),
      }),
    });
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setLastSavedAt(new Date().toLocaleTimeString());
      const fresh = await fetch(`/api/courses/${id}`).then((r) => r.json());
      if (!fresh.error) {
        applyCoursePayload(fresh.course);
        setSavedSnapshot(snapshotFromApiCourse(fresh.course));
        setInvitations(fresh.invitations ?? []);
      } else {
        setSavedSnapshot(
          captureCurrentSnapshot({ lessons: nextLessons, quizQuestions: nextQuestions }),
        );
      }
      return true;
    }
    setMessage({ type: "error", text: data.error ?? "Failed to save changes." });
    return false;
  };

  const handleSave = async (): Promise<boolean> => {
    if (!isDirty) return true;
    const ok = await persistCourse(lessons, quizQuestions);
    if (ok) {
      setMessage({ type: "success", text: "Saved to server." });
    }
    return ok;
  };

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  const goToStep = async (step: SetupPhase | "invites") => {
    if (isDirty) {
      const ok = await handleSave();
      if (!ok) return;
    }
    if (step === "invites") {
      setTab("invites");
      setSetupPhase("invites");
      return;
    }
    setTab("content");
    setSetupPhase(step);
  };

  const handlePublishToggle = (checked: boolean) => {
    if (checked && !publishCheck.valid) {
      setMessage({ type: "error", text: publishCheck.error ?? "Cannot publish yet." });
      return;
    }
    setPublished(checked);
  };

  const parseInviteEmails = (raw: string) =>
    raw
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);

  const ensurePublishedBeforeInvite = async () => {
    if (!publishCheck.valid) {
      setMessage({ type: "error", text: publishCheck.error ?? "Complete the subject before inviting." });
      return false;
    }
    if (published) {
      const saved = await persistCourse(lessons, quizQuestions);
      return saved;
    }
    const saved = await persistCourse(lessons, quizQuestions, { publishedOverride: true });
    if (saved) setPublished(true);
    return saved;
  };

  const sendInvitesToEmails = async (emails: string[]) => {
    if (emails.length === 0) {
      setMessage({ type: "error", text: "Enter at least one email address." });
      return;
    }

    const ready = await ensurePublishedBeforeInvite();
    if (!ready) return;

    setInviting(true);
    setInviteResults([]);
    setMessage(null);

    const res = await fetch(`/api/courses/${id}/invitations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails }),
    });
    const data = await res.json();
    setInviting(false);
    setReinvitingEmail(null);

    if (res.ok) {
      setInviteResults(data.results);
      setEmailInput("");
      const resetCount = (data.results as { reset?: boolean }[]).filter((r) => r.reset).length;
      const missingCount = (data.missingEmails as string[] | undefined)?.length ?? 0;
      setMessage({
        type: "success",
        text:
          resetCount > 0
            ? `Processed ${data.results.length} invite(s). ${resetCount} existing learner(s) were reset for a fresh attempt.`
            : `Invitations processed for ${data.results.length} recipient(s).`,
      });
      if (missingCount > 0) {
        setMessage((prev) =>
          prev
            ? {
                ...prev,
                text: `${prev.text} Skipped ${missingCount} email(s) because no matching student account exists.`,
              }
            : prev,
        );
      }
      const refresh = await fetch(`/api/courses/${id}`).then((r) => r.json());
      setInvitations(refresh.invitations ?? []);
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to send invitations." });
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendInvitesToEmails(parseInviteEmails(emailInput));
  };

  const inviteEmails = parseInviteEmails(emailInput);
  const canInvite =
    inviteEmails.length > 0 && publishCheck.valid && !inviting && !saving;

  const handleReinvite = async (email: string) => {
    const ok = window.confirm(
      `Re-invite ${email}?\n\nThis clears their progress, generates a new link, and emails them again.`,
    );
    if (!ok) return;
    setReinvitingEmail(email);
    await sendInvitesToEmails([email]);
  };

  const invitationPages = usePagination(invitations, 5);

  if (loading) {
    return (
      <AdminShell>
        <div className="flex items-center justify-center py-24">
          <Spinner label="Loading course..." />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell flush>
      <div className="sticky top-14 z-20 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur-sm sm:px-6 lg:top-0 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            breadcrumbs={[
              { label: "Subjects", href: "/teacher/dashboard" },
              { label: title || "Untitled subject" },
            ]}
            title=""
          />
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {saving ? (
              <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 sm:text-sm">
                Saving…
              </span>
            ) : isDirty ? (
              <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-900 sm:text-sm">
                Unsaved changes
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-900 sm:text-sm">
                All saved{lastSavedAt ? ` · ${lastSavedAt}` : ""}
              </span>
            )}
            <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-600 sm:text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => handlePublishToggle(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
              />
              Published
            </label>
            <Button onClick={() => void handleSave()} disabled={saving || !isDirty} className="min-h-[44px] !text-sm">
              {saving ? "Saving..." : "Save now"}
            </Button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {(
            [
              { id: "subject" as const, label: "1. Subject", shortLabel: "Subject" },
              { id: "build" as const, label: "2. Chapters → Lessons → Quiz", shortLabel: "Content" },
              { id: "invites" as const, label: `3. Learners (${invitations.length})`, shortLabel: "Learners" },
            ] as const
          ).map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void goToStep(step.id === "invites" ? "invites" : step.id)}
                className={`min-h-[44px] rounded-full px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm ${
                  (step.id === "invites" && tab === "invites") ||
                  (step.id !== "invites" && tab === "content" && setupPhase === step.id)
                    ? "bg-[#ffedd5] text-[#c2410c] ring-2 ring-[#fdba74]"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="hidden sm:inline">{step.label}</span>
                <span className="sm:hidden">{step.shortLabel}</span>
              </button>
              {index < 2 && (
                <span className="font-extrabold text-[#ea580c]" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="mt-2 text-xs font-semibold text-gray-500">
          Your work is stored on the server when you click Save now or Save &amp; continue. Leaving this page with unsaved changes will show a warning.
        </p>
      </div>

      <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        {message && (
          <div
            className={`mb-6 rounded-md border px-4 py-3 text-base ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        {!publishCheck.valid && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-900">
            {publishCheck.error}
          </div>
        )}

        {tab === "invites" && publishCheck.valid && !published && (
          <div className="mb-6 rounded-md border border-sky-200 bg-sky-50 px-4 py-3 text-base text-sky-900">
            This subject is still a draft. Sending invites will publish it and save your latest changes.
          </div>
        )}

        <Tabs
          tabs={[
            { id: "content" as const, label: "Content" },
            { id: "invites" as const, label: `Learners (${invitations.length})` },
          ]}
          active={tab}
          onChange={(t) => {
            setTab(t);
            if (t === "invites") setSetupPhase("invites");
            else if (setupPhase === "invites") setSetupPhase("build");
          }}
          className="mb-8 hidden"
        />

        {tab === "content" && setupPhase === "subject" && (
          <SubjectSetupStep
            title={title}
            description={description}
            meta={subjectMeta}
            lessonCount={lessons.length}
            onTitleChange={setTitle}
            onDescriptionChange={setDescription}
            onMetaChange={setSubjectMeta}
            saving={saving}
            onNext={async () => {
              const ok = await handleSave();
              if (ok) setSetupPhase("build");
            }}
          />
        )}

        {tab === "content" && setupPhase === "build" && (
          <SubjectContentEditor
            subjectTitle={title}
            subjectDescription={description}
            meta={subjectMeta}
            onMetaChange={setSubjectMeta}
            lessons={lessons}
            quizQuestions={quizQuestions}
            onLessonsChange={setLessons}
            onQuestionsChange={setQuizQuestions}
            onSave={handleSave}
            saving={saving}
            onBackToSubject={() => void goToStep("subject")}
          />
        )}

        {tab === "invites" && (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Invite learners"
                description={
                  admin
                    ? `Invitations are valid for 2 weeks. Sent by ${admin.name} (${admin.email}). Re-sending the same email resets that learner’s progress and emails a fresh link.`
                    : "Invitation links expire after 2 weeks. Re-send the same email to reset progress and issue a fresh link."
                }
              />
              <form onSubmit={handleInvite} className="space-y-4">
                <Textarea
                  label="Email addresses"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="student@school.com"
                  rows={4}
                  hint="Separate multiple addresses with commas or new lines. Same email = re-invite (reset + new link)."
                />
                <Button type="submit" disabled={!canInvite}>
                  {inviting && !reinvitingEmail
                    ? "Sending..."
                    : published
                      ? "Send / re-invite"
                      : "Publish & send invites"}
                </Button>
                {!publishCheck.valid && (
                  <p className="text-sm text-amber-700">{publishCheck.error}</p>
                )}
                {publishCheck.valid && inviteEmails.length === 0 && (
                  <p className="text-sm text-gray-500">Add at least one email address to send invites.</p>
                )}
              </form>
            </Card>

            {inviteResults.length > 0 && (
              <Card>
                <CardHeader title="Invitation links" />
                <div className="space-y-4">
                  {inviteResults.map((r) => (
                    <div key={r.email} className="rounded-md border border-gray-100 bg-gray-50 p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-900">{r.email}</p>
                        <div className="flex flex-wrap gap-2">
                          {r.reset && <Badge variant="warning">Progress reset</Badge>}
                          <Badge variant={r.sent ? "success" : "warning"}>
                            {r.sent ? "Email sent" : "Link generated"}
                          </Badge>
                        </div>
                      </div>
                      <p className="mt-2 break-all font-mono text-xs text-gray-500">
                        {r.inviteLink}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {invitations.length > 0 ? (
              <div className="table-scroll rounded-lg border border-gray-200 bg-white shadow-sm">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                  <h3 className="text-base font-semibold text-gray-900">Enrolled learners</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                        Invited by
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                        Progress
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                        Score
                      </th>
                      <th className="hidden px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 md:table-cell sm:px-6">
                        Expires
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invitationPages.pageItems.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-4 text-base text-gray-900 sm:px-6">
                          <div>{inv.email}</div>
                          {inv.inviteLink && (
                            <p className="mt-1 max-w-[220px] truncate font-mono text-xs text-gray-400" title={inv.inviteLink}>
                              {inv.inviteLink}
                            </p>
                          )}
                        </td>
                        <td className="px-4 py-4 text-base text-gray-600 sm:px-6">
                          {inv.invitedByName ?? "—"}
                        </td>
                        <td className="px-4 py-4 sm:px-6">
                          <Badge
                            variant={
                              inv.phase === "completed"
                                ? "success"
                                : inv.phase === "quiz"
                                  ? "primary"
                                  : "neutral"
                            }
                          >
                            {inv.phase}
                          </Badge>
                        </td>
                        <td className="px-4 py-4 text-base tabular-nums text-gray-600 sm:px-6">
                          {inv.maxScore > 0 ? `${inv.score}/${inv.maxScore}` : "—"}
                        </td>
                        <td className="hidden px-4 py-4 text-base text-gray-600 md:table-cell sm:px-6">
                          {inv.expiresAt
                            ? new Date(inv.expiresAt).toLocaleDateString(undefined, {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </td>
                        <td className="px-4 py-4 text-right sm:px-6">
                          <div className="flex flex-wrap items-center justify-end gap-2">
                            {inv.inviteLink && (
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(inv.inviteLink!);
                                    setMessage({ type: "success", text: `Copied link for ${inv.email}` });
                                  } catch {
                                    setMessage({ type: "error", text: "Could not copy link" });
                                  }
                                }}
                              >
                                Copy link
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              disabled={inviting || saving || !publishCheck.valid}
                              onClick={() => void handleReinvite(inv.email)}
                            >
                              {reinvitingEmail === inv.email ? "Re-inviting…" : "Re-invite"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
                  <p className="text-sm text-gray-600">
                    Showing {invitationPages.rangeStart}–{invitationPages.rangeEnd} of{" "}
                    {invitationPages.totalItems}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!invitationPages.hasPrev}
                      onClick={invitationPages.goPrev}
                    >
                      ← Prev
                    </Button>
                    <span className="text-sm font-medium text-gray-700">
                      Page {invitationPages.page} of {invitationPages.totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!invitationPages.hasNext}
                      onClick={invitationPages.goNext}
                    >
                      Next →
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="No learners enrolled"
                description="Invite learners once the subject is published and valid."
              />
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
