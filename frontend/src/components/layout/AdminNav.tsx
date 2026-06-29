import Link from "next/link";
import { BrandName } from "@/components/BrandName";

interface AdminNavProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
}

export function AdminNav({ title, subtitle, badge, children }: AdminNavProps) {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="page-container flex flex-wrap items-center justify-between gap-4 !py-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            {badge && <span className="badge badge-blue">{badge}</span>}
          </div>
          {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">{children}</div>
      </div>
    </header>
  );
}

export function AdminNavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className="btn-secondary !py-2 !px-3.5 !text-sm">
      {children}
    </Link>
  );
}

export function AdminLogo() {
  return (
    <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
      <BrandName />
    </Link>
  );
}
