"use client";

import Link from "next/link";
import { useActionState, useState, useEffect } from "react";

type RegisterResult = { error?: string; message?: string } | void;
type RegisterAction = (formData: FormData) => Promise<RegisterResult>;

export function RegisterForm({ action }: { action: RegisterAction }) {
  const [isLoading, setIsLoading] = useState(false);
  const [state, formAction] = useActionState(
    async (prev: RegisterResult | void, formData: FormData) => {
      if (isLoading) return prev;
      setIsLoading(true);
      const result = await action(formData);
      if (result?.error || result?.message) setIsLoading(false);
      return result;
    },
    undefined,
  );

  useEffect(() => {
    if (state?.error || state?.message) setIsLoading(false);
  }, [state?.error, state?.message]);

  return (
    <form action={formAction} className="auth-card" style={{ maxWidth: "440px", width: "100%" }}>
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
        Create an account
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

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="password" className="auth-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={isLoading}
          className="auth-input"
          style={{ marginTop: "8px" }}
        />
        <p style={{ marginTop: "6px", fontSize: "12px", color: "var(--auth-text-muted)" }}>
          At least 6 characters
        </p>
      </div>

      {state?.error && (
        <p
          role="alert"
          style={{
            marginBottom: "16px",
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
      {state?.message && !state?.error && (
        <p
          role="status"
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            fontSize: "14px",
            color: "#166534",
            background: "#f0fdf4",
            borderRadius: "6px",
          }}
        >
          {state.message}
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
          "Create account"
        )}
      </button>

      <div className="auth-divider" style={{ marginTop: "24px" }}>
        <span>or</span>
      </div>

      <p style={{ marginTop: "24px", fontSize: "14px", color: "var(--auth-text-secondary)" }}>
        Already have an account?{" "}
        <Link
          href="/login"
          style={{ color: "var(--auth-text)", fontWeight: 600, textDecoration: "underline" }}
        >
          Sign in
        </Link>
      </p>

      <p
        className="auth-legal"
        style={{
          marginTop: "32px",
          fontSize: "12px",
          color: "var(--auth-text-muted)",
          lineHeight: 1.5,
        }}
      >
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
