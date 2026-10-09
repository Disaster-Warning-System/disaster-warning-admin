'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/src/api/axios';

type LoginResponse = {
  data?: {
    token?: string;
    user?: { role?: string };
  };
  message?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await apiClient.post<LoginResponse>('/auth/login', { email, password });
      const token = response.data.data?.token;
      const role = response.data.data?.user?.role;

      if (!token || role !== 'DMC Officer') {
        setError('Only DMS Officers can access the officer console.');
        return;
      }

      window.localStorage.setItem('dms_token', token);
      window.localStorage.setItem('dms_user', JSON.stringify(response.data.data?.user ?? {}));
      router.push('/hazard-reports/pending');
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message || 'Unable to sign in.');
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { isDistrictOfficer, saveAdminSession, getAdminSession } from "@/src/lib/auth";
import { AdminAuthError, loginAdmin } from "@/src/services/api/authApi";
import { shelterStyles as ui } from "@/src/components/shelters/shelterStyles";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isDistrictOfficer(getAdminSession())) router.replace("/shelters");
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const session = await loginAdmin({ email: email.trim(), password });
      if (!isDistrictOfficer(session)) {
        setError("This account does not have District Officer access. Contact an administrator.");
        return;
      }
      saveAdminSession(session);
      router.replace("/shelters");
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
    <main className="flex min-h-screen items-center justify-center bg-zinc-100 px-6">
      <form onSubmit={submit} className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-zinc-900">DMS Officer sign in</h1>
        <p className="mt-2 text-sm text-zinc-600">Sign in to review hazard reports and issue warnings.</p>
        {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <label className="mt-6 block text-sm font-medium text-zinc-700" htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 p-3" />
        <label className="mt-4 block text-sm font-medium text-zinc-700" htmlFor="password">Password</label>
        <input id="password" type="password" required value={password} onChange={(event) => setPassword(event.target.value)}
          className="mt-1 w-full rounded-lg border border-zinc-300 p-3" />
        <button type="submit" disabled={submitting}
          className="mt-6 w-full rounded-lg bg-blue-700 px-4 py-3 font-medium text-white disabled:opacity-60">
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
    <main className={`${ui.page} flex items-center`}>
      <section className={`${ui.card} mx-auto w-full max-w-md space-y-6 p-5 sm:p-7`}>
        <header>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1877B9]">
            District response
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#16283D]">
            District Officer sign in
          </h1>
          <p className={`mt-2 text-sm ${ui.muted}`}>
            Sign in with your authorized officer account to manage emergency shelters.
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
