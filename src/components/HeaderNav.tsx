"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { USER_ROUTE, CAREGIVER_ROUTE } from "@/lib/constants";

/** Accessible navigation item component */
function NavItem({ href, label, isActive }: { href: string; label: string; isActive: boolean }): React.JSX.Element {
  const activeClass = isActive
    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-sm shadow-teal-500/10"
    : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent";
  return (
    <Link
      href={href}
      className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 flex items-center gap-1.5 ${activeClass}`}
      aria-current={isActive ? "page" : undefined}
    >
      {label}
    </Link>
  );
}

/** Brand logo and title block */
function HeaderBrand(): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 p-[1px] shadow-lg shadow-teal-500/20" aria-hidden="true">
        <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300">
          HB
        </div>
      </div>
      <div>
        <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
          Haven Bridge
          <span className="text-[10px] uppercase font-extrabold bg-teal-950 text-teal-300 border border-teal-800/80 px-2 py-0.5 rounded-full">GenAI v2.5</span>
        </h1>
        <p className="text-xs text-slate-400 font-medium">Zero-Typing Crisis Recovery &amp; Prevention Engine</p>
      </div>
    </div>
  );
}

/** Global header and navigation bar */
export function HeaderNav(): React.JSX.Element {
  const pathname = usePathname();
  return (
    <header className="bg-slate-950/90 border-b border-slate-800/80 text-white px-4 sm:px-6 py-3.5 shadow-md backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <HeaderBrand />
        <nav aria-label="Main Navigation" className="flex flex-wrap items-center justify-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <NavItem href="/" label="📱 Dual Studio" isActive={pathname === "/"} />
          <NavItem href={USER_ROUTE} label="🌿 Sanctuary App" isActive={pathname === USER_ROUTE} />
          <NavItem href={CAREGIVER_ROUTE} label="🛡️ Command Center" isActive={pathname === CAREGIVER_ROUTE} />
        </nav>
      </div>
    </header>
  );
}

