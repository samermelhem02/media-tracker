"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import NProgress from "nprogress";
import { PageTransition } from "@/components/PageTransition";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    const t = setTimeout(() => {
      NProgress.done();
    }, 300);
    return () => clearTimeout(t);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <PageTransition key={pathname}>{children}</PageTransition>
    </AnimatePresence>
  );
}
