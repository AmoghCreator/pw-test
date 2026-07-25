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
      className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-white overflow-y-auto"
    >
      <div className="max-w-xl w-full text-center space-y-6">
        <header className="space-y-2">
          <span aria-hidden="true" className="text-4xl block">
            🚨
          </span>
          <h2 id="crisis-title" className="text-3xl font-extrabold text-red-400">
            Crisis Mode — Sanctuary Takeover
          </h2>
          <p className="text-sm text-slate-300">
            You are safe. Take a pause and breathe with the rhythm below.
          </p>
        </header>

        <BreathingCircle />

        {groundingText && (
          <section aria-label="Crisis Grounding Prompt" className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
            <h3 className="text-xs uppercase font-semibold text-slate-400 mb-2">
              Grounding Step
            </h3>
            <p className="text-lg text-slate-100 italic leading-relaxed">
              &ldquo;{groundingText}&rdquo;
            </p>
          </section>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl border border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
        >
          Return to Sanctuary Workspace
        </button>
      </div>
    </div>
  );
}
