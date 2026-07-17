"use client";

import { ReactNode } from "react";

interface Breadcrumb {
  label: string;
  onClick?: () => void;
}

interface SubjectWizardChromeProps {
  pill?: string;
  title: string;
  subtitle: string;
  breadcrumbs?: Breadcrumb[];
  children: ReactNode;
  footer?: ReactNode;
}

export function SubjectWizardChrome({
  pill = "📖 Choose your adventure — editor",
  title,
  subtitle,
  breadcrumbs,
  children,
  footer,
}: SubjectWizardChromeProps) {
  return (
    <div className="subject-wizard-panel relative overflow-hidden rounded-3xl border-2 border-[#fed7aa]/60 bg-white shadow-sm">
      <div className="pointer-events-none absolute -left-10 top-8 h-24 w-24 rounded-full bg-[#fef9c3]/80" aria-hidden />
      <div className="pointer-events-none absolute -right-6 top-4 h-20 w-20 rounded-full bg-[#ede9fe]/70" aria-hidden />

      <div className="relative z-10 px-4 py-6 sm:px-6 sm:py-8">
        <p className="kid-pill mb-3 border-2 border-[#fcd34d] bg-[#fef9c3] text-[#92400e]">{pill}</p>
        <h1 className="game-font text-3xl font-bold text-[var(--kid-text)] sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-xl text-base font-semibold text-[var(--kid-muted)]">{subtitle}</p>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-6 mt-4 flex flex-wrap items-center gap-2 text-sm font-bold text-[var(--kid-muted)]">
            {breadcrumbs.map((crumb, i) => (
              <span key={`${crumb.label}-${i}`} className="inline-flex items-center gap-2">
                {i > 0 && <span aria-hidden>›</span>}
                {crumb.onClick ? (
                  <button
                    type="button"
                    onClick={crumb.onClick}
                    className="rounded-lg px-1.5 py-0.5 text-[var(--kid-purple)] hover:bg-[#faf5ff]"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="text-[var(--kid-text)]">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}

        {children}

        {footer && (
          <div className="relative z-10 mt-8 border-t border-[#fed7aa]/50 bg-white/90 pt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

interface WizardStepFooterProps {
  onBack?: () => void;
  backLabel?: string;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  extra?: ReactNode;
}

export function WizardStepFooter({
  onBack,
  backLabel = "← Back",
  onSave,
  saving,
  saveLabel = "Save",
  onNext,
  nextLabel = "Next →",
  nextDisabled,
  extra,
}: WizardStepFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        {onBack && (
          <button type="button" onClick={onBack} className="kid-btn-secondary !px-5 !py-2.5 !text-sm">
            {backLabel}
          </button>
        )}
        {extra}
      </div>
      <div className="flex flex-wrap gap-2">
        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="kid-btn-secondary !px-5 !py-2.5 !text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : saveLabel}
          </button>
        )}
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled || saving}
            className="kid-btn-primary !px-5 !py-2.5 !text-sm disabled:opacity-50"
          >
            {nextLabel}
          </button>
        )}
      </div>
    </div>
  );
}
