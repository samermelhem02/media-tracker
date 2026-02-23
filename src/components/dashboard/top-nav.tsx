"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/db-types";

const NAV_LINKS = [
  { href: "/library", label: "Library" },
  { href: "/explore", label: "Explore" },
  { href: "/profile", label: "Profile" },
] as const;

function displayName(profile: Profile | null | undefined, fallbackEmail: string | undefined): string {
  if (profile?.first_name != null && profile?.last_name != null) {
    return `${profile.first_name.trim()} ${profile.last_name.trim()}`.trim() || fallbackEmail || "";
  }
  if (profile?.first_name?.trim()) return profile.first_name.trim();
  if (profile?.display_name?.trim()) return profile.display_name.trim();
  return fallbackEmail ?? "";
}

export function TopNav({ user, profile }: { user: User; profile?: Profile | null }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const nameToShow =
    displayName(profile, user.email ?? undefined) ||
    (user.email?.length && user.email.length > 20 ? `${user.email.slice(0, 12)}…` : user.email ?? "");

  const linkClass = (isActive: boolean) =>
    `block rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
      isActive
        ? "bg-[var(--mt-tabs-active-bg)] text-[var(--mt-tabs-active-text)]"
        : "text-[var(--mt-text-secondary)] hover:bg-white/5 hover:text-[var(--mt-text-primary)]"
    }`;

  return (
    <header
      className="sticky top-0 z-10 border-b backdrop-blur-sm transition-colors duration-200"
      style={{
        background: "var(--mt-bg-secondary)",
        borderColor: "var(--mt-border-default)",
      }}
    >
      <div className="relative mx-auto flex max-w-[var(--mt-max-width)] items-center justify-between gap-2 px-4 py-3 sm:px-5 sm:py-3 md:px-6 md:py-4">
        <Link
          href="/library"
          className="shrink-0 text-base font-semibold tracking-tight text-[var(--mt-text-primary)] hover:opacity-90 transition-opacity duration-200 sm:text-lg md:text-xl"
        >
          Media Tracker
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex md:flex-1 md:items-center md:justify-between md:gap-6">
          <nav className="flex gap-1" aria-label="Main">
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
          <span
            className="max-w-[180px] truncate text-sm text-[var(--mt-text-muted)]"
            title={user.email ?? undefined}
          >
            {nameToShow}
          </span>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[var(--mt-text-primary)] hover:bg-white/10 md:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle menu"
        >
          {menuOpen ? (
            <span className="text-xl leading-none">✕</span>
          ) : (
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            aria-hidden
            onClick={() => setMenuOpen(false)}
          />
          <nav
            aria-label="Main"
            className="absolute left-4 right-4 top-full z-50 mt-1 flex flex-col gap-1 rounded-lg border border-white/10 bg-[var(--mt-bg-secondary)] py-2 shadow-xl md:hidden"
          >
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={linkClass(pathname === href)}
                onClick={() => setMenuOpen(false)}
              >
                {label}
              </Link>
            ))}
            <div className="border-t border-white/10 px-4 py-3">
              <p className="truncate text-xs text-[var(--mt-text-muted)]" title={user.email ?? undefined}>
                {nameToShow}
              </p>
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
