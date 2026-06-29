"use client";

import { useState } from "react";
import Link from "next/link";
import { BrandName } from "@/components/BrandName";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

export default function AdminLoginPage() {
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
      // Full navigation so the auth cookie is included on the next request
      window.location.href = "/admin/dashboard";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Brand panel */}
      <div className="hidden w-[45%] flex-col justify-between bg-[var(--sidebar)] p-10 lg:flex xl:p-12">
        <Link href="/" className="text-xl font-semibold text-white">
          <BrandName />
        </Link>
        <div>
          <blockquote className="text-xl font-medium leading-relaxed text-gray-200">
            &ldquo;Structured learning paths with built-in assessments — designed for teams
            that take training seriously.&rdquo;
          </blockquote>
          <p className="mt-4 text-base text-gray-400">Admin Console</p>
        </div>
        <p className="text-sm text-gray-500">Secure access for authorized administrators only.</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col justify-center px-4 py-10 sm:px-6 sm:py-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="text-xl font-semibold text-gray-900">
              <BrandName />
            </Link>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Sign in</h1>
          <p className="mt-2 text-base text-gray-600">Enter your credentials to access the console.</p>

          <Card className="mt-8 !p-0 !shadow-none !border-0 bg-transparent" padding={false}>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Email address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                required
                autoComplete="email"
              />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Card>

          <p className="mt-8 text-center text-sm text-gray-500">
            <Link href="/" className="font-medium text-[var(--primary)] hover:underline">
              ← Return to website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
