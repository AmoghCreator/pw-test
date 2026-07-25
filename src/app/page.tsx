"use client";

import React from "react";
import { SanctuaryAppWindow } from "@/components/SanctuaryAppWindow";
import { CaregiverAppWindow } from "@/components/CaregiverAppWindow";
import { CrisisTakeoverModal } from "@/components/CrisisTakeoverModal";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { useDualAppController } from "@/features/dual-app/useDualAppController";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { USER_ROUTE, CAREGIVER_ROUTE } from "@/lib/constants";

/** Nav item for vertical menu */
function VerticalNavItem({ href, label, isActive, icon }: { href: string; label: string; isActive: boolean; icon: string }): React.JSX.Element {
  const activeClass = isActive
    ? "bg-gradient-to-r from-teal-500/20 to-cyan-500/20 text-teal-300 font-bold border-teal-500/40 shadow-sm shadow-teal-500/10"
    : "text-slate-400 hover:text-white hover:bg-slate-800/60 border-transparent";
  return (
    <Link
      href={href}
      className={`px-3 py-2.5 rounded-xl text-xs transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-teal-400 flex flex-col items-center gap-1 border ${activeClass} w-20 text-center`}
      aria-current={isActive ? "page" : undefined}
    >
      <span className="text-xl mb-0.5">{icon}</span>
      <span className="leading-tight">{label}</span>
    </Link>
  );
}

/** Renders the vertical control panel containing branding, navigation, and bridge connector */
function VerticalControlPanel(): React.JSX.Element {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col items-center justify-center gap-8 py-4 px-2 xl:px-4">
      
      {/* Brand Icon */}
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 p-[1px] shadow-lg shadow-teal-500/20" aria-hidden="true" title="Haven Bridge">
        <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-300 text-lg">
          HB
        </div>
      </div>

      {/* Vertical Navigation Menu */}
      <nav aria-label="Main Navigation" className="flex flex-col items-center gap-2.5 bg-slate-900/90 p-2 rounded-[1.5rem] border border-slate-800 shadow-inner backdrop-blur-md">
        <VerticalNavItem href="/" label="Studio" icon="📱" isActive={pathname === "/"} />
        <VerticalNavItem href={USER_ROUTE} label="Sanctuary" icon="🌿" isActive={pathname === USER_ROUTE} />
        <VerticalNavItem href={CAREGIVER_ROUTE} label="Command" icon="🛡️" isActive={pathname === CAREGIVER_ROUTE} />
      </nav>

      {/* Live Sync Connector */}
      <div aria-label="Real-time synchronization indicator" role="status" className="bg-slate-900/60 border border-teal-500/30 px-3 py-2 rounded-2xl shadow-lg backdrop-blur-md flex flex-col items-center gap-2 mt-4 w-20 text-center">
        <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
        <span className="text-[9px] font-extrabold text-teal-300 uppercase tracking-widest leading-tight">Live<br/>Sync</span>
      </div>

    </div>
  );
}

/** Grid layout for Sanctuary and Caregiver side-by-side windows */
function DualWindowGrid({ ctrl }: { ctrl: ReturnType<typeof useDualAppController> }): React.JSX.Element {
  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-6 xl:gap-8 h-full">
      <SanctuaryAppWindow
        onSubmit={ctrl.handleFormSubmit}
        isLoading={ctrl.isLoading}
        onCrisisTrigger={ctrl.handleOpenCrisis}
        voiceMode={ctrl.voiceMode}
        transcript={ctrl.transcript}
        interimTranscript={ctrl.interimTranscript}
        canUseVoice={ctrl.canUseVoice}
        onStartListening={ctrl.startListening}
        onStopListening={ctrl.stopListening}
        userFacingOutput={ctrl.result?.data.user_facing ?? null}
        onSpeak={ctrl.speakText}
      />
      <VerticalControlPanel />
      <CaregiverAppWindow caregiverFeed={ctrl.caregiverFeed} />
    </div>
  );
}

/** Side-by-side Dual View Home Page */
export default function HomePage(): React.JSX.Element {
  const ctrl = useDualAppController();

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-teal-500 selection:text-slate-950 overflow-hidden">
      <main id="main-content" tabIndex={0} className="flex-1 w-full max-w-[1800px] mx-auto px-2 sm:px-4 py-4 flex flex-col justify-center items-center focus:outline-none min-h-screen h-screen">
        {ctrl.error && <ErrorDisplay message={ctrl.error} onRetry={ctrl.handleClearError} />}
        <DualWindowGrid ctrl={ctrl} />
      </main>
      <CrisisTakeoverModal isOpen={ctrl.isCrisisOpen} groundingText={ctrl.result?.data.user_facing.grounding_text ?? "Take a slow, deep breath."} onClose={ctrl.handleCloseCrisis} />
    </div>
  );
}

