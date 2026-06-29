import Link from "next/link";
import { BrandName } from "@/components/BrandName";

interface LearnerHeaderProps {
  courseTitle: string;
  invitedBy?: { name: string; email?: string } | null;
}

export function LearnerHeader({ courseTitle, invitedBy }: LearnerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur-md">
      <div className="page-shell flex min-h-14 flex-col justify-center gap-0.5 py-2 sm:h-16 sm:flex-row sm:items-center sm:justify-between sm:py-0">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          <BrandName />
        </Link>
        <div className="min-w-0 sm:max-w-[55%] sm:text-right">
          <span className="block truncate text-base font-medium text-gray-700">{courseTitle}</span>
          {invitedBy && (
            <span className="block truncate text-sm text-gray-500">
              Invited by {invitedBy.name}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
