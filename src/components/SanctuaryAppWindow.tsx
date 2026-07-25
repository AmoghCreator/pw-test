"use client";

import React from "react";
import { SanctuaryInputForm } from "@/components/SanctuaryInputForm";
import { GroundingDisplay } from "@/components/GroundingDisplay";
import type { SanctuaryAppWindowProps } from "@/lib/types";

/** Renders the smartphone top status bar with notch / Dynamic Island */
function MobileStatusBar(): React.JSX.Element {
  return (
    <div className="bg-slate-950 px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-bold text-slate-400 select-none border-b border-slate-900/80">
      <span className="text-slate-200 tracking-tight">09:41</span>
      <div className="w-24 h-4 bg-black rounded-full border border-slate-800 flex items-center justify-center gap-1.5 shadow-inner">
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-emerald-500/80 animate-pulse" />
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
function MobileHomeBar(): React.JSX.Element {
  return (
    <div className="bg-slate-950 py-2.5 flex items-center justify-center border-t border-slate-900/80">
      <div aria-hidden="true" className="w-32 h-1 bg-slate-700 hover:bg-slate-500 transition-colors rounded-full" />
    </div>
  );
}

/** Renders top icon title area */
function HeaderTitleArea(): React.JSX.Element {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 font-extrabold text-base shadow-inner">
        <span aria-hidden="true">🌿</span>
      </div>
      <div>
        <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
          Sanctuary
          <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded-full font-bold">User</span>
        </h3>
        <p className="text-[10px] text-emerald-300/80 font-medium">Zero-Typing Companion</p>
      </div>
    </div>
  );
}

/** Renders the top device-style header for the User Companion App */
function SanctuaryAppHeader(): React.JSX.Element {
  return (
    <header className="bg-slate-950/95 border-b border-emerald-500/30 px-5 py-3 flex items-center justify-between gap-2 shadow-sm">
      <HeaderTitleArea />
      <div className="flex items-center gap-1.5 bg-slate-900 border border-emerald-800/60 px-2.5 py-1 rounded-full text-[10px] text-emerald-300 font-bold shadow-sm">
        <span aria-hidden="true">🔒</span>
        <span>E2E Private • 🟢 Online</span>
      </div>
    </header>
  );
}

const INSPIRATIONAL_QUOTES = [
  { quote: "Recovery is not for people who need it, it's for people who want it.", author: "Daily Reflection" },
  { quote: "One day at a time. You don't have to see the whole staircase, just take the first step.", author: "Active Recovery" },
  { quote: "Your present circumstances don't determine where you can go; they merely determine where you start.", author: "Haven Wisdom" },
  { quote: "Healing doesn't mean the damage never existed. It means the damage no longer controls your life.", author: "Sanctuary Daily" },
];

/** Renders daily inspirational quote and check-in notification badge */
function ActiveRecoveryGreeting(): React.JSX.Element {
  const [quoteIdx] = React.useState(() => Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length));
  const item = INSPIRATIONAL_QUOTES[quoteIdx];
  return (
    <section aria-label="Active Recovery Inspiration Greeting" className="bg-gradient-to-br from-emerald-950/70 via-slate-900 to-teal-950/50 border border-emerald-500/40 rounded-2xl p-4 text-xs text-slate-200 shadow-lg relative overflow-hidden">
      <div aria-hidden="true" className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-center justify-between gap-2 border-b border-emerald-800/50 pb-2 mb-2">
        <span className="font-extrabold text-emerald-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
          <span aria-hidden="true">🌅</span> Active Recovery Daily
        </span>
        <span className="bg-emerald-900/80 text-emerald-300 border border-emerald-600/50 px-2 py-0.5 rounded-full text-[9px] font-bold flex items-center gap-1 shadow-sm">
          <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Caregiver Notified of Check-in
        </span>
      </div>
      <blockquote className="text-xs font-semibold text-white italic leading-relaxed">&ldquo;{item.quote}&rdquo;</blockquote>
      <p className="text-[10px] text-emerald-400/90 font-bold mt-1 text-right">&mdash; {item.author}</p>
    </section>
  );
}

/** Inner Form & Display Container */
function SanctuaryAppBody(props: SanctuaryAppWindowProps): React.JSX.Element {
  return (
    <div className="px-4 sm:px-5 py-4 space-y-5 flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/30">
      <ActiveRecoveryGreeting />
      <SanctuaryInputForm
        onSubmit={props.onSubmit}
        isLoading={props.isLoading}
        onCrisisTrigger={props.onCrisisTrigger}
        voiceMode={props.voiceMode}
        transcript={props.transcript}
        interimTranscript={props.interimTranscript}
        canUseVoice={props.canUseVoice}
        onStartListening={props.onStartListening}
        onStopListening={props.onStopListening}
      />
      {props.userFacingOutput && (
        <div className="pt-2">
          <GroundingDisplay userFacing={props.userFacingOutput} onEnterCrisisMode={props.onCrisisTrigger} voiceMode={props.voiceMode} onSpeak={props.onSpeak} />
        </div>
      )}
    </div>
  );
}

/** Side-by-side User Application Window Component formatted as a Flagship Smartphone */
export function SanctuaryAppWindow(props: SanctuaryAppWindowProps): React.JSX.Element {
  return (
    <section aria-label="Sanctuary User Application Window" className="h-[calc(100vh-40px)] min-h-[600px] max-h-[960px] aspect-[9/19.5] mx-auto bg-slate-950 border-[10px] border-slate-900 rounded-[3.2rem] shadow-[0_20px_70px_-10px_rgba(16,185,129,0.35)] ring-1 ring-slate-800 flex flex-col overflow-hidden relative transition-all duration-300 hover:shadow-[0_25px_85px_-10px_rgba(16,185,129,0.5)] hover:border-slate-800/90 shrink-0">
      <MobileStatusBar />
      <SanctuaryAppHeader />
      <SanctuaryAppBody {...props} />
      <MobileHomeBar />
    </section>
  );
}

