"use client";

import { ReactNode } from "react";
import { usePagination } from "@/lib/use-pagination";

interface PaginatedListProps<T> {
  items: T[];
  pageSize?: number;
  keyExtractor: (item: T, index: number) => string;
  renderItem: (item: T, index: number) => ReactNode;
  empty?: ReactNode;
  className?: string;
}

export function PaginatedList<T>({
  items,
  pageSize = 5,
  keyExtractor,
  renderItem,
  empty,
  className = "",
}: PaginatedListProps<T>) {
  const {
    pageItems,
    totalPages,
    totalItems,
    page,
    goPrev,
    goNext,
    hasPrev,
    hasNext,
    rangeStart,
    rangeEnd,
  } = usePagination(items, pageSize);

  if (items.length === 0) {
    return empty ? <>{empty}</> : null;
  }

  return (
    <div className={className}>
      <div className="kid-card overflow-hidden divide-y divide-[#fed7aa]/60">
        {pageItems.map((item, index) => (
          <div key={keyExtractor(item, index)} className="bg-white/80">
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--kid-muted)]">
          Showing {rangeStart}–{rangeEnd} of {totalItems}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={!hasPrev}
            className="kid-btn-secondary !px-3 !py-1.5 !text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            ← Prev
          </button>
          <span className="px-2 text-sm font-bold text-[var(--kid-text)]">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={goNext}
            disabled={!hasNext}
            className="kid-btn-secondary !px-3 !py-1.5 !text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
