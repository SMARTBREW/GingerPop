"use client";

import Link from "next/link";
import { BrandName } from "@/components/BrandName";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { KidZone } from "@/components/layout/KidZone";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "admin";
}

interface AdminShellProps {
  children: React.ReactNode;
  /** Skip default page padding (e.g. full-bleed editor) */
  flush?: boolean;
}

function NavItem({
  href,
  label,
  icon,
  active,
  onNavigate,
}: {
  href: string;
  label: string;
  icon: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-2xl px-3 py-2.5 text-base font-extrabold transition-colors",
        active
          ? "bg-[#ffedd5] text-[#c2410c] shadow-sm"
          : "text-[var(--kid-muted)] hover:bg-white/80 hover:text-[var(--kid-text)]",
      )}
    >
      <span className="text-lg" aria-hidden>
        {icon}
      </span>
      {label}
    </Link>
  );
}

export function AdminShell({ children, flush }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (!data.admin) {
          router.push("/login/teacher");
          return;
        }
        setAdmin(data.admin);
        setLoading(false);
      })
      .catch(() => {
        router.push("/login/teacher");
      });
  }, [router]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login/teacher");
  };

  if (loading) {
    return (
      <KidZone>
        <div className="flex min-h-screen items-center justify-center game-font text-lg font-bold text-[var(--kid-muted)]">
          Loading workspace…
        </div>
      </KidZone>
    );
  }

  if (!admin) return null;

  const closeMenu = () => setMenuOpen(false);

  const sidebar = (
    <>
      <div className="flex h-16 items-center justify-between border-b-2 border-[#fed7aa]/80 px-4 lg:px-5">
        <Link
          href="/teacher/dashboard"
          className="game-font text-xl font-bold text-[var(--kid-text)]"
          onClick={closeMenu}
        >
          <BrandName />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="rounded-full p-2 text-[var(--kid-muted)] hover:bg-white/80 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-extrabold uppercase tracking-widest text-[var(--kid-muted)]">
          Workspace
        </p>
        <NavItem
          href="/teacher/dashboard"
          label="Dashboard"
          icon="🏠"
          active={
            pathname === "/teacher/dashboard" ||
            pathname === "/admin/dashboard" ||
            pathname.startsWith("/admin/courses") ||
            pathname.startsWith("/admin/quizzes")
          }
          onNavigate={closeMenu}
        />
        <NavItem
          href="/teacher/students"
          label="Students"
          icon="🎒"
          active={pathname.startsWith("/teacher/students")}
          onNavigate={closeMenu}
        />
        {admin.role === "super_admin" && (
          <NavItem
            href="/admin/super/admins"
            label="Administrators"
            icon="👩‍🏫"
            active={pathname.startsWith("/admin/super")}
            onNavigate={closeMenu}
          />
        )}
      </nav>

      <div className="border-t-2 border-[#fed7aa]/80 p-4">
        <div className="flex items-center gap-3 rounded-2xl bg-white/70 px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ffedd5] text-lg">
            👩‍🏫
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-extrabold text-[var(--kid-text)]">{admin.name}</p>
            <p className="truncate text-sm font-semibold text-[var(--kid-muted)]">{admin.email}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={logout}
          className="mt-3 w-full rounded-2xl px-3 py-2.5 text-sm font-extrabold text-[var(--kid-muted)] hover:bg-white/80 hover:text-[var(--kid-text)]"
        >
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <KidZone className="relative min-h-screen overflow-hidden">
      <div className="kid-blob pointer-events-none -left-16 top-24 h-40 w-40 bg-[var(--kid-sun)]" aria-hidden />
      <div className="kid-blob pointer-events-none right-0 top-16 h-32 w-32 bg-[#fdba74]" aria-hidden />

      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-[var(--kid-text)]/30 lg:hidden"
          onClick={closeMenu}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col border-r-2 border-[#fed7aa]/80 bg-white/90 backdrop-blur-md transition-transform duration-200 lg:w-64 lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      <div className="relative flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b-2 border-white/60 bg-white/75 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-full p-2 text-[var(--kid-text)] hover:bg-white/80"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/teacher/dashboard" className="game-font text-lg font-bold text-[var(--kid-text)]">
            <BrandName />
          </Link>
        </header>

        <main
          className={cn(
            "relative min-w-0 flex-1",
            flush ? "" : "px-4 py-6 sm:px-6 sm:py-8 lg:px-8",
          )}
        >
          {children}
        </main>
      </div>
    </KidZone>
  );
}

export function useAdminSession() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setAdmin(d.admin ?? null));
  }, []);
  return admin;
}
