"use client";

import React, { useState, useCallback, useRef } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { SanctuaryInputForm } from "@/components/SanctuaryInputForm";
import { GroundingDisplay } from "@/components/GroundingDisplay";
import { CrisisTakeoverModal } from "@/components/CrisisTakeoverModal";
import { CaregiverCard } from "@/components/CaregiverCard";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { AuthHistoryBar } from "@/components/AuthHistoryBar";
import { generateResult } from "@/lib/api";
import { logAnalyticsEvent } from "@/lib/firebase";
import { useVoiceConversation } from "@/features/voice/useVoiceConversation";
import type { GenerateResult, CaregiverFacingOutput, GeminiOutput } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";

interface FeedItem {
  id: string;
  caregiverFacing: CaregiverFacingOutput;
  createdAt: Date;
  inputType: string;
}

/** Builds a ValidatedGenerateRequest from a spoken transcript */
function buildVoiceRequest(spokenText: string): ValidatedGenerateRequest {
  return {
    userId: "sanctuary-user-01",
    inputType: "voice",
    emotionTap: undefined,
    audioBase64: undefined,
    imageBase64: undefined,
    transcriptText: spokenText,
    userProfile: {
      name: "User",
      substanceType: "alcohol",
      comfortTriggers: ["music", "fresh air", "calling a friend"],
      copingMechanisms: ["deep breathing", "grounding exercises"],
      safeContact: "Support contact",
    },
  };
}

/** Side-by-side Dual View Home Page */
export default function HomePage(): React.JSX.Element {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [caregiverFeed, setCaregiverFeed] = useState<FeedItem[]>([]);

  /** Ref to hold speakText so handleCheckin can call it without forward-ref issues */
  const speakTextRef = useRef<((text: string) => Promise<void>) | null>(null);

  /** Core check-in handler — called by both form submit and voice transcript */
  const handleCheckin = useCallback(
    async (request: ValidatedGenerateRequest): Promise<void> => {
      setIsLoading(true);
      setError(null);
      logAnalyticsEvent("generate_start", { inputType: request.inputType });
      try {
        const res = await generateResult(request);
        setResult(res);
        logAnalyticsEvent("generate_complete", { sessionId: res.sessionId });
        setCaregiverFeed((prev) => [
          {
            id: res.sessionId,
            caregiverFacing: res.data.caregiver_facing,
            createdAt: new Date(),
            inputType: request.inputType,
          },
          ...prev,
        ]);
        if (res.data.user_facing.suggested_mode === "CRISIS") {
          setIsCrisisOpen(true);
        }
        // Auto-speak the grounding response after Gemini replies
        if (speakTextRef.current) {
          await speakTextRef.current(res.data.user_facing.grounding_text);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to process check-in";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /** Called by the voice hook when a final transcript is ready */
  const handleVoiceTranscript = useCallback(
    async (spokenText: string): Promise<void> => {
      const request = buildVoiceRequest(spokenText);
      await handleCheckin(request);
    },
    [handleCheckin]
  );

  const {
    voiceMode,
    transcript,
    interimTranscript,
    canUseVoice,
    startListening,
    stopListening,
    speakText,
    resetTranscript,
  } = useVoiceConversation(handleVoiceTranscript);

  // Keep the ref in sync so handleCheckin can call speakText without forward-ref ESLint errors
  React.useEffect(() => {
    speakTextRef.current = speakText;
  }, [speakText]);

  function handleSelectHistoryItem(item: {
    userFacing: GeminiOutput["user_facing"];
    caregiverFacing: GeminiOutput["caregiver_facing"];
  }): void {
    setResult({
      sessionId: "history-session",
      data: {
        user_facing: item.userFacing,
        caregiver_facing: item.caregiverFacing,
      },
    });
  }

  async function handleFormSubmit(request: ValidatedGenerateRequest): Promise<void> {
    resetTranscript();
    await handleCheckin(request);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        <section
          aria-label="Dual-Window Platform Overview"
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl"
        >
          <h2 className="text-2xl font-extrabold text-teal-400 tracking-tight">
            Haven Bridge — Dual-Window Platform
          </h2>
          <p className="text-sm text-slate-300 mt-1 font-medium">
            Left: The Sanctuary (User zero-typing check-in &amp; calm mode) | Right: Command Center (Caregiver real-time guidance)
          </p>
        </section>

        <AuthHistoryBar onSelectHistoryItem={handleSelectHistoryItem} />

        {error && <ErrorDisplay message={error} onRetry={() => setError(null)} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section
            aria-label="Sanctuary Window"
            className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl"
          >
            <SanctuaryInputForm
              onSubmit={handleFormSubmit}
              isLoading={isLoading}
              onCrisisTrigger={() => setIsCrisisOpen(true)}
              voiceMode={voiceMode}
              transcript={transcript}
              interimTranscript={interimTranscript}
              canUseVoice={canUseVoice}
              onStartListening={startListening}
              onStopListening={stopListening}
            />
            {result && (
              <GroundingDisplay
                userFacing={result.data.user_facing}
                onEnterCrisisMode={() => setIsCrisisOpen(true)}
                voiceMode={voiceMode}
                onSpeak={speakText}
              />
            )}
          </section>

          <section
            aria-label="Caregiver Command Center Feed Window"
            className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-extrabold text-white tracking-tight">Caregiver Command Feed</h3>
                <p className="text-xs text-slate-400 font-medium">Real-time synchronized guidance cards</p>
              </div>
              <span className="text-xs bg-teal-950 text-teal-300 border border-teal-700 px-3 py-1 rounded-full font-bold shadow-sm">
                {caregiverFeed.length} Cards
              </span>
            </header>

            <div role="status" aria-live="polite" className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
              {caregiverFeed.length === 0 ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                  <p className="text-sm font-medium">No guidance cards generated yet.</p>
                  <p className="text-xs text-slate-600 mt-1">Perform a check-in on the left to trigger Gemini response.</p>
                </div>
              ) : (
                caregiverFeed.map((item) => (
                  <CaregiverCard
                    key={item.id}
                    id={item.id}
                    caregiverFacing={item.caregiverFacing}
                    createdAt={item.createdAt}
                    inputType={item.inputType}
                  />
                ))
              )}
            </div>
          </section>
        </div>
      </main>

      <CrisisTakeoverModal
        isOpen={isCrisisOpen}
        groundingText={result?.data.user_facing.grounding_text ?? "Take a slow, deep breath."}
        onClose={() => setIsCrisisOpen(false)}
      />
    </div>
  );
}
