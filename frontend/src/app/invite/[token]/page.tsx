"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDynamicParam } from "@/lib/use-dynamic-param";

export default function InviteRedirectPage() {
  const token = useDynamicParam(1, "token");
  const router = useRouter();

  useEffect(() => {
    if (token) router.replace(`/learn/${token}`);
  }, [token, router]);

  return null;
}
