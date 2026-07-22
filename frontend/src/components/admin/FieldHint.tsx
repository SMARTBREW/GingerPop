import { ReactNode } from "react";
import { countWords } from "@/lib/content-limits";

interface FieldHintProps {
  label: string;
  hint?: string;
  example?: string;
  children: ReactNode;
  className?: string;
  value?: string;
  wordLimit?: number;
}

export function FieldHint({
  label,
  hint,
  example,
  children,
  className = "",
  value,
  wordLimit,
}: FieldHintProps) {
  const showCount = value !== undefined && wordLimit !== undefined;
  const words = showCount ? countWords(value) : null;
  const over = showCount && words! > wordLimit!;

  return (
    <label className={`block ${className}`}>
      <span className="block text-xs font-bold text-[var(--kid-text)] sm:text-sm">{label}</span>
      {hint && (
        <span className="mt-0.5 block text-[0.65rem] font-semibold leading-relaxed text-[var(--kid-muted)] sm:text-xs">
          {hint}
        </span>
      )}
      {example && (
        <span className="mt-0.5 block text-[0.65rem] font-semibold italic text-[var(--kid-purple)] sm:text-xs">
          Example: {example}
        </span>
      )}
      {words !== null && (
        <span
          className={`mt-0.5 block text-[0.65rem] font-bold sm:text-xs ${
            over ? "text-red-600" : "text-[var(--kid-muted)]"
          }`}
        >
          {words}/{wordLimit} words{over ? " — too long" : ""}
        </span>
      )}
      <div className="mt-1 sm:mt-1.5">{children}</div>
    </label>
  );
}
