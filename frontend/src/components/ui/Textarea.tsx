import { cn } from "@/lib/cn";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, id, ...props }, ref) => {
    const areaId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={areaId} className="mb-1.5 block text-base font-medium text-gray-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={areaId}
          className={cn(
            "w-full rounded-md border border-[var(--border)] bg-white px-3.5 py-2.5 text-base text-gray-900",
            "placeholder:text-gray-400 transition-shadow resize-y min-h-[96px]",
            "focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-muted)]",
            className,
          )}
          {...props}
        />
        {hint && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
