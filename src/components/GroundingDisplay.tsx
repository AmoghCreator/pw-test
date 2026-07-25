"use client";

import React from "react";
import type { UserFacingOutput, VoiceMode } from "@/lib/types";

interface GroundingDisplayProps {
  userFacing: UserFacingOutput;
  onEnterCrisisMode?: () => void;
  voiceMode: VoiceMode;
  onSpeak: (text: string) => Promise<void>;
}

/** Status badge with icon + text (never color alone) */
function ModeBadge({ mode }: { mode: "CALM" | "CRISIS" }): React.JSX.Element {
  const isCrisis = mode === "CRISIS";
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
        isCrisis
          ? "bg-red-950 text-red-300 border-red-700 shadow-sm"
          : "bg-teal-950 text-teal-300 border-teal-700 shadow-sm"
      }`}
    >
      <span aria-hidden="true">{isCrisis ? "🚨" : "🌿"}</span>
      <span>{isCrisis ? "Crisis Mode Advised" : "Calm Mode"}</span>
    </span>
  );
}

/** Animated speaker bars shown during TTS playback */
function SpeakerBars(): React.JSX.Element {
  return (
    <span aria-hidden="true" className="flex items-end gap-[2px] h-4">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-[3px] bg-teal-400 rounded-full animate-speaker-pulse"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}

/** Grounding guidance output card with voice playback */
export function GroundingDisplay({
  userFacing,
  onEnterCrisisMode,
  voiceMode,
  onSpeak,
}: GroundingDisplayProps): React.JSX.Element {
  const isSpeaking = voiceMode === "speaking";

  function handleSpeak(): void {
    void onSpeak(userFacing.grounding_text);
  }

  return (
    <article
      role="status"
      aria-live="polite"
      className="bg-slate-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4 text-white"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span aria-hidden="true" className="text-xl">✨</span>
          <h3 className="text-lg font-bold text-teal-400">Gemini Grounding Guidance</h3>
        </div>
        <div className="flex items-center gap-2">
          <ModeBadge mode={userFacing.suggested_mode} />
          <button
            type="button"
            onClick={handleSpeak}
            disabled={isSpeaking}
            aria-label={isSpeaking ? "Speaking grounding text..." : "Hear grounding text aloud"}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all focus:outline-none focus:ring-2 focus:ring-teal-400 ${
              isSpeaking
                ? "bg-teal-950 text-teal-300 border-teal-700 cursor-not-allowed"
                : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
            }`}
          >
            {isSpeaking ? <SpeakerBars /> : <span aria-hidden="true">🔊</span>}
            <span>{isSpeaking ? "Speaking..." : "Hear aloud"}</span>
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <section aria-label="Detected Emotional State">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Detected Emotional State
          </h4>
          <p className="text-sm font-bold text-teal-300 mt-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            {userFacing.emotional_state}
          </p>
        </section>

        <section aria-label="Grounding Text">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider">
            Grounding Support
          </h4>
          <blockquote className="text-slate-100 text-base leading-relaxed italic bg-slate-950 p-4 rounded-xl border-l-4 border-teal-400 shadow-inner mt-1">
            &ldquo;{userFacing.grounding_text}&rdquo;
          </blockquote>
        </section>
      </div>

      {userFacing.suggested_mode === "CRISIS" && onEnterCrisisMode && (
        <button
          type="button"
          onClick={onEnterCrisisMode}
          className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center justify-center gap-2"
        >
          <span aria-hidden="true">🚨</span> Activate Full-Screen Crisis Breathing Guide
        </button>
      )}
    </article>
  );
}
