"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import type { User } from "@supabase/supabase-js";

const NAV_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/explore", label: "Explore" },
  { href: "/profile", label: "Profile" },
] as const;

export function TopNav({ user }: { user: User }) {
  const pathname = usePathname();

  return (
    <header
      className="sticky top-0 z-10 border-b backdrop-blur-sm transition-colors duration-200"
      style={{
        background: "var(--mt-bg-secondary)",
        borderColor: "var(--mt-border-default)",
      }}
    >
      <div className="mx-auto flex max-w-[var(--mt-max-width)] items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link
            href="/library"
            className="text-xl font-semibold tracking-tight text-[var(--mt-text-primary)] hover:opacity-90 transition-opacity duration-200"
          >
            Media Tracker
          </Link>
          <nav className="flex gap-1 relative">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`relative rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out ${
                    isActive
                      ? "text-[var(--mt-tabs-active-text)] font-semibold"
                      : "text-[var(--mt-text-muted)] hover:bg-white/5 hover:text-[var(--mt-text-secondary)]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute inset-0 rounded-lg bg-[var(--mt-tabs-active-bg)] -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.25 }}
                    />
                  )}
                  <span className="relative z-0">{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--mt-text-muted)]">{user.email}</span>
          <form action="/logout" method="post">
            <button
              type="submit"
              className="mt-btn-secondary text-sm transition-all duration-200"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
