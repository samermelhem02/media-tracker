"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

export default function ActionToast() {
  const searchParams = useSearchParams();
  const generated = searchParams.get("generated");

  useEffect(() => {
    if (generated === "true") {
      toast.success("Recommendations updated ✓");
    }
  }, [generated]);

  return null;
}
