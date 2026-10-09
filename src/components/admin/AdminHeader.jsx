"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROLES } from "@/src/lib/roles";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", roles: [ROLES.DMC_OFFICER, ROLES.DISTRICT_OFFICER] },
  { href: "/hazard-reports", label: "Verify reports", roles: [ROLES.DMC_OFFICER] },
  { href: "/shelters", label: "Shelters", roles: [ROLES.DISTRICT_OFFICER] },
];

export default function AdminHeader({ user, onSignOut }) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => item.roles.includes(user.role));

  return (
    <header className="border-b border-[#DDE5EE] bg-white px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
        <nav aria-label="Admin" className="flex flex-wrap items-center gap-1">
          {items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active ? "bg-[#E8F2FA] text-[#075B94]" : "text-[#16283D] hover:bg-[#F5F7FA]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex min-w-0 items-center gap-3">
          <p className="min-w-0 truncate text-sm font-semibold text-[#16283D]">
            {user.name} <span className="font-normal text-[#6B7C8F]">· {user.role}</span>
          </p>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-[#DDE5EE] px-4 py-2 text-sm font-semibold text-[#1877B9] hover:bg-[#F5F7FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877B9]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
