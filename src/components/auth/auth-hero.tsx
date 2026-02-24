"use client";

export function AuthHeroRegister() {
  return (
    <div className="auth-hero text-center">
      <h1 className="auth-hero-title">
        Track your movies, series, music, and games.
      </h1>
      <p className="auth-hero-subtitle mt-3">
        Free to use. Your collection, anywhere.
      </p>
      <p className="auth-hero-cta mt-4">
        Ready to start? Create an account or sign in to your library.
      </p>
    </div>
  );
}

export function AuthHeroLogin() {
  return (
    <div className="auth-hero text-center">
      <h1 className="auth-hero-title">Welcome back.</h1>
      <p className="auth-hero-cta mt-3">Sign in to continue to your library.</p>
    </div>
  );
}
