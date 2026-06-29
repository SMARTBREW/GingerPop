import { cn } from "@/lib/cn";

export function Tabs<T extends string>({
  tabs,
  active,
  onChange,
  className,
}: {
  tabs: { id: T; label: string }[];
  active: T;
  onChange: (id: T) => void;
  className?: string;
}) {
  return (
    <div className={cn("border-b border-[var(--border)]", className)}>
      <nav className="-mb-px flex gap-4 overflow-x-auto sm:gap-6" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              "shrink-0 border-b-2 px-1 pb-3 text-base font-medium transition-colors",
              active === tab.id
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
