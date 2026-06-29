import { cn } from "@/lib/cn";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, hint, error, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-base font-medium text-gray-700">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "h-11 w-full rounded-md border border-[var(--border)] bg-white px-3.5 text-base text-gray-900",
            "placeholder:text-gray-400 transition-shadow",
            "focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-muted)]",
            error && "border-red-300 focus:border-red-500 focus:ring-red-100",
            className,
          )}
          {...props}
        />
        {hint && !error && <p className="mt-1.5 text-sm text-gray-500">{hint}</p>}
        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
      </div>
    );
  },
);
Input.displayName = "Input";
