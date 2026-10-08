export const shelterStyles = {
  page: "min-h-screen bg-[#F5F7FA] px-4 py-6 text-[#16283D] sm:px-6 sm:py-8 lg:px-8",
  container: "mx-auto w-full max-w-7xl space-y-6",
  card: "rounded-2xl border border-[#DDE5EE] bg-white shadow-sm",
  primaryButton:
    "inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#1877B9] px-5 py-3 text-base font-semibold text-white transition hover:bg-[#075B94] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto",
  secondaryLink:
    "inline-flex min-h-11 items-center font-semibold text-[#1877B9] transition hover:text-[#075B94]",
  input:
    "mt-1 block min-h-11 w-full rounded-xl border border-[#DDE5EE] bg-white px-3 py-3 text-base text-[#16283D] outline-none transition placeholder:text-[#6B7C8F] focus:border-[#1877B9] focus:ring-2 focus:ring-[#1877B9]/20 sm:text-sm",
  label: "block text-sm font-semibold text-[#16283D]",
  muted: "text-[#6B7C8F]",
} as const;
