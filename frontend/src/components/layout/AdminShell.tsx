"use client";

import Link from "next/link";
import { BrandName } from "@/components/BrandName";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";

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
  icon: React.ReactNode;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-md px-3 py-2.5 text-base font-medium transition-colors",
        active
          ? "bg-[var(--sidebar-active)] text-white"
          : "text-gray-300 hover:bg-[var(--sidebar-hover)] hover:text-white",
      )}
    >
      <span className="opacity-90">{icon}</span>
      {label}
    </Link>
  );
}

const icons = {
  dashboard: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
};

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
          router.push("/admin/login");
          return;
        }
        setAdmin(data.admin);
        setLoading(false);
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
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--background)]">
        <Spinner label="Loading workspace..." />
      </div>
    );
  }

  if (!admin) return null;

  const initials = admin.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const closeMenu = () => setMenuOpen(false);

  const sidebar = (
    <>
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4 lg:px-5">
        <Link href="/admin/dashboard" className="text-lg font-semibold text-white" onClick={closeMenu}>
          <BrandName />
        </Link>
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMenu}
          className="rounded-md p-2 text-gray-300 hover:bg-white/10 hover:text-white lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-gray-500">
          Workspace
        </p>
        <NavItem
          href="/admin/dashboard"
          label="Courses"
          icon={icons.dashboard}
          active={pathname === "/admin/dashboard" || pathname.startsWith("/admin/courses")}
          onNavigate={closeMenu}
        />
        {admin.role === "super_admin" && (
          <NavItem
            href="/admin/super/admins"
            label="Administrators"
            icon={icons.users}
            active={pathname.startsWith("/admin/super")}
            onNavigate={closeMenu}
          />
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-md px-2 py-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-medium text-white">{admin.name}</p>
            <p className="truncate text-sm text-gray-400">{admin.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="md"
          onClick={logout}
          className="mt-2 w-full !text-gray-300 hover:!bg-white/5 hover:!text-white"
        >
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {menuOpen && (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMenu}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-[min(100%,18rem)] flex-col bg-[var(--sidebar)] transition-transform duration-200 lg:w-64 lg:translate-x-0",
          menuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-[var(--border)] bg-white/95 px-4 backdrop-blur-md lg:hidden">
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="rounded-md p-2 text-gray-700 hover:bg-gray-100"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link href="/admin/dashboard" className="text-lg font-semibold text-gray-900">
            <BrandName />
          </Link>
        </header>

        <main
          className={cn(
            "min-w-0 flex-1",
            flush ? "" : "px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8",
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export function useAdminSession() {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setAdmin(d.admin ?? null));
  }, []);
  return admin;
}
