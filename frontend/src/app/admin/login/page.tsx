"use client";

import { useEffect } from "react";

/** Keep old /admin/login bookmarks working → teacher login */
export default function AdminLoginRedirectPage() {
  useEffect(() => {
    window.location.replace("/login/teacher");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
      Redirecting to teacher login…
    </div>
  );
}
