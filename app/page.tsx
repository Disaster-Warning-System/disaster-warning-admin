import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="max-w-xl rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-700">
          District response
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Shelter coordination
        </h1>
        <p className="mt-3 text-slate-600">
          Manage shelter capacity and operational status.
        </p>
        <Link
          href="/shelters"
          className="mt-6 inline-flex rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white"
        >
          Open shelter dashboard
        </Link>
      </section>
    </main>
  );
}
