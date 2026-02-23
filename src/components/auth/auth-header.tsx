import Link from "next/link";

export function AuthHeader() {
  return (
    <header className="auth-header" role="banner">
      <Link href="/">Media Tracker</Link>
      <nav aria-label="Auth navigation" style={{ display: "flex", gap: "24px" }}>
        <Link href="/login">Sign in</Link>
        <Link href="/register">Create account</Link>
      </nav>
    </header>
  );
}
