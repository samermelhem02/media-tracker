"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import { PageTransition } from "@/components/PageTransition";
import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export function AppLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      NProgress.done();
      return;
    }
    NProgress.start();
    const t = setTimeout(() => {
      NProgress.done();
    }, 200);
    return () => {
      clearTimeout(t);
      NProgress.done();
    };
  }, [pathname]);

  return <PageTransition key={pathname}>{children}</PageTransition>;
}
