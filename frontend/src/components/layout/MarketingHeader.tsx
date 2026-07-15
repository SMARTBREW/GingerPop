import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { BrandName } from "@/components/BrandName";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)]/80 bg-white/90 backdrop-blur-md">
      <div className="page-shell flex h-14 items-center justify-between sm:h-16">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          <BrandName />
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link href="/subjects">
            <Button variant="ghost" size="sm">
              Demo
            </Button>
          </Link>
          <Link href="/login">
            <Button size="sm">Sign in</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
