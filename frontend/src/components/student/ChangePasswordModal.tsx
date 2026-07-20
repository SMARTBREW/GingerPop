"use client";

import { useState } from "react";

interface ChangePasswordModalProps {
  onClose: () => void;
}

export function ChangePasswordModal({ onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/student/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not change password");
      setSuccess(true);
      setTimeout(onClose, 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change password");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <div className="kid-card w-full max-w-md p-6 shadow-xl sm:p-8">
        <h2
          id="change-password-title"
          className="game-font text-2xl font-bold text-[var(--kid-text)]"
        >
          Change password
        </h2>
        <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
          Only you can change the password for this account. Teachers and admins cannot see or edit
          it.
        </p>

        {success ? (
          <p className="mt-6 text-sm font-extrabold text-emerald-700">Password updated!</p>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="mt-5 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">
                Current password
              </span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-xl border-2 border-[#bbf7d0] bg-white px-4 py-3 text-base font-semibold outline-none focus:border-[#22c55e]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">
                New password
              </span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-xl border-2 border-[#bbf7d0] bg-white px-4 py-3 text-base font-semibold outline-none focus:border-[#22c55e]"
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
                required
                autoComplete="new-password"
                className="w-full rounded-xl border-2 border-[#bbf7d0] bg-white px-4 py-3 text-base font-semibold outline-none focus:border-[#22c55e]"
              />
            </label>

            {error && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="kid-btn-secondary !px-4 !py-2 !text-sm"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="kid-btn-primary !px-4 !py-2 !text-sm">
                {loading ? "Saving…" : "Update password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
