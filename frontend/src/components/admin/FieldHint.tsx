import { ReactNode } from "react";

interface FieldHintProps {
  label: string;
  hint?: string;
  example?: string;
  children: ReactNode;
  className?: string;
}

export function FieldHint({ label, hint, example, children, className = "" }: FieldHintProps) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-sm font-bold text-[var(--kid-text)]">{label}</span>
      {hint && (
        <span className="mt-0.5 block text-xs font-semibold leading-relaxed text-[var(--kid-muted)]">
          {hint}
        </span>
      )}
      {example && (
        <span className="mt-0.5 block text-xs font-semibold italic text-[var(--kid-purple)]">
          Example: {example}
        </span>
      )}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
