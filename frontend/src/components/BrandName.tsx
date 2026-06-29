import { cn } from "@/lib/cn";

export function BrandName({
  className,
  accentClassName,
}: {
  className?: string;
  accentClassName?: string;
}) {
  return (
    <span className={className}>
      Ginger
      <span className={cn("text-[var(--accent)]", accentClassName)}>Pop</span>
    </span>
  );
}
