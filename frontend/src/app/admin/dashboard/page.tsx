"use client";

import { useEffect } from "react";

/** Keep old /admin/dashboard bookmarks working */
export default function AdminDashboardRedirectPage() {
  useEffect(() => {
    window.location.replace("/teacher/dashboard");
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
      Redirecting to teacher dashboard…
    </div>
  );
}
