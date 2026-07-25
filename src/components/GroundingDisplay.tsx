"use client";

import React from "react";
import type { UserFacingOutput } from "@/lib/types";

interface GroundingDisplayProps {
  userFacing: UserFacingOutput;
  onEnterCrisisMode?: () => void;
}

/** Status badge with icon + text (never color alone) */
function ModeBadge({ mode }: { mode: "CALM" | "CRISIS" }): React.JSX.Element {
  const isCrisis = mode === "CRISIS";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
        isCrisis
          ? "bg-red-900/60 text-red-300 border border-red-700"
          : "bg-teal-900/60 text-teal-300 border border-teal-700"
      }`}
    >
      <span aria-hidden="true">{isCrisis ? "🚨" : "🌿"}</span>
      <span>{isCrisis ? "Crisis Mode Advised" : "Calm Mode"}</span>
    </span>
  );
}

/** Grounding guidance output card */
export function GroundingDisplay({
  userFacing,
  onEnterCrisisMode,
}: GroundingDisplayProps): React.JSX.Element {
  return (
    <article
      role="status"
      aria-live="polite"
      className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">
            ✨
          </span>
          <h3 className="text-lg font-bold text-white">Gemini Grounding Guidance</h3>
        </div>
        <ModeBadge mode={userFacing.suggested_mode} />
      </header>

      <div className="space-y-3">
        <section aria-label="Detected Emotional State">
          <h4 className="text-xs uppercase font-semibold text-slate-400">
            Detected Emotional State
          </h4>
          <p className="text-sm font-medium text-teal-300 mt-0.5">
            {userFacing.emotional_state}
          </p>
        </section>

        <section aria-label="Grounding Text">
          <h4 className="text-xs uppercase font-semibold text-slate-400">
            Grounding Support
          </h4>
          <blockquote className="text-slate-200 text-base leading-relaxed italic bg-slate-800/40 p-4 rounded-xl border-l-4 border-teal-500 my-1">
            &ldquo;{userFacing.grounding_text}&rdquo;
          </blockquote>
        </section>
      </div>

      {userFacing.suggested_mode === "CRISIS" && onEnterCrisisMode && (
        <button
          type="button"
          onClick={onEnterCrisisMode}
          className="w-full py-3 bg-red-700 hover:bg-red-600 text-white font-bold text-sm rounded-xl transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center gap-2"
        >
          <span aria-hidden="true">🚨</span> Activate Full-Screen Crisis Breathing Guide
        </button>
      )}
    </article>
  );
}
