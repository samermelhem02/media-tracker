"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function AuthHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <header className="auth-header relative z-10 flex h-14 min-h-[56px] max-h-16 items-center justify-between px-4 sm:px-6" role="banner">
      <Link href="/" className="flex items-center shrink-0 hover:opacity-90 transition-opacity" aria-label="Trackify – Home">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="170"
          height="32"
          viewBox="0 0 170 32"
          fill="none"
          role="img"
          aria-hidden
          className="h-7 w-auto sm:h-8"
        >
          <g>
            <rect x="0" y="0" width="32" height="32" rx="8" fill="#F5C518" />
            <rect x="7" y="8" width="18" height="4" rx="2" fill="#111111" />
            <rect x="14" y="11" width="4" height="13" rx="2" fill="#111111" />
            <path d="M18.8 16.2L21.8 18L18.8 19.8Z" fill="#F5C518" />
          </g>
          <text
            x="44"
            y="21.5"
            fontFamily="Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif"
            fontSize="16"
            fontWeight="800"
            letterSpacing="0.2"
            fill="#FFFFFF"
          >
            Trackify
          </text>
        </svg>
      </Link>

      {/* No top-right button; Sign in / Create account via form links and mobile menu only */}
      {!isLogin && (
        <>
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
          <div className="hidden sm:block w-10 shrink-0" aria-hidden />
        </>
      )}
      {isLogin && <div className="w-10 shrink-0 sm:hidden" aria-hidden />}
      {open && !isLogin && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 sm:hidden" aria-hidden onClick={() => setOpen(false)} />
          <nav aria-label="Auth navigation" className="absolute right-4 top-16 z-50 flex flex-col gap-1 rounded-lg border border-white/10 bg-black/95 py-2 shadow-xl sm:hidden">
            <Link href="/login" className="px-4 py-3 text-white font-semibold hover:bg-white/10" onClick={() => setOpen(false)}>
              Sign in
            </Link>
            <Link href="/register" className="px-4 py-3 text-white font-semibold hover:bg-white/10" onClick={() => setOpen(false)}>
              Create account
            </Link>
          </nav>
        </>
      )}
    </header>
  );
}
