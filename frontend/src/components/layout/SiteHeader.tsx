"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { BrandName } from "@/components/BrandName";

/** Small green frog mark used in the site header (matches the landing page). */
export function SiteHeaderMascot({ size = 36 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, display: "inline-block" }} aria-hidden>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: "100%", height: "100%" }}>
        <ellipse cx="40" cy="50" rx="26" ry="22" fill="#4ade80" />
        <circle cx="40" cy="32" r="24" fill="#4ade80" />
        <circle cx="32" cy="28" r="8" fill="white" />
        <circle cx="48" cy="28" r="8" fill="white" />
        <circle cx="33" cy="29" r="4" fill="#1a1a2e" />
        <circle cx="49" cy="29" r="4" fill="#1a1a2e" />
        <circle cx="34.5" cy="27.5" r="1.5" fill="white" />
        <circle cx="50.5" cy="27.5" r="1.5" fill="white" />
        <path d="M 30 38 Q 40 46 50 38" stroke="#166534" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <circle cx="26" cy="36" r="4" fill="#f9a8d4" opacity="0.6" />
        <circle cx="54" cy="36" r="4" fill="#f9a8d4" opacity="0.6" />
        <ellipse cx="16" cy="55" rx="7" ry="5" fill="#4ade80" transform="rotate(-20 16 55)" />
        <ellipse cx="64" cy="55" rx="7" ry="5" fill="#4ade80" transform="rotate(20 64 55)" />
        <ellipse cx="40" cy="52" rx="14" ry="10" fill="#86efac" opacity="0.7" />
      </svg>
    </div>
  );
}

const headerShellStyle: CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 50,
  background: "rgba(255,255,255,0.88)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  borderBottom: "2px solid rgba(167,139,250,0.2)",
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
};

const innerStyle: CSSProperties = {
  maxWidth: 1100,
  margin: "0 auto",
  padding: "0.75rem 1.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "1rem",
};

export function SiteHeader({
  brandHref = "/",
  actions,
  showMascot = true,
}: {
  brandHref?: string;
  /** Right-side nav. Omit for default Sign in + Play Now. Pass null for brand-only. */
  actions?: ReactNode | null;
  showMascot?: boolean;
}) {
  return (
    <header style={headerShellStyle}>
      <div style={innerStyle}>
        <Link
          href={brandHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          {showMascot && <SiteHeaderMascot size={36} />}
          <span
            style={{
              fontFamily: "var(--font-game), Fredoka, system-ui, sans-serif",
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "#1f2937",
              letterSpacing: "-0.01em",
            }}
          >
            <BrandName />
          </span>
        </Link>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {actions === undefined ? <SiteHeaderMarketingActions /> : actions}
        </nav>
      </div>
    </header>
  );
}

export function SiteHeaderMarketingActions() {
  return (
    <>
      <Link
        href="/login"
        style={{
          fontSize: "0.875rem",
          fontWeight: 700,
          color: "#6b7280",
          textDecoration: "none",
        }}
      >
        Sign in
      </Link>
      <Link
        href="/subjects"
        className="site-header-play-btn"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.4rem",
          padding: "0.55rem 1.25rem",
          borderRadius: 999,
          border: "2.5px solid #e85d04",
          background: "linear-gradient(180deg, #ff9f43 0%, #ff6b35 100%)",
          fontFamily: "var(--font-game), Fredoka, system-ui, sans-serif",
          fontSize: "1rem",
          fontWeight: 800,
          color: "white",
          textDecoration: "none",
          textShadow: "0 1px 0 rgba(0,0,0,0.15)",
          boxShadow: "0 5px 0 #c44d00",
        }}
      >
        🎮 Play Now
      </Link>
    </>
  );
}

export function SiteHeaderLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        fontSize: "0.875rem",
        fontWeight: 700,
        color: "#6b7280",
        textDecoration: "none",
      }}
    >
      {children}
    </Link>
  );
}
