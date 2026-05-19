/**
 * Login page
 *
 * Phase 1 login shell. Collects email + password and delegates to useAuth().
 * TODO: Add OAuth buttons (Google, Apple), device fingerprinting,
 * and geo-anomaly detection integration.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../components/AuthProvider";

export default function LoginPage() {
  const { signIn, signInWithOAuth } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-lg border border-border">
        <h1 className="mb-6 text-center text-2xl font-bold text-primary">DreamRealm</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-muted">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}
          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            {isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-surface px-2 text-text-muted">Or continue with</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => signInWithOAuth("google")}
              className="flex w-full items-center justify-center rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text hover:bg-border"
            >
              Google
            </button>
            <button
              type="button"
              onClick={() => signInWithOAuth("apple")}
              className="flex w-full items-center justify-center rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text hover:bg-border"
            >
              Apple
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-2 text-center text-sm text-text-muted">
          <p>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </p>
          <p>
            <Link href="/forgot-password" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
