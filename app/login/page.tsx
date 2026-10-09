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