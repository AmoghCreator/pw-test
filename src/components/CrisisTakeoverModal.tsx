"use client";

import React, { useState, useEffect } from "react";
import { BREATHING_CYCLE_MS } from "@/lib/constants";

interface CrisisTakeoverModalProps {
  isOpen: boolean;
  groundingText?: string;
  onClose: () => void;
}

/** Animated breathing circle widget */
function BreathingCircle(): React.JSX.Element {
  const [phase, setPhase] = useState<"Inhale..." | "Hold..." | "Exhale...">("Inhale...");

  useEffect(() => {
    const halfCycle = BREATHING_CYCLE_MS / 2;
    const interval = setInterval(() => {
      setPhase((prev) => (prev === "Inhale..." ? "Exhale..." : "Inhale..."));
    }, halfCycle);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 my-6">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping opacity-75" />
        <div className="w-40 h-40 rounded-full bg-teal-600/30 border-4 border-teal-400 flex items-center justify-center shadow-2xl transition-transform duration-1000 transform hover:scale-105">
          <span className="text-xl font-bold text-teal-200 tracking-wide">
            {phase}
          </span>
        </div>
      </div>
      <p className="text-xs text-teal-300/80 uppercase font-semibold tracking-wider">
        Follow the circle pace (4s inhale / 4s exhale)
      </p>
    </div>
  );
}

/** Full-screen crisis mode modal takeover */
export function CrisisTakeoverModal({
  isOpen,
  groundingText,
  onClose,
}: CrisisTakeoverModalProps): React.JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="crisis-title"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      <div className="max-w-xl w-full bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative ring-1 ring-red-500/30 text-white">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close crisis takeover modal"
          className="absolute top-5 right-5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
        >
          <span aria-hidden="true" className="text-lg font-bold">✕</span>
        </button>

        <header className="space-y-2 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-950/80 border border-red-700/80 flex items-center justify-center text-2xl shadow-lg">
            🚨
          </div>
          <h2 id="crisis-title" className="text-2xl sm:text-3xl font-extrabold text-red-400 tracking-tight">
            Crisis Mode — Sanctuary Takeover
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            You are in a safe space. Take a pause and sync your breath with the visual rhythm below.
          </p>
        </header>

        <BreathingCircle />

        {groundingText && (
          <section aria-label="Crisis Grounding Prompt" className="bg-slate-950/80 border border-teal-800/50 p-5 rounded-2xl shadow-inner">
            <h3 className="text-[11px] uppercase font-bold text-teal-400 tracking-wider mb-1.5 flex items-center gap-1.5">
              <span>✨</span> Immediate Grounding Action
            </h3>
            <p className="text-base sm:text-lg text-slate-100 italic leading-relaxed">
              &ldquo;{groundingText}&rdquo;
            </p>
          </section>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/20 transition-all focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Return to Sanctuary Workspace
        </button>
      </div>
    </div>
  );
}
