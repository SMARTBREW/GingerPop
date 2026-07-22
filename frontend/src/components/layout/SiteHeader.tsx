"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { BrandName } from "@/components/BrandName";

/** Small green frog mark used in the site header (matches the landing page). */
export function SiteHeaderMascot({ size = 36 }: { size?: number }) {
  return (
    <div className="inline-block flex-shrink-0" style={{ width: size, height: size }} aria-hidden>
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-full w-full">
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
    <header className="sticky top-0 z-50 border-b-2 border-purple-200/50 bg-white/90 shadow-sm backdrop-blur-2xl">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-3 px-3 py-2.5 sm:gap-4 sm:px-4 md:px-6">
        <Link
          href={brandHref}
          className="inline-flex flex-shrink-0 items-center gap-2 no-underline sm:gap-2.5"
        >
          {showMascot && <SiteHeaderMascot size={32} />}
          <span className="game-font whitespace-nowrap text-lg font-bold tracking-tight text-gray-800 sm:text-xl md:text-2xl">
            <BrandName />
          </span>
        </Link>
        <nav className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
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
        className="whitespace-nowrap text-xs font-bold text-gray-600 no-underline hover:text-gray-900 sm:text-sm"
      >
        Sign in
      </Link>
      <Link
        href="/subjects"
        className="site-header-play-btn game-font inline-flex min-h-[44px] items-center gap-1.5 whitespace-nowrap rounded-full border-[2.5px] border-[#e85d04] bg-gradient-to-b from-[#ff9f43] to-[#ff6b35] px-3 py-2 text-xs font-extrabold text-white shadow-[0_5px_0_#c44d00] transition-transform hover:-translate-y-0.5 active:translate-y-1 sm:min-h-[48px] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm md:text-base"
        style={{ textShadow: "0 1px 0 rgba(0,0,0,0.15)" }}
      >
        🎮 <span className="hidden sm:inline">Play Now</span>
        <span className="sm:hidden">Play</span>
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
      className="whitespace-nowrap text-xs font-bold text-gray-600 no-underline hover:text-gray-900 sm:text-sm"
    >
      {children}
    </Link>
  );
}
