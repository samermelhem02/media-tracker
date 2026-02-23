"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";

type LoginAction = (formData: FormData) => Promise<{ error?: string } | void>;

export function LoginForm({ action }: { action: LoginAction }) {
  const [isLoading, setIsLoading] = useState(false);
  const [state, formAction] = useActionState(
    async (prev: { error?: string } | void, formData: FormData) => {
      if (isLoading) return prev;
      setIsLoading(true);
      const result = await action(formData);
      if (result?.error) setIsLoading(false);
      return result;
    },
    undefined,
  );

  useEffect(() => {
    if (state?.error) setIsLoading(false);
  }, [state?.error]);

  return (
    <form action={formAction} className="auth-card" style={{ maxWidth: "440px" }}>
      <h1
        className="auth-heading"
        style={{
          fontSize: "30px",
          fontWeight: 600,
          letterSpacing: "-0.5px",
          lineHeight: 1.3,
          marginBottom: "32px",
          color: "var(--auth-text)",
        }}
      >
        Sign in
      </h1>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="email" className="auth-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isLoading}
          className="auth-input"
          style={{ marginTop: "8px" }}
        />
      </div>

      <div style={{ marginBottom: "8px" }}>
        <label htmlFor="password" className="auth-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isLoading}
          className="auth-input"
          style={{ marginTop: "8px" }}
        />
        <p style={{ marginTop: "8px", fontSize: "13px" }}>
          <Link
            href="/forgot-password"
            style={{ color: "var(--auth-text-secondary)", textDecoration: "underline" }}
          >
            Forgot password?
          </Link>
        </p>
      </div>

      {state?.error && (
        <p
          role="alert"
          style={{
            marginTop: "16px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#b91c1c",
            background: "#fef2f2",
            borderRadius: "6px",
          }}
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="auth-btn-primary transition-all duration-200 ease-in-out disabled:opacity-80 disabled:cursor-not-allowed"
        style={{ marginTop: "24px", minHeight: "46px" }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          "Sign in"
        )}
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <Link
        href="/register"
        className="auth-btn-secondary"
        style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
        aria-disabled={isLoading}
      >
        Create account
      </Link>

      <p
        className="auth-legal mt-6 text-[11px] leading-snug text-[var(--auth-text-muted)]"
      >
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
