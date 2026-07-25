"use client";

import React from "react";
import { CaregiverCard } from "@/components/CaregiverCard";
import type { CaregiverAppWindowProps, FeedItem } from "@/lib/types";

/** Renders the smartphone top status bar with notch / Dynamic Island */
function CaregiverStatusBar(): React.JSX.Element {
  return (
    <div className="bg-slate-950 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-400 select-none border-b border-slate-900/80">
      <span className="text-slate-200 tracking-tight">09:41</span>
      <div className="w-24 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center gap-1.5 shadow-inner">
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-cyan-500/80 animate-pulse" />
        <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-slate-700" />
      </div>
      <div className="flex items-center gap-1.5 text-slate-300">
        <span aria-hidden="true" title="5G">5G</span>
        <span aria-hidden="true">📶</span>
        <span aria-hidden="true">🔋</span>
      </div>
    </div>
  );
}

/** Renders the iOS-style bottom home navigation bar */
function CaregiverHomeBar(): React.JSX.Element {
  return (
    <div className="bg-slate-950 py-2.5 flex items-center justify-center border-t border-slate-900/80">
      <div aria-hidden="true" className="w-32 h-1 bg-slate-700 hover:bg-slate-500 transition-colors rounded-full" />
    </div>
  );
}

/** Renders header title block */
function CaregiverHeaderTitle(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 font-extrabold text-base shadow-inner">
        <span aria-hidden="true">🛡️</span>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
          Command
          <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-1.5 py-0.5 rounded-full font-bold">Clinical</span>
        </h3>
        <p className="text-[10px] text-cyan-300/80 font-medium">Caregiver Console</p>
      </div>
    </div>
  );
}

/** Renders the top console-style header for the Caregiver Portal App */
function CaregiverAppHeader({ count }: { count: number }): React.JSX.Element {
  return (
    <header className="bg-slate-950/95 border-b border-cyan-500/30 px-5 py-3 flex items-center justify-between gap-2 shadow-sm">
      <CaregiverHeaderTitle />
      <div className="flex items-center gap-1.5">
        <span className="bg-cyan-950/90 border border-cyan-700/60 px-2 py-0.5 rounded-full text-[10px] text-cyan-300 font-bold shadow-sm flex items-center gap-1 animate-pulse">
          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-cyan-400 inline-block" />
          Live Sync
        </span>
        <span className="bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-300">
          {count}
        </span>
      </div>
    </header>
  );
}

/** Renders prominent Privacy Shield badge explaining zero-speech quote leakage */
function PrivacyShieldBadge(): React.JSX.Element {
  return (
    <section aria-label="Privacy Shield Active Indicator" className="bg-gradient-to-r from-teal-950/90 via-cyan-950/80 to-slate-900 border border-teal-500/40 rounded-2xl p-3.5 text-xs text-slate-200 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden">
      <div aria-hidden="true" className="absolute -left-6 -bottom-6 w-24 h-24 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/50 flex items-center justify-center text-teal-300 text-base shadow-inner shrink-0">
          <span aria-hidden="true">🛡️</span>
        </div>
        <div>
          <h4 className="text-xs font-extrabold text-teal-300 tracking-tight flex items-center gap-1.5 uppercase">
            <span>🔒 Privacy Shield Active</span>
            <span className="bg-teal-900/80 text-teal-200 border border-teal-600/50 px-1.5 py-0.2 text-[9px] rounded font-bold">Zero-Speech Leak</span>
          </h4>
          <p className="text-[11px] text-slate-300 leading-tight mt-0.5">
            Architectural isolation: Raw quotes stay on user device/LLM. Caregiver receives abstracted medical guidance only.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 bg-slate-950/90 border border-slate-800 px-2.5 py-1 rounded-xl text-[10px] font-bold text-teal-400 shrink-0 self-end sm:self-center">
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
        <span>E2E Abstraction</span>
      </div>
    </section>
  );
}

/** Renders patient status information bar */
function CaregiverPatientStatusBar(): React.JSX.Element {
  return (
    <section aria-label="Monitored Patient Status" className="bg-cyan-950/40 border border-cyan-800/50 rounded-2xl p-3.5 text-xs text-slate-200 shadow-inner flex flex-wrap items-center justify-between gap-1.5">
      <div className="flex items-center gap-1.5">
        <span aria-hidden="true" className="text-sm">👤</span>
        <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">Subject:</span>
        <span className="text-[11px] font-semibold text-white">Sanctuary User (#01)</span>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-300">
        <span className="flex items-center gap-1 text-emerald-400"><span aria-hidden="true">🟢</span> Online</span>
        <span className="text-slate-500">|</span>
        <span className="text-cyan-300">🔒 HIPAA Safe</span>
      </div>
    </section>
  );
}

/** Renders empty state when no guidance cards exist */
function CaregiverEmptyState(): React.JSX.Element {
  return (
    <div className="text-center py-12 text-slate-400 border-2 border-dashed border-cyan-900/50 rounded-2xl bg-slate-950/50 space-y-2 p-5 my-auto">
      <div aria-hidden="true" className="text-3xl mb-1">📡</div>
      <p className="text-xs font-bold text-cyan-300">Awaiting Check-in from Sanctuary App...</p>
      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
        When the user performs a check-in, synchronized AI action plans will stream directly to this console.
      </p>
    </div>
  );
}

/** Renders the list of caregiver guidance cards */
function CaregiverFeedList({ feed }: { feed: FeedItem[] }): React.JSX.Element {
  if (feed.length === 0) return <CaregiverEmptyState />;
  return (
    <div role="status" aria-live="polite" className="space-y-4">
      {feed.map((item) => (
        <CaregiverCard key={item.id} id={item.id} caregiverFacing={item.caregiverFacing} createdAt={item.createdAt} inputType={item.inputType} />
      ))}
    </div>
  );
}

/** Side-by-side Caregiver Application Window Component formatted as a Flagship Smartphone */
export function CaregiverAppWindow({ caregiverFeed }: CaregiverAppWindowProps): React.JSX.Element {
  return (
    <section aria-label="Caregiver Command Center Application Window" className="h-[calc(100vh-40px)] min-h-[600px] max-h-[960px] aspect-[9/19.5] mx-auto bg-slate-950 border-[10px] border-slate-900 rounded-[3.2rem] shadow-[0_20px_70px_-10px_rgba(6,182,212,0.35)] ring-1 ring-slate-800 flex flex-col overflow-hidden relative transition-all duration-300 hover:shadow-[0_25px_85px_-10px_rgba(6,182,212,0.5)] hover:border-slate-800/90 shrink-0">
      <CaregiverStatusBar />
      <CaregiverAppHeader count={caregiverFeed.length} />
      <div className="px-4 sm:px-5 py-4 space-y-4 flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/30">
        <PrivacyShieldBadge />
        <CaregiverPatientStatusBar />
        <CaregiverFeedList feed={caregiverFeed} />
      </div>
      <CaregiverHomeBar />
    </section>
  );
}

