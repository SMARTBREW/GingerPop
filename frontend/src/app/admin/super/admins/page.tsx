"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/layout/AdminShell";
import { PaginatedList } from "@/components/ui/PaginatedList";

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
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<ManagedAdmin | null>(null);
  const [editForm, setEditForm] = useState({ name: "", email: "", active: true });
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
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

  const openEdit = (admin: ManagedAdmin) => {
    setEditing(admin);
    setEditForm({ name: admin.name, email: admin.email, active: admin.active });
    setMessage(null);
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSavingEdit(true);
    setMessage(null);

    const res = await fetch(`/api/super/admins/${editing.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        active: editForm.active,
      }),
    });
    const data = await res.json();
    setSavingEdit(false);

    if (res.ok) {
      setEditing(null);
      setMessage({ type: "success", text: "Administrator updated." });
      loadAdmins();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to update administrator." });
    }
  };

  const handleDelete = async (admin: ManagedAdmin) => {
    const ok = window.confirm(
      `Delete ${admin.name} (${admin.email})?\n\nThis permanently removes their administrator login. This cannot be undone.`,
    );
    if (!ok) return;

    setDeletingId(admin.id);
    setMessage(null);
    const res = await fetch(`/api/super/admins/${admin.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await res.json();
    setDeletingId(null);

    if (res.ok) {
      if (editing?.id === admin.id) setEditing(null);
      setMessage({ type: "success", text: `Deleted ${admin.email}.` });
      loadAdmins();
    } else {
      setMessage({ type: "error", text: data.error ?? "Failed to delete administrator." });
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
              Passwords can only be changed by the account owner after login — not by other admins.
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
                <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">
                  Temporary password
                </span>
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
                Edit name/email, activate/deactivate, or delete — passwords stay with the account owner
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
              <PaginatedList
                items={admins}
                pageSize={5}
                keyExtractor={(a) => a.id}
                renderItem={(a) => (
                  <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-5">
                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span className="hidden text-2xl sm:inline" aria-hidden>
                        👩‍🏫
                      </span>
                      <div className="min-w-0 flex-1">
                        <span
                          className="kid-pill !text-xs"
                          style={{
                            background: a.active ? "#dcfce7" : "#fef3c7",
                            color: a.active ? "#166534" : "#92400e",
                          }}
                        >
                          {a.active ? "Active" : "Inactive"}
                        </span>
                        <h3 className="game-font mt-1.5 text-lg font-bold text-[var(--kid-text)] sm:text-xl">
                          {a.name}
                        </h3>
                        <p className="mt-1 break-all text-sm font-semibold text-[var(--kid-muted)]">{a.email}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(a)}
                        className="kid-btn-secondary !px-4 !py-2 !text-sm"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleActive(a.id, a.active)}
                        className="kid-btn-secondary !px-4 !py-2 !text-sm"
                      >
                        {a.active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        disabled={deletingId === a.id}
                        onClick={() => void handleDelete(a)}
                        className="rounded-full border-2 border-red-200 bg-red-50 px-4 py-2 text-sm font-extrabold text-red-700 hover:bg-red-100 disabled:opacity-50"
                      >
                        {deletingId === a.id ? "Deleting…" : "Delete"}
                      </button>
                    </div>
                  </div>
                )}
              />
            )}
          </section>

          {editing && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-admin-title"
            >
              <div className="kid-card w-full max-w-md p-6 shadow-xl sm:p-8">
                <h2
                  id="edit-admin-title"
                  className="game-font text-2xl font-bold text-[var(--kid-text)]"
                >
                  Edit administrator
                </h2>
                <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
                  You can update name and email. Password can only be changed by that administrator
                  after they sign in.
                </p>

                <form onSubmit={(e) => void handleEditSave(e)} className="mt-5 space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">
                      Full name
                    </span>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      required
                      className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">
                      Email
                    </span>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                      className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
                    />
                  </label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm font-bold text-[var(--kid-text)]">
                    <input
                      type="checkbox"
                      checked={editForm.active}
                      onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-[var(--kid-purple)]"
                    />
                    Account active
                  </label>

                  <div className="flex flex-wrap gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditing(null)}
                      className="kid-btn-secondary !px-4 !py-2 !text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={savingEdit}
                      className="kid-btn-primary !px-4 !py-2 !text-sm"
                    >
                      {savingEdit ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}
    </AdminShell>
  );
}
