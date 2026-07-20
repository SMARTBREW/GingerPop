"use client";

import { useState } from "react";

interface PasswordSetupModalProps {
  studentName?: string;
  onComplete: () => void;
}

export function PasswordSetupModal({ studentName, onComplete }: PasswordSetupModalProps) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const firstName = studentName?.split(" ")[0] || "there";

  const submit = async (body: { newPassword?: string; keepTemporary?: boolean }) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/password-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not update password");
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    await submit({ newPassword });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="password-setup-title"
    >
      <div className="kid-card w-full max-w-md p-6 shadow-xl sm:p-8">
        <span className="kid-pill border-2 border-[#fde68a] bg-[#fef9c3] text-[#92400e]">
          🔐 First sign-in
        </span>
        <h2
          id="password-setup-title"
          className="game-font mt-4 text-2xl font-bold text-[var(--kid-text)] sm:text-3xl"
        >
          Hi {firstName}!
        </h2>
        <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
          Your teacher gave you a temporary password. Set a new one now, or keep using the temporary
          password — it will stay active if you skip this step.
        </p>

        <form onSubmit={(e) => void handleUpdate(e)} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">
              New password
            </span>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 6 characters"
              className="w-full rounded-xl border-2 border-[#bbf7d0] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#22c55e]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">
              Confirm new password
            </span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Type it again"
              className="w-full rounded-xl border-2 border-[#bbf7d0] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#22c55e]"
            />
          </label>

          {error && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="kid-btn-primary w-full">
            {loading ? "Saving…" : "Update password"}
          </button>
        </form>

        <button
          type="button"
          disabled={loading}
          onClick={() => void submit({ keepTemporary: true })}
          className="mt-4 w-full text-center text-sm font-extrabold text-[var(--kid-purple)] hover:underline disabled:opacity-50"
        >
          Keep temporary password for now
        </button>
      </div>
    </div>
  );
}
