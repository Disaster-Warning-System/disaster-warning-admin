import Link from "next/link";

const capabilities = [
  {
    number: "01",
    title: "Timely public warnings",
    description:
      "Prepare clear, targeted safety messages so communities know what is happening and what to do next.",
    icon: "!",
    tone: "bg-[#FFF3E5] text-[#B45B18]",
  },
  {
    number: "02",
    title: "Community hazard reports",
    description:
      "Give people a direct way to report local hazards and help officers review what needs attention.",
    icon: "⌖",
    tone: "bg-[#EAF4FC] text-[#1877B9]",
  },
  {
    number: "03",
    title: "Shelter information",
    description:
      "Help people find nearby shelters and see the latest availability shared by local officers.",
    icon: "⌂",
    tone: "bg-[#EAF6F1] text-[#27815D]",
  },
];

function BrandMark() {
  return (
    <span className="flex size-10 items-center justify-center rounded-2xl bg-[#1877B9] text-white shadow-lg shadow-[#1877B9]/20" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" className="size-6">
        <path d="M12 3 20 6v5.2c0 4.5-3 7.8-8 9.8-5-2-8-5.3-8-9.8V6l8-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M12 7.3v5.2m0 3.1h.01" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function SafetyIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]" aria-label="Illustration of a connected community safety map" role="img">
      <div className="absolute -inset-5 rounded-[2.5rem] bg-[#DCECF6]/60 blur-2xl" />
      <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[#EAF3F7] p-4 shadow-[0_30px_90px_-35px_rgba(21,61,91,0.38)] sm:p-6">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: "radial-gradient(#90B7C8 1px, transparent 1px)", backgroundSize: "19px 19px" }} />
        <svg viewBox="0 0 520 390" className="relative h-auto w-full" fill="none" aria-hidden="true">
          <path d="M0 116c47 9 63-18 105-10 38 7 44 42 86 39 41-3 52-38 90-34 45 5 51 48 99 47 41-1 70-39 140-24v256H0V116Z" fill="#D5E7E6" />
          <path d="M0 205c46-15 68-1 103-10 42-10 56-49 96-39 35 9 43 42 82 42 42 0 57-41 100-38 40 3 56 38 98 32 16-2 29-8 41-13" stroke="#AACBCB" strokeWidth="2" strokeDasharray="7 9" />
          <path d="M0 278c39-5 64 13 101 5 45-10 57-41 98-37 42 4 47 37 87 42 47 5 63-32 105-25 41 7 55 40 129 25" stroke="#AACBCB" strokeWidth="2" strokeDasharray="7 9" />
          <path d="M88 42c18 27 25 51 19 74-5 22-25 36-22 63 2 26 27 36 26 64-2 29-27 45-19 72 6 20 23 30 36 47" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <path d="M88 42c18 27 25 51 19 74-5 22-25 36-22 63 2 26 27 36 26 64-2 29-27 45-19 72 6 20 23 30 36 47" stroke="#BDD2DB" strokeWidth="2" strokeLinecap="round" />
          <path d="M370 21c-10 27-9 49 5 67 14 19 41 20 50 43 10 24-9 44 2 67 13 26 43 30 50 55 7 24-4 44-17 66" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" />
          <path d="M370 21c-10 27-9 49 5 67 14 19 41 20 50 43 10 24-9 44 2 67 13 26 43 30 50 55 7 24-4 44-17 66" stroke="#BDD2DB" strokeWidth="2" strokeLinecap="round" />
          <path d="M166 116 241 86l72 33 67-10 35 51-37 52-12 66-76 38-72-19-55-48 18-57-15-76Z" fill="#D9EAF3" stroke="#86B4CB" strokeWidth="2" />
          <path d="m241 86 4 62 68-29m-68 29-63 37m63-37 49 61 49-67m-98 6-2 82 51 49m0-131 49 61 42-9m-91-52 8 121 64-55" stroke="#A6C7D7" strokeWidth="1.5" />
          <path d="M285 182c0-22 18-40 40-40s40 18 40 40c0 30-40 68-40 68s-40-38-40-68Z" fill="#1877B9" />
          <circle cx="325" cy="181" r="12" fill="white" />
          <circle cx="325" cy="181" r="4" fill="#1877B9" />
          <circle cx="190" cy="139" r="8" fill="#27815D" stroke="white" strokeWidth="4" />
          <circle cx="400" cy="237" r="8" fill="#27815D" stroke="white" strokeWidth="4" />
          <circle cx="235" cy="263" r="8" fill="#27815D" stroke="white" strokeWidth="4" />
        </svg>
        <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-xs font-bold text-[#24634D] shadow-sm backdrop-blur sm:left-7 sm:top-7">
          <span className="size-2 rounded-full bg-[#35A675]" /> Community ready
        </div>
        <div className="absolute bottom-5 right-4 max-w-[205px] rounded-2xl border border-white/80 bg-white/95 p-3 shadow-lg backdrop-blur sm:bottom-7 sm:right-7 sm:p-4">
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#1877B9]">
            <span className="flex size-6 items-center justify-center rounded-lg bg-[#EAF4FC]">⌖</span>
            Connected response
          </div>
          <p className="mt-2 text-sm font-semibold leading-5 text-[#16283D]">People, reports and shelter information in one place.</p>
        </div>
      </div>
      <div className="absolute -bottom-4 left-7 hidden items-center gap-3 rounded-2xl border border-[#E5EDF2] bg-white px-4 py-3 shadow-xl sm:flex">
        <span className="flex size-9 items-center justify-center rounded-xl bg-[#EAF6F1] text-[#27815D]">✓</span>
        <span><span className="block text-xs font-bold text-[#16283D]">Built for coordination</span><span className="mt-0.5 block text-[11px] text-[#6B7C8F]">From local reports to official action</span></span>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7FAFC] text-[#16283D]">
      <header className="relative z-10 border-b border-[#E6EDF2] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-10">
          <Link href="/" className="flex items-center gap-3" aria-label="Disaster Warning System home">
            <BrandMark />
            <span className="leading-tight"><span className="block text-sm font-extrabold tracking-tight">Disaster Warning</span><span className="mt-0.5 block text-[10px] font-bold uppercase tracking-[0.17em] text-[#718396]">Sri Lanka · Safety Network</span></span>
          </Link>
          <nav className="hidden items-center gap-8 md:flex" aria-label="Main navigation">
            <a href="#how-it-helps" className="text-sm font-semibold text-[#5F7183] transition hover:text-[#1877B9]">How it helps</a>
            <a href="#for-everyone" className="text-sm font-semibold text-[#5F7183] transition hover:text-[#1877B9]">Who it serves</a>
          </nav>
          <Link href="/login" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#1877B9] px-4 text-sm font-bold text-white shadow-md shadow-[#1877B9]/15 transition hover:bg-[#075B94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] focus-visible:ring-offset-2 sm:px-5">
            Officer sign in <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section className="relative isolate">
        <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(ellipse_at_76%_22%,rgba(197,226,241,0.7),transparent_45%),linear-gradient(180deg,#FFFFFF_0%,#F7FAFC_100%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-10 lg:pb-28 lg:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#CFE3EF] bg-white/80 px-3.5 py-2 text-xs font-bold tracking-wide text-[#35647F] shadow-sm">
              <span className="flex size-5 items-center justify-center rounded-full bg-[#EAF4FC] text-[#1877B9]">✦</span>
              A shared network for safer communities
            </div>
            <h1 className="mt-7 text-[2.75rem] font-extrabold leading-[1.06] tracking-[-0.055em] text-[#13283B] sm:text-6xl lg:text-[4.25rem]">
              Ready information.<br />Stronger <span className="text-[#1877B9]">communities.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#617487] sm:text-lg sm:leading-8">
              One place to share hazard reports, coordinate public warnings and find shelter information when it matters.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#how-it-helps" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#1877B9] px-6 text-sm font-bold text-white shadow-lg shadow-[#1877B9]/20 transition hover:-translate-y-0.5 hover:bg-[#075B94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] focus-visible:ring-offset-2">
                Discover the system <span aria-hidden="true">↓</span>
              </a>
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#DCE6ED] bg-white px-6 text-sm font-bold text-[#314A5D] transition hover:border-[#B8D0DE] hover:bg-[#F9FCFD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] focus-visible:ring-offset-2">
                Officer portal <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs font-semibold text-[#718396]">
              <span className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-[#EAF6F1] text-[10px] text-[#27815D]">✓</span>Community reports</span>
              <span className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-[#EAF6F1] text-[10px] text-[#27815D]">✓</span>Officer coordination</span>
              <span className="inline-flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-[#EAF6F1] text-[10px] text-[#27815D]">✓</span>Shelter information</span>
            </div>
          </div>
          <SafetyIllustration />
        </div>
      </section>

      <section id="how-it-helps" className="border-y border-[#E8EEF2] bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1877B9]">One coordinated response</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#16283D] sm:text-4xl">From local signal to shared action.</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#718396]">Bring essential information together so communities and response teams can act with greater clarity.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {capabilities.map((item) => (
              <article key={item.number} className="group rounded-2xl border border-[#E4EBF0] bg-white p-6 transition hover:-translate-y-1 hover:border-[#C8DCE8] hover:shadow-[0_18px_45px_-28px_rgba(22,57,82,0.3)] sm:p-7">
                <div className="flex items-center justify-between">
                  <span className={`flex size-12 items-center justify-center rounded-2xl text-2xl font-bold ${item.tone}`} aria-hidden="true">{item.icon}</span>
                  <span className="text-xs font-bold tracking-[0.16em] text-[#A2B0BC]">{item.number}</span>
                </div>
                <h3 className="mt-6 text-lg font-extrabold text-[#1C3448]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#718396]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="for-everyone" className="bg-[#F7FAFC] py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:px-10">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#1877B9]">Designed around people</p>
            <h2 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-[#16283D] sm:text-4xl">A clearer picture for everyone involved.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-[#718396]">Different roles, working toward the same goal: helping people stay informed and prepared.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#DDE8EF] bg-white p-6 sm:p-7">
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#27815D]">For communities</span>
              <h3 className="mt-3 text-lg font-extrabold text-[#1C3448]">Stay informed and connected.</h3>
              <p className="mt-2 text-sm leading-6 text-[#718396]">Use the mobile app to receive warnings, report hazards and check shelter information.</p>
              <Link href="/register" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1877B9] hover:text-[#075B94]">Create a community account <span aria-hidden="true">→</span></Link>
              <p className="mt-3 border-t border-[#EEF2F5] pt-3 text-xs font-semibold leading-5 text-[#8292A1]">Use your account credentials in the mobile app.</p>
            </div>
            <div className="rounded-2xl border border-[#DDE8EF] bg-white p-6 sm:p-7">
              <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#1877B9]">For response teams</span>
              <h3 className="mt-3 text-lg font-extrabold text-[#1C3448]">Coordinate with confidence.</h3>
              <p className="mt-2 text-sm leading-6 text-[#718396]">Authorized officers can review reports, manage shelter information and prepare targeted warnings.</p>
              <Link href="/login" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1877B9] hover:text-[#075B94]">Open officer portal <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E3EAF0] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs font-medium text-[#8292A1] sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <span className="inline-flex items-center gap-2 font-bold text-[#53697B]"><BrandMark /> Disaster Warning System</span>
          <span>Prepared communities start with clear, shared information.</span>
        </div>
      </footer>
    </main>
  );
}
