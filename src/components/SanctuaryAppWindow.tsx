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

/** Renders the welcoming instruction banner inside the User App */
function SanctuaryWelcomeBanner(): React.JSX.Element {
  return (
    <section aria-label="Sanctuary Welcome" className="bg-emerald-950/40 border border-emerald-800/50 rounded-2xl p-3.5 text-xs text-slate-200 shadow-inner">
      <p className="font-bold text-emerald-300 flex items-center gap-1.5"><span aria-hidden="true">✨</span> Zero-typing support ready</p>
      <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">Select how you feel below or tap the microphone to speak naturally.</p>
    </section>
  );
}

/** Inner Form & Display Container */
function SanctuaryAppBody(props: SanctuaryAppWindowProps): React.JSX.Element {
  return (
    <div className="px-4 sm:px-5 py-4 space-y-5 flex-1 overflow-y-auto bg-gradient-to-b from-slate-950 via-slate-900 to-emerald-950/30">
      <SanctuaryWelcomeBanner />
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

