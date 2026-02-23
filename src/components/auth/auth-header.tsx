"use client";

import Link from "next/link";
import { useState } from "react";

export function AuthHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="auth-header relative flex h-14 min-h-[56px] max-h-16 items-center justify-between bg-[var(--auth-header-bg)] px-4 sm:px-6" role="banner">
      <Link href="/" className="text-white text-lg font-semibold tracking-tight hover:opacity-90">
        Media Tracker
      </Link>

      {/* Desktop nav */}
      <nav aria-label="Auth navigation" className="hidden sm:flex sm:gap-6">
        <Link href="/login" className="text-white font-semibold hover:opacity-90">
          Sign in
        </Link>
        <Link href="/register" className="text-white font-semibold hover:opacity-90">
          Create account
        </Link>
      </nav>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white hover:bg-white/10 sm:hidden"
        aria-expanded={open}
        aria-label="Toggle menu"
      >
        {open ? (
          <span className="text-xl leading-none" aria-hidden>✕</span>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 sm:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
          <nav
            aria-label="Auth navigation"
            className="absolute right-4 top-16 z-50 flex flex-col gap-1 rounded-lg border border-white/10 bg-[var(--auth-header-bg)] py-2 shadow-xl sm:hidden"
          >
            <Link
              href="/login"
              className="px-4 py-3 text-white font-semibold hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="px-4 py-3 text-white font-semibold hover:bg-white/10"
              onClick={() => setOpen(false)}
            >
              Create account
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
