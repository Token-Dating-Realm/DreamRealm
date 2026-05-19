/**
 * Forgot Password Page
 *
 * Phase 3 password reset request placeholder. Collects email and
 * shows a confirmation message. Will be wired to Supabase auth later.
 */

"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    // Placeholder: simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSubmitted(true);
    setIsPending(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-8 shadow-glow/20">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary">Reset Password</h1>
          <p className="mt-1 text-sm text-text-muted">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {submitted ? (
          <div className="text-center">
            <div className="mb-4 rounded-xl bg-success/10 p-4">
              <p className="text-sm text-success">Check your email for a reset link.</p>
            </div>
            <Link href="/login" className="text-sm font-semibold text-primary hover:underline">
              Back to Sign In
            </Link>
          </div>
        ) : (
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
                className="mt-1 w-full rounded-lg border border-border bg-surface-light px-3 py-2 text-sm text-text placeholder-text-muted transition focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:bg-primary-dark disabled:opacity-50"
            >
              {isPending ? "Sending..." : "Send Reset Link"}
            </button>
            <p className="text-center text-sm text-text-muted">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
