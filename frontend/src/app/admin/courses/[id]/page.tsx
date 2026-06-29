"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AdminShell, useAdminSession } from "@/components/layout/AdminShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { MediaUploader } from "@/components/media/MediaUploader";
import {
  canAddAnotherLesson,
  canPublishCourse,
  getLessonQuestions,
  isQuizOnlyCourse,
  lessonHasAssessment,
} from "@/lib/course-rules";
import {
  ContentType,
  CourseQuizQuestion,
  EMPTY_LESSON,
  EMPTY_QUIZ_QUESTION,
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
}

const LESSON_TYPES: ContentType[] = ["text", "video", "image", "audio"];
const QUIZ_TYPES: ContentType[] = ["text", "video", "audio", "image"];
const OPTION_LABELS = ["A", "B", "C", "D"] as const;

type LessonRow = Lesson & { id: string };
type QuestionRow = CourseQuizQuestion & { id: string };

function QuestionEditor({
  q,
  idx,
  onChange,
  onRemove,
}: {
  q: QuestionRow;
  idx: number;
  onChange: (updated: QuestionRow) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-gray-100 bg-gray-50/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Question {idx + 1}</span>
        <Button
          variant="ghost"
          size="sm"
          className="!text-red-600 hover:!bg-red-50"
          onClick={onRemove}
        >
          Remove
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          label="Type"
          value={q.type}
          onChange={(e) => onChange({ ...q, type: e.target.value as ContentType })}
        >
          {QUIZ_TYPES.map((t) => (
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
          ))}
        </Select>
        <Input
          label="Points"
          type="number"
          min={1}
          value={q.points}
          onChange={(e) => onChange({ ...q, points: Number(e.target.value) })}
        />
        <Input
          label="Time (sec)"
          type="number"
          min={5}
          value={q.timeLimit}
          onChange={(e) => onChange({ ...q, timeLimit: Number(e.target.value) })}
        />
        <Select
          label="Correct"
          value={q.correctIndex}
          onChange={(e) => onChange({ ...q, correctIndex: Number(e.target.value) })}
        >
          {OPTION_LABELS.map((label, i) => (
            <option key={label} value={i}>
              Option {label}
            </option>
          ))}
        </Select>
      </div>
      <div className="mt-3">
        <Textarea
          label="Question"
          value={q.question}
          onChange={(e) => onChange({ ...q, question: e.target.value })}
          rows={2}
        />
      </div>
      {(q.type === "image" || q.type === "video" || q.type === "audio") && (
        <div className="mt-3">
          <MediaUploader
            type={q.type}
            value={q.mediaUrl}
            onChange={(url) => onChange({ ...q, mediaUrl: url })}
            label={
              q.type === "audio"
                ? "Voice / audio"
                : q.type === "video"
                  ? "Video"
                  : "Image"
            }
          />
        </div>
      )}
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {q.options.map((opt, oIdx) => (
          <Input
            key={oIdx}
            label={`Option ${OPTION_LABELS[oIdx]}`}
            value={opt}
            onChange={(e) => {
              const options = [...q.options] as [string, string, string, string];
              options[oIdx] = e.target.value;
              onChange({ ...q, options });
            }}
          />
        ))}
      </div>
    </div>
  );
}

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const admin = useAdminSession();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(false);
  const [lessons, setLessons] = useState<LessonRow[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuestionRow[]>([]);
  const [invitations, setInvitations] = useState<InvitationRow[]>([]);
  const [emailInput, setEmailInput] = useState("");
  const [inviteResults, setInviteResults] = useState<
    { email: string; sent: boolean; inviteLink: string }[]
  >([]);
  const [tab, setTab] = useState<"content" | "invites">("content");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const loadCourse = useCallback(() => {
    return fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/admin/dashboard");
          return;
        }
        setTitle(data.course.title);
        setDescription(data.course.description ?? "");
        setPublished(data.course.published);
        setLessons(
          data.course.lessons.map((l: Lesson & { id: string }) => ({
            ...l,
            id: l.id,
          })),
        );
        setQuizQuestions(
          data.course.quizQuestions.map((q: CourseQuizQuestion & { id: string }) => ({
            ...q,
            id: q.id,
          })),
        );
        setInvitations(data.invitations ?? []);
        setLoading(false);
      });
  }, [id, router]);

  useEffect(() => {
    loadCourse();
  }, [loadCourse]);

  const quizOnly = isQuizOnlyCourse(lessons, quizQuestions);
  const publishCheck = canPublishCourse(lessons, quizQuestions);
  const canAddLesson = canAddAnotherLesson(lessons, quizQuestions);

  const updateQuestion = (questionId: string, updated: QuestionRow) => {
    setQuizQuestions((prev) => prev.map((q) => (q.id === questionId ? updated : q)));
  };

  const removeQuestion = (questionId: string) => {
    setQuizQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const addQuestionForLesson = (lessonId: string) => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        ...EMPTY_QUIZ_QUESTION,
        id: `new-q-${Date.now()}`,
        lessonId,
        order: prev.length,
      },
    ]);
  };

  const addQuizOnlyQuestion = () => {
    setQuizQuestions((prev) => [
      ...prev,
      {
        ...EMPTY_QUIZ_QUESTION,
        id: `new-q-${Date.now()}`,
        order: prev.length,
      },
    ]);
  };

  const addLesson = () => {
    if (!canAddLesson) return;
    // Switching from quiz-only to lesson-based: remove unlinked questions
    if (lessons.length === 0) {
      setQuizQuestions((prev) => prev.filter((q) => q.lessonId));
    }
    const newId = `new-${Date.now()}`;
    setLessons((prev) => [
      ...prev,
      {
        ...EMPTY_LESSON,
        id: newId,
        order: prev.length,
      },
    ]);
  };

  const removeLesson = (lessonId: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
    setQuizQuestions((prev) => prev.filter((q) => q.lessonId !== lessonId));
  };

  const handleSave = async () => {
    if (published && !publishCheck.valid) {
      setMessage({ type: "error", text: publishCheck.error ?? "Invalid course structure." });
      return;
    }

    setSaving(true);
    setMessage(null);
    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        published,
        lessons: lessons.map((l, idx) => ({
          id: l.id,
          type: l.type,
          title: l.title,
          content: l.content,
          mediaUrl: l.mediaUrl,
          mediaCaption: l.mediaCaption,
          order: idx,
        })),
        quizQuestions: quizQuestions.map((q, idx) => ({
          id: q.id.startsWith("new-") ? undefined : q.id,
          lessonId: q.lessonId,
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
    const data = await res.json();
    setSaving(false);

    if (res.ok) {
      setMessage({ type: "success", text: "Changes saved successfully." });
      await loadCourse();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to save changes." });
    }
  };

  const handlePublishToggle = (checked: boolean) => {
    if (checked && !publishCheck.valid) {
      setMessage({ type: "error", text: publishCheck.error ?? "Cannot publish yet." });
      return;
    }
    setPublished(checked);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = emailInput
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (emails.length === 0) return;

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

    if (res.ok) {
      setInviteResults(data.results);
      setEmailInput("");
      setMessage({
        type: "success",
        text: `Invitations processed for ${data.results.length} recipient(s).`,
      });
      const refresh = await fetch(`/api/courses/${id}`).then((r) => r.json());
      setInvitations(refresh.invitations ?? []);
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to send invitations." });
    }
  };

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
      <div className="sticky top-14 z-20 border-b border-gray-200 bg-white/95 px-4 py-4 backdrop-blur-sm sm:px-6 lg:top-0 lg:px-8">
        <PageHeader
          breadcrumbs={[
            { label: "Courses", href: "/admin/dashboard" },
            { label: title || "Untitled course" },
          ]}
          title=""
          actions={
            <div className="flex items-center gap-3">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => handlePublishToggle(e.target.checked)}
                  className="rounded border-gray-300 text-[var(--primary)] focus:ring-[var(--primary)]"
                />
                Published
              </label>
              {tab === "content" && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
                </Button>
              )}
            </div>
          }
        />
        <div className="mt-2 space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Course title"
            className="w-full border-0 bg-transparent text-2xl font-semibold tracking-tight text-gray-900 placeholder:text-gray-300 focus:outline-none sm:text-3xl"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a brief description..."
            rows={2}
            className="w-full resize-none border-0 bg-transparent text-base text-gray-600 placeholder:text-gray-300 focus:outline-none"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={published ? "success" : "neutral"}>
              {published ? "Published" : "Draft"}
            </Badge>
            {quizOnly && <Badge variant="primary">Quiz only</Badge>}
            <span className="text-sm text-gray-500">
              {lessons.length} lessons · {quizQuestions.length} assessments
            </span>
          </div>
        </div>
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

        {!publishCheck.valid && tab === "content" && (
          <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-base text-amber-900">
            {publishCheck.error}
          </div>
        )}

        <Tabs
          tabs={[
            { id: "content" as const, label: "Content" },
            { id: "invites" as const, label: `Learners (${invitations.length})` },
          ]}
          active={tab}
          onChange={setTab}
          className="mb-8"
        />

        {tab === "content" && (
          <div className="space-y-6">
            {lessons.length === 0 ? (
              <>
                <Card>
                  <CardHeader
                    title="Quiz-only course"
                    description="Publish a standalone assessment with no lessons. Add questions below, then publish and invite learners."
                  />
                  {quizQuestions.length === 0 ? (
                    <EmptyState
                      title="No assessment questions"
                      description="Add at least one question to create a quiz-only course."
                      action={
                        <Button variant="secondary" onClick={addQuizOnlyQuestion}>
                          Add question
                        </Button>
                      }
                    />
                  ) : (
                    <div className="space-y-4">
                      {quizQuestions.map((q, idx) => (
                        <QuestionEditor
                          key={q.id}
                          q={q}
                          idx={idx}
                          onChange={(updated) => updateQuestion(q.id, updated)}
                          onRemove={() => removeQuestion(q.id)}
                        />
                      ))}
                    </div>
                  )}
                  {quizQuestions.length > 0 && (
                    <Button variant="outline" className="mt-4 w-full border-dashed" onClick={addQuizOnlyQuestion}>
                      Add question
                    </Button>
                  )}
                </Card>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-[var(--background)] px-3 text-gray-400">or</span>
                  </div>
                </div>

                <Card>
                  <CardHeader
                    title="Course with lessons"
                    description="Each lesson requires at least one assessment before you can add the next lesson."
                  />
                  <Button onClick={addLesson}>Add first lesson</Button>
                </Card>
              </>
            ) : (
              <>
                {lessons.map((lesson, idx) => {
                  const lessonQs = getLessonQuestions(quizQuestions, lesson.id);
                  const hasAssessment = lessonHasAssessment(quizQuestions, lesson.id);
                  return (
                    <Card key={lesson.id}>
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                          Lesson {idx + 1}
                        </span>
                        <div className="flex items-center gap-2">
                          {!hasAssessment && (
                            <Badge variant="warning">Assessment required</Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="!text-red-600 hover:!bg-red-50"
                            onClick={() => removeLesson(lesson.id)}
                          >
                            Remove lesson
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <Select
                          label="Content type"
                          value={lesson.type}
                          onChange={(e) =>
                            setLessons((prev) =>
                              prev.map((l) =>
                                l.id === lesson.id
                                  ? { ...l, type: e.target.value as ContentType }
                                  : l,
                              ),
                            )
                          }
                        >
                          {LESSON_TYPES.map((t) => (
                            <option key={t} value={t}>
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                          ))}
                        </Select>
                        <Input
                          label="Title"
                          value={lesson.title}
                          onChange={(e) =>
                            setLessons((prev) =>
                              prev.map((l) =>
                                l.id === lesson.id ? { ...l, title: e.target.value } : l,
                              ),
                            )
                          }
                          placeholder="Lesson title"
                        />
                      </div>

                      {(lesson.type === "video" ||
                        lesson.type === "audio" ||
                        lesson.type === "image") && (
                        <div className="mt-4">
                          <MediaUploader
                            type={lesson.type}
                            value={lesson.mediaUrl}
                            onChange={(url) =>
                              setLessons((prev) =>
                                prev.map((l) =>
                                  l.id === lesson.id ? { ...l, mediaUrl: url } : l,
                                ),
                              )
                            }
                            label={
                              lesson.type === "audio"
                                ? "Record or upload audio"
                                : lesson.type === "video"
                                  ? "Record or upload video"
                                  : "Upload image"
                            }
                          />
                        </div>
                      )}

                      <div className="mt-4">
                        <Textarea
                          label="Content"
                          value={lesson.content ?? ""}
                          onChange={(e) =>
                            setLessons((prev) =>
                              prev.map((l) =>
                                l.id === lesson.id ? { ...l, content: e.target.value } : l,
                              ),
                            )
                          }
                          rows={4}
                        />
                      </div>

                      <div className="mt-6 border-t border-gray-100 pt-6">
                        <div className="mb-4 flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">
                              Lesson assessment
                            </h3>
                            <p className="text-xs text-gray-500">
                              Required before adding the next lesson.
                            </p>
                          </div>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => addQuestionForLesson(lesson.id)}
                          >
                            Add question
                          </Button>
                        </div>

                        {lessonQs.length === 0 ? (
                          <p className="rounded-md border border-dashed border-amber-200 bg-amber-50/50 px-4 py-3 text-sm text-amber-800">
                            Add at least one assessment question for this lesson.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {lessonQs.map((q, qIdx) => (
                              <QuestionEditor
                                key={q.id}
                                q={q}
                                idx={qIdx}
                                onChange={(updated) => updateQuestion(q.id, updated)}
                                onRemove={() => removeQuestion(q.id)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}

                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  disabled={!canAddLesson}
                  onClick={addLesson}
                >
                  {canAddLesson
                    ? "Add another lesson"
                    : "Add assessment to the last lesson first"}
                </Button>
              </>
            )}
          </div>
        )}

        {tab === "invites" && (
          <div className="space-y-6">
            <Card>
              <CardHeader
                title="Invite learners"
                description={
                  admin
                    ? `Invitations are valid for 2 weeks. They will be sent by ${admin.name} (${admin.email}). ${
                        quizOnly
                          ? "Learners go straight to the assessment."
                          : "Each lesson includes its own assessment."
                      }`
                    : "Invitation links expire after 2 weeks. Re-send to issue a fresh link."
                }
              />
              <form onSubmit={handleInvite} className="space-y-4">
                <Textarea
                  label="Email addresses"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="member@company.com"
                  rows={4}
                  hint="Separate multiple addresses with commas or new lines."
                />
                <Button type="submit" disabled={inviting || !published || !publishCheck.valid}>
                  {inviting ? "Sending..." : "Send invitations"}
                </Button>
                {!published && (
                  <p className="text-sm text-amber-700">Publish the course before inviting.</p>
                )}
                {published && !publishCheck.valid && (
                  <p className="text-sm text-amber-700">{publishCheck.error}</p>
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
                        <Badge variant={r.sent ? "success" : "warning"}>
                          {r.sent ? "Email sent" : "Link generated"}
                        </Badge>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {invitations.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50/80">
                        <td className="px-4 py-4 text-base text-gray-900 sm:px-6">{inv.email}</td>
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
                          {inv.phase === "completed" ? `${inv.score}/${inv.maxScore}` : "—"}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                title="No learners enrolled"
                description="Invite learners once the course is published and valid."
              />
            )}
          </div>
        )}
      </div>
    </AdminShell>
  );
}
