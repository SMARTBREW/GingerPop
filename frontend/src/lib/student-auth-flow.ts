export function studentPostLoginPath(
  mustChangePassword: boolean | undefined,
  nextPath: string,
): string {
  const safeNext =
    nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/student/dashboard";

  // Always land on the dashboard first so the password modal can show;
  // after setup, continue to the original destination (invite link, etc.).
  if (mustChangePassword) {
    if (safeNext === "/student/dashboard") return "/student/dashboard";
    return `/student/dashboard?next=${encodeURIComponent(safeNext)}`;
  }
  return safeNext;
}
