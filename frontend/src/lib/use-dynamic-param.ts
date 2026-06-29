"use client";

import { useParams, usePathname } from "next/navigation";

/**
 * Reads a dynamic route param. On static export + CloudFront, the prebuilt
 * placeholder segment ("_") is served while the browser URL keeps the real value.
 */
export function useDynamicParam(segmentIndex: number, paramName = "id") {
  const params = useParams<Record<string, string>>();
  const pathname = usePathname();
  const fromParams = params[paramName];

  if (fromParams && fromParams !== "_") {
    return fromParams;
  }

  const parts = pathname.replace(/\/$/, "").split("/").filter(Boolean);
  return parts[segmentIndex] ?? fromParams ?? "";
}
