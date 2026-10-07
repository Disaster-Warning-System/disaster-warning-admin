export const shelterStyles = {
  page: "min-h-screen bg-[#f4f7f9] px-4 py-8 text-[#183447] sm:px-6 sm:py-10",
  container: "mx-auto w-full max-w-7xl space-y-6",
  card: "rounded-2xl border border-[#dce6ea] bg-white shadow-sm",
  primaryButton:
    "inline-flex items-center justify-center rounded-xl bg-[#1877b9] px-5 py-3 font-semibold text-white transition hover:bg-[#176fa8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877b9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
  secondaryLink:
    "font-semibold text-[#176fa8] transition hover:text-[#183447]",
  input:
    "mt-1 block w-full rounded-xl border border-[#dce6ea] bg-white px-3 py-3 text-[#183447] outline-none transition placeholder:text-[#8a9aa3] focus:border-[#1877b9] focus:ring-2 focus:ring-[#1877b9]/20",
  label: "block text-sm font-semibold text-[#344b5a]",
  muted: "text-[#71818b]",
} as const;
