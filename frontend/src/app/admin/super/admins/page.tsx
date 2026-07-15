"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";

interface ManagedAdmin {
  id: string;
  name: string;
  email: string;
  active: boolean;
}

export default function SuperAdminsPage() {
  const router = useRouter();
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  const loadAdmins = () => {
    fetch("/api/super/admins", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.push("/teacher/dashboard");
          return;
        }
        setAdmins(data.admins ?? []);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadAdmins();
  }, [router]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage(null);

    const res = await fetch("/api/super/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setCreating(false);

    if (res.ok) {
      setForm({ name: "", email: "", password: "" });
      setMessage({ type: "success", text: "Administrator account created." });
      loadAdmins();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to create administrator." });
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    await fetch(`/api/super/admins/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ active: !active }),
    });
    loadAdmins();
  };

  return (
    <AdminShell>
      {loading ? (
        <p className="game-font text-lg font-bold text-[var(--kid-muted)]">Loading administrators…</p>
      ) : (
        <>
          <section
            className="kid-card mb-8 overflow-hidden p-6 sm:p-8"
            style={{ background: "linear-gradient(135deg, #fff7ed, #ede9fe)" }}
          >
            <p className="kid-pill mb-3 border-2 border-[#fed7aa] bg-white text-[#c2410c]">👩‍🏫 Administrators</p>
            <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">Administrators</h1>
            <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">
              Provision and manage teacher accounts that can create courses and invite learners.
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
            <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">Create administrator</h2>
            <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
              New accounts can create courses, manage content, and invite learners.
            </p>
            <form onSubmit={handleCreate} className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Full name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Jane Smith"
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
                  placeholder="jane@organization.com"
                  className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                />
              </label>
              <label className="block sm:col-span-2 sm:max-w-sm">
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" disabled={creating} className="kid-btn-primary !px-5 !py-3 !text-sm">
                  {creating ? "Creating..." : "Create administrator"}
                </button>
              </div>
            </form>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="game-font text-2xl font-bold text-[var(--kid-text)]">Active accounts</h2>
              <p className="mt-1 text-sm font-semibold text-[var(--kid-muted)]">
                Activate or deactivate administrator access
              </p>
            </div>

            {admins.length === 0 ? (
              <div className="kid-card p-8 text-center sm:p-10">
                <p className="text-5xl" aria-hidden>
                  👩‍🏫
                </p>
                <p className="game-font mt-4 text-2xl font-bold text-[var(--kid-text)]">No administrators</p>
                <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-[var(--kid-muted)]">
                  Create the first administrator account to delegate course management.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {admins.map((a) => (
                  <div key={a.id} className="kid-card flex flex-col p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <span
                          className="kid-pill"
                          style={{
                            background: a.active ? "#dcfce7" : "#fef3c7",
                            color: a.active ? "#166534" : "#92400e",
                          }}
                        >
                          {a.active ? "Active" : "Inactive"}
                        </span>
                        <h3 className="game-font mt-3 text-xl font-bold text-[var(--kid-text)]">{a.name}</h3>
                        <p className="mt-1 break-all text-sm font-semibold text-[var(--kid-muted)]">{a.email}</p>
                      </div>
                      <span className="text-3xl" aria-hidden>
                        👩‍🏫
                      </span>
                    </div>
                    <div className="mt-auto pt-5">
                      <button
                        type="button"
                        onClick={() => toggleActive(a.id, a.active)}
                        className="kid-btn-secondary !px-4 !py-2 !text-sm"
                      >
                        {a.active ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </AdminShell>
  );
}
