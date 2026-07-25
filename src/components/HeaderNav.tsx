"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { USER_ROUTE, CAREGIVER_ROUTE } from "@/lib/constants";

/** Accessible navigation item component */
function NavItem({
  href,
  label,
  isActive,
}: {
  href: string;
  label: string;
  isActive: boolean;
}): React.JSX.Element {
  const activeClass = isActive
    ? "bg-slate-800 text-teal-400 font-semibold border-b-2 border-teal-400"
    : "text-slate-300 hover:text-white hover:bg-slate-800/60";
  return (
    <Link
      href={href}
      className={`px-4 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 ${activeClass}`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

/** Global header and navigation bar */
export function HeaderNav(): React.JSX.Element {
  const pathname = usePathname();
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 font-bold"
            aria-hidden="true"
          >
            HB
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              Haven Bridge
            </h1>
            <p className="text-xs text-slate-400">
              GenAI Crisis Recovery &amp; Prevention Companion
            </p>
          </div>
        </div>
        <nav aria-label="Main Navigation" className="flex items-center gap-2">
          <NavItem href="/" label="Dual View" isActive={pathname === "/"} />
          <NavItem
            href={USER_ROUTE}
            label="Sanctuary (User)"
            isActive={pathname === USER_ROUTE}
          />
          <NavItem
            href={CAREGIVER_ROUTE}
            label="Command Center (Caregiver)"
            isActive={pathname === CAREGIVER_ROUTE}
          />
        </nav>
      </div>
    </header>
  );
}
