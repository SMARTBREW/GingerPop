import Link from "next/link";
import { BrandName } from "@/components/BrandName";

export function KidMarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b-2 border-white/60 bg-white/75 backdrop-blur-md">
      <div className="page-shell flex h-16 items-center justify-between sm:h-[4.5rem]">
        <Link href="/" className="game-font text-2xl font-bold tracking-tight text-[var(--kid-text)]">
          <BrandName />
        </Link>
        <nav className="flex items-center gap-2 sm:gap-3">
          <Link href="/subjects" className="kid-btn-secondary !px-4 !py-2 !text-sm sm:!px-5 sm:!text-base">
            Try a quest
          </Link>
          <Link
            href="/login"
            className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--kid-muted)] hover:bg-white/80 hover:text-[var(--kid-text)]"
          >
            Sign in
          </Link>
        </nav>
      </div>
    </header>
  );
}
