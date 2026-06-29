import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "success" | "warning" | "primary" | "neutral";

const styles: Record<BadgeVariant, string> = {
  default: "bg-gray-100 text-gray-700",
  primary: "bg-[var(--primary-muted)] text-[var(--primary)] ring-1 ring-inset ring-[var(--primary)]/20",
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/10",
  warning: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/10",
  neutral: "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/10",
};

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2.5 py-1 text-sm font-medium",
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
