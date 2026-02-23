"use client";

import { useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export function SuccessToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const added = searchParams.get("added");
  const hasShown = useRef(false);

  useEffect(() => {
    if (added !== "true") return;
    if (hasShown.current) return;
    hasShown.current = true;
    toast.success("Added to Library ✓");
    router.replace("/library", { scroll: false });
  }, [added, router]);

  return null;
}
