import Link from "next/link";
import { BrandName } from "@/components/BrandName";

export function SiteFooter({
  showAuthLinks = true,
}: {
  showAuthLinks?: boolean;
}) {
  return (
    <footer className="mt-auto border-t-2 border-purple-200/50 bg-white/50 px-3 py-4 sm:px-4 sm:py-5 md:px-6">
      <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-3 sm:flex-row sm:gap-4">
        <span className="game-font whitespace-nowrap text-base font-bold text-gray-800 sm:text-lg">
          <BrandName />
        </span>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-gray-400 sm:gap-4 sm:text-sm">
          {showAuthLinks && (
            <Link href="/login" className="whitespace-nowrap font-bold text-gray-600 no-underline hover:text-gray-900">
              Sign in
            </Link>
          )}
          <span className="whitespace-nowrap">Made with 🌱 for tiny scientists</span>
          <span className="whitespace-nowrap">© {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}
