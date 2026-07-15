"use client";

import { useState } from "react";
import Link from "next/link";
import { KidZone } from "@/components/layout/KidZone";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader, SiteHeaderLink } from "@/components/layout/SiteHeader";

export default function TeacherLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Invalid credentials");
      window.location.href = "/teacher/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KidZone className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="kid-blob -left-12 top-20 h-36 w-36 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob right-0 top-10 h-28 w-28 bg-[#fdba74]" aria-hidden />

      <SiteHeader actions={<SiteHeaderLink href="/login">← Back</SiteHeaderLink>} />

      <main className="page-shell relative flex flex-1 justify-center py-10 sm:py-14">
        <div className="kid-card w-full max-w-md p-7 sm:p-9">
          <span className="kid-pill border-2 border-[#fed7aa] bg-[#fff7ed] text-[#c2410c]">
            👩‍🏫 Teacher
          </span>
          <h1 className="game-font mt-4 text-3xl font-bold text-[var(--kid-text)]">Teacher login</h1>
          <p className="mt-2 text-sm font-semibold text-[var(--kid-muted)]">
            Sign in to create courses and invite learners.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="teacher@school.com"
                className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-bold text-[var(--kid-text)]">Password</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border-2 border-[#fed7aa] bg-white px-4 py-3 text-base font-semibold text-[var(--kid-text)] outline-none focus:border-[#ea580c]"
              />
            </label>

            {error && (
              <div className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="kid-btn-primary w-full !mt-2">
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-[var(--kid-muted)]">
            Student instead?{" "}
            <Link href="/login/student" className="font-extrabold text-[var(--kid-purple)]">
              Student login
            </Link>
          </p>
        </div>
      </main>

      <SiteFooter />
    </KidZone>
  );
}
