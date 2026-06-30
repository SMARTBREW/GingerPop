"use client";

import { cn } from "@/lib/cn";
import { normalizeRichTextHtml, sanitizeHtml } from "@/lib/sanitize-html";

interface RichTextContentProps {
  html: string;
  className?: string;
  as?: "div" | "span" | "p";
}

export function RichTextContent({ html, className, as: Tag = "div" }: RichTextContentProps) {
  if (!html) return null;

  const safeHtml = sanitizeHtml(normalizeRichTextHtml(html));

  return (
    <Tag
      className={cn(
        "rich-text-content [&_p]:mb-3 [&_p:last-child]:mb-0 [&_div]:mb-3 [&_div:last-child]:mb-0 [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:my-1",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
