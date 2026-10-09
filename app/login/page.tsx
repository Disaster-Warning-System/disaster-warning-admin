"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveAdminSession, getAdminSession } from "@/src/lib/auth";
import { homePathFor } from "@/src/lib/roles";
import { saveWarningToken } from "@/src/lib/warningToken";
import { AdminAuthError, loginAdmin } from "@/src/services/api/authApi";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const homePath = homePathFor(getAdminSession());
    if (homePath) router.replace(homePath);
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const session = await loginAdmin({ email: email.trim(), password });
      // DMC Officers go to report verification, District Officers to shelters
      const homePath = homePathFor(session);
      if (!homePath) {
        setError("This account does not have officer access. Contact an administrator.");
        return;
      }
      saveAdminSession(session);
      // Lets the Issue Warning form load the verified report for DMC Officers
      saveWarningToken(session);
      router.replace(homePath);
    } catch (reason) {
      setError(
        reason instanceof AdminAuthError || reason instanceof Error
          ? reason.message
          : "Sign in failed. Check your details and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={`${ui.page} flex items-center`}>
      <section className={`${ui.card} mx-auto w-full max-w-md space-y-6 p-5 sm:p-7`}>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">
            Disaster Warning System
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#16283D]">
            Admin sign in
          </h1>
          <p className={`mt-2 text-sm ${ui.muted}`}>
            Sign in with your authorized officer account.
          </p>
        </header>

        <form onSubmit={(event) => void submit(event)} className="space-y-4">
          <label className={ui.label}>
            Email address
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={ui.input}
            />
          </label>
          <label className={ui.label}>
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className={ui.input}
            />
          </label>
          {error ? (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          ) : null}
          <button type="submit" disabled={submitting} className={ui.primaryButton}>
            {submitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
