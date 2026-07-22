import { cn } from "@/lib/cn";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "accent" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] shadow-sm border border-transparent",
  accent:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] shadow-sm border border-transparent",
  secondary:
    "bg-white text-[var(--text-secondary)] border border-[var(--border)] hover:bg-gray-50 shadow-sm",
  outline:
    "bg-transparent text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary-muted)]",
  ghost: "bg-transparent text-[var(--text-secondary)] hover:bg-gray-100 border border-transparent",
  danger:
    "bg-white text-[var(--danger)] border border-red-200 hover:bg-[var(--danger-muted)]",
};

const sizes: Record<Size, string> = {
  sm: "h-10 min-h-[40px] px-3.5 text-sm",
  md: "h-11 min-h-[44px] px-4 text-base",
  lg: "h-12 min-h-[48px] px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";
