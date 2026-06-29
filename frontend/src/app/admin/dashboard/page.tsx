"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { PageHeader, StatCard } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface CourseSummary {
  id: string;
  title: string;
  description?: string;
  published: boolean;
  lessonCount: number;
  quizCount: number;
  updatedAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetch("/api/courses")
      .then((r) => r.json())
      .then((data) => setCourses(data.courses ?? []));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);

    const res = await fetch("/api/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    const data = await res.json();
    setCreating(false);

    if (res.ok) router.push(`/admin/courses/${data.course.id}`);
  };

  const published = courses.filter((c) => c.published).length;
  const totalLessons = courses.reduce((s, c) => s + c.lessonCount, 0);

  return (
    <AdminShell>
      <PageHeader
        title="Courses"
        description="Create and manage learning programs for your organization."
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Total courses" value={courses.length} />
        <StatCard label="Published" value={published} />
        <StatCard label="Total lessons" value={totalLessons} />
      </div>

      <Card className="mb-8">
        <CardHeader
          title="New course"
          description="Start with a title — you can add lessons and assessments after."
        />
        <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              label="Course title"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Product Onboarding 2025"
              required
            />
          </div>
          <Button type="submit" disabled={creating} className="w-full shrink-0 sm:w-auto">
            {creating ? "Creating..." : "Create course"}
          </Button>
        </form>
      </Card>

      <section>
        <h2 className="mb-4 text-base font-semibold uppercase tracking-wide text-gray-500">
          All courses
        </h2>

        {courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create your first course to begin building lessons and assessments."
          />
        ) : (
          <div className="table-scroll rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                    Course
                  </th>
                  <th className="hidden px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 sm:table-cell sm:px-6">
                    Content
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium uppercase tracking-wide text-gray-500 sm:px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-4 py-4 sm:px-6">
                      <p className="text-base font-medium text-gray-900">{course.title}</p>
                      {course.description && (
                        <p className="mt-0.5 text-sm text-gray-500 line-clamp-2 sm:line-clamp-1">
                          {course.description}
                        </p>
                      )}
                    </td>
                    <td className="hidden px-4 py-4 text-base text-gray-600 sm:table-cell sm:px-6">
                      {course.lessonCount} lessons · {course.quizCount} questions
                    </td>
                    <td className="px-4 py-4 sm:px-6">
                      <Badge variant={course.published ? "success" : "neutral"}>
                        {course.published ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right sm:px-6">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Button variant="ghost" size="sm">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminShell>
  );
}
