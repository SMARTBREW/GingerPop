"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { PaginatedList } from "@/components/ui/PaginatedList";

interface ManagedStudent {
  id: string;
  name: string;
  email: string;
  active: boolean;
  createdAt: string;
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<ManagedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const loadStudents = useCallback(() => {
    fetch("/api/admin/students", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setMessage({ type: "error", text: data.error });
          setLoading(false);
          return;
        }
        setStudents(data.students ?? []);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ type: "error", text: "Failed to load students." });
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    const res = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);

    if (res.ok) {
      setForm({ name: "", email: "", password: "" });
      setMessage({
        type: "success",
        text: `Student created. They can sign in with ${data.student.email} and will be prompted to set a password on first login.`,
      });
      loadStudents();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to create student." });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/admin/students/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ active: !active }),
    });
    loadStudents();
  };

  return (
    <AdminShell>
      {loading ? (
        <p className="game-font text-lg font-bold text-[var(--kid-muted)]">Loading students…</p>
      ) : (
        <>
          <section
            className="kid-card mb-8 overflow-hidden p-6 sm:p-8"
            style={{ background: "linear-gradient(135deg, #fff7ed, #ecfeff)" }}
          >
            <p className="kid-pill mb-3 border-2 border-[#fed7aa] bg-white text-[#c2410c]">🎒 Students</p>
            <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">Students</h1>
            <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
              Create student login accounts so kids can sign in and open their invited courses.
            </p>
          </section>

          {message && (
            <div
              className={`mb-6 rounded-xl border-2 px-4 py-3 text-sm font-semibold ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <section className="kid-card mb-8 p-6 sm:p-8">
            <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">Create student</h2>
            <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
              They’ll use this email and temporary password on first login — we’ll ask them to set
              a new password (or keep the temporary one).
            </p>
            <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Aarav Sharma"
                  className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="student@school.com"
                  className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Temporary password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                />
              </label>
              <div className="flex items-end">
                <button type="submit" disabled={creating} className="kid-btn-primary w-full !px-5 !py-3 !text-sm sm:w-auto">
                  {creating ? "Creating..." : "Create student"}
                </button>
              </div>
            </form>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">
                All students ({students.length})
              </h2>
              <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                Enable or disable accounts anytime
              </p>
            </div>

            {students.length === 0 ? (
              <div className="kid-card p-8 text-center sm:p-10">
                <p className="text-5xl" aria-hidden>
                  📭
                </p>
                <p className="game-font mt-4 text-2xl font-bold text-[var(--kid-text)]">No students yet</p>
                <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[var(--kid-muted)]">
                  Create a student account above, then invite their email to a course.
                </p>
              </div>
            ) : (
              <PaginatedList
                items={students}
                pageSize={5}
                keyExtractor={(student) => student.id}
                renderItem={(student) => (
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="hidden text-2xl sm:inline" aria-hidden>
                        🎒
                      </span>
                      <div className="min-w-0 flex-1">
                        <span
                          className="kid-pill !text-xs"
                          style={{
                            background: student.active ? "#dcfce7" : "#fef3c7",
                            color: student.active ? "#166534" : "#92400e",
                          }}
                        >
                          {student.active ? "Active" : "Disabled"}
                        </span>
                        <h3 className="game-font mt-1.5 text-lg font-bold text-[var(--kid-text)] sm:text-xl">
                          {student.name}
                        </h3>
                        <p className="mt-1 break-all text-sm font-semibold text-[var(--kid-muted)]">
                          {student.email}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => toggleActive(student.id, student.active)}
                        className="kid-btn-secondary !px-4 !py-2 !text-sm"
                      >
                        {student.active ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                )}
              />
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
