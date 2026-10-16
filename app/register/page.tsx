"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { PublicRegistrationError, registerPublicUser } from "@/src/services/api/authApi";
import { DISTRICTS, RIVER_BASINS } from "@/src/constants/areas";

type PublicRole = "Citizen" | "Volunteer";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("");
  const [riverBasins, setRiverBasins] = useState<string[]>([]);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState<PublicRole>("Citizen");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCreated(false);

    if (password.length < 6) {
      setError("Your password must be at least 6 characters.");
      return;
    }
    if (!district) {
      setError("Choose your district so local warnings can reach you.");
      return;
    }
    if (phoneNumber.trim() && !/^\+[1-9]\d{7,14}$/.test(phoneNumber.trim())) {
      setError("Use an international phone format, for example +94771234567.");
      return;
    }
    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      await registerPublicUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        district,
        riverBasins,
        phoneNumber: phoneNumber.trim(),
        role,
      });
      setCreated(true);
      setName("");
      setEmail("");
      setDistrict("");
      setRiverBasins([]);
      setPhoneNumber("");
      setPassword("");
      setConfirmPassword("");
    } catch (reason) {
      setError(
        reason instanceof PublicRegistrationError || reason instanceof Error
          ? reason.message
          : "Registration failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F4F8FB] px-4 py-8 text-[#16283D] sm:px-6 sm:py-12">
      <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-[2rem] border border-[#E0E9EF] bg-white shadow-[0_28px_90px_-42px_rgba(20,58,84,0.35)] lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-[#12334A] p-10 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-16 size-80 rounded-full border border-white/10" />
          <div className="absolute -right-8 top-8 size-48 rounded-full border border-white/10" />
          <div className="relative">
            <Link href="/" className="inline-flex items-center gap-3 text-sm font-extrabold">
              <span className="flex size-10 items-center justify-center rounded-2xl bg-[#1877B9] text-lg">!</span>
              Disaster Warning System
            </Link>
            <div className="mt-24 max-w-sm">
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#8BC9E9]">Connected communities</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight">Preparedness starts with being connected.</h1>
              <p className="mt-5 text-sm leading-7 text-[#C5D8E4]">Create a public account to use the Disaster Warning mobile app for alerts, hazard reports and shelter information.</p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#1B536F] text-[#9DE0C2]">✓</span>
            <p className="text-xs font-medium leading-5 text-[#D5E3EB]">Staff access is created separately by an authorized administrator.</p>
          </div>
        </aside>

        <section className="p-6 sm:p-10 lg:p-12">
          <Link href="/" className="text-sm font-bold text-[#1877B9] hover:text-[#075B94]">← Back to home</Link>
          <div className="mt-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#1877B9]">Join the community network</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#16283D]">Create your account</h2>
            <p className="mt-2 text-sm leading-6 text-[#718396]">Register as a Citizen or Volunteer. You can use these details to sign in to the mobile app.</p>
          </div>

          {created ? (
            <div role="status" className="mt-7 rounded-2xl border border-[#B8E1CD] bg-[#F0FAF5] p-5">
              <div className="flex items-start gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#D9F1E5] font-bold text-[#27815D]">✓</span>
                <div>
                  <p className="font-bold text-[#205D45]">Your account is ready.</p>
                  <p className="mt-1 text-sm leading-6 text-[#4E7665]">Open the Disaster Warning mobile app and sign in with the email and password you registered.</p>
                </div>
              </div>
              <Link href="/" className="mt-4 inline-flex text-sm font-bold text-[#1877B9] hover:text-[#075B94]">Return to home →</Link>
            </div>
          ) : (
            <form onSubmit={(event) => void submit(event)} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-[#263E52]">
                Full name
                <input autoComplete="name" required maxLength={100} value={name} onChange={(event) => setName(event.target.value)} className="input mt-1.5" placeholder="Your name" />
              </label>
              <label className="block text-sm font-semibold text-[#263E52]">
                Email address
                <input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input mt-1.5" placeholder="you@example.com" />
              </label>
              <label className="block text-sm font-semibold text-[#263E52]">
                District
                <select required value={district} onChange={(event) => setDistrict(event.target.value)} className="input mt-1.5">
                  <option value="">Choose your district</option>
                  {DISTRICTS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>
              <fieldset>
                <legend className="text-sm font-semibold text-[#263E52]">River basin <span className="font-normal text-[#8292A1]">(optional)</span></legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {RIVER_BASINS.map((basin) => <label key={basin} className={`inline-flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold ${riverBasins.includes(basin) ? "border-[#1877B9] bg-[#EAF4FC] text-[#075B94]" : "border-[#DDE5EE] text-[#617487]"}`}><input type="checkbox" checked={riverBasins.includes(basin)} onChange={() => setRiverBasins((current) => current.includes(basin) ? current.filter((item) => item !== basin) : [...current, basin])} />{basin}</label>)}
                </div>
              </fieldset>
              <label className="block text-sm font-semibold text-[#263E52]">
                Phone number <span className="font-normal text-[#8292A1]">(optional for SMS alerts)</span>
                <input type="tel" autoComplete="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)} className="input mt-1.5" placeholder="+94771234567" />
              </label>
              <fieldset>
                <legend className="text-sm font-semibold text-[#263E52]">Account type</legend>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  {(["Citizen", "Volunteer"] as const).map((option) => (
                    <button key={option} type="button" aria-pressed={role === option} onClick={() => setRole(option)} className={`min-h-11 rounded-xl border px-4 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] focus-visible:ring-offset-2 ${role === option ? "border-[#1877B9] bg-[#EAF4FC] text-[#075B94]" : "border-[#DDE5EE] bg-white text-[#617487] hover:bg-[#F8FAFC]"}`}>
                      {option}
                    </button>
                  ))}
                </div>
              </fieldset>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-[#263E52]">
                  Password
                  <input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} className="input mt-1.5" placeholder="At least 6 characters" />
                </label>
                <label className="block text-sm font-semibold text-[#263E52]">
                  Confirm password
                  <input type="password" autoComplete="new-password" required minLength={6} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="input mt-1.5" placeholder="Enter it again" />
                </label>
              </div>
              {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
              <button type="submit" disabled={submitting} className="button-primary min-h-12 w-full rounded-xl disabled:cursor-not-allowed">
                {submitting ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          <p className="mt-6 border-t border-[#EDF1F4] pt-5 text-center text-sm text-[#718396]">
            Are you an authorized officer? <Link href="/login" className="font-bold text-[#1877B9] hover:text-[#075B94]">Sign in here</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
