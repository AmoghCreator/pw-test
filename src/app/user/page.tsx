"use client";

import React, { useState, useCallback, useRef } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { SanctuaryAppWindow } from "@/components/SanctuaryAppWindow";
import { CrisisTakeoverModal } from "@/components/CrisisTakeoverModal";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { AuthHistoryBar } from "@/components/AuthHistoryBar";
import { generateResult } from "@/lib/api";
import { logAnalyticsEvent } from "@/lib/firebase";
import { useVoiceConversation } from "@/features/voice/useVoiceConversation";
import type { GenerateResult, GeminiOutput } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";

/** Builds a voice check-in request */
function buildVoiceRequest(spokenText?: string): ValidatedGenerateRequest {
  return {
    userId: "sanctuary-user-01",
    inputType: "voice",
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

/** Header banner describing sanctuary features */
function SanctuaryInstructionsBanner(): React.JSX.Element {
  return (
    <section aria-label="Sanctuary Mode Instructions" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-teal-400 mb-2">The Sanctuary</h2>
      <p className="text-sm text-slate-300">
        A calm space for instant, zero-typing support. Tap the mic to speak, select an emotion orb, or trigger crisis mode.
      </p>
    </section>
  );
}

interface SanctuaryMainViewProps {
  onSelectHistoryItem: (item: { userFacing: GeminiOutput["user_facing"]; caregiverFacing: GeminiOutput["caregiver_facing"] }) => void;
  error: string | null;
  onClearError: () => void;
  onFormSubmit: (request: ValidatedGenerateRequest) => Promise<void>;
  isLoading: boolean;
  onCrisisTrigger: () => void;
  voiceProps: {
    voiceMode: "idle" | "listening" | "processing" | "speaking";
    transcript: string;
    interimTranscript: string;
    canUseVoice: boolean;
    startListening: () => void;
    stopListening: () => void;
    speakText: (text: string) => Promise<void>;
  };
  result: GenerateResult | null;
}

/** Main content area containing form, history, and results */
function SanctuaryMainView({
  onSelectHistoryItem,
  error,
  onClearError,
  onFormSubmit,
  isLoading,
  onCrisisTrigger,
  voiceProps,
  result,
}: SanctuaryMainViewProps): React.JSX.Element {
  return (
    <main id="main-content" tabIndex={0} className="flex-1 max-w-3xl w-full mx-auto px-4 py-8 space-y-6 flex flex-col items-center focus:outline-none">
      <div className="w-full space-y-4">
        <SanctuaryInstructionsBanner />
        <AuthHistoryBar onSelectHistoryItem={onSelectHistoryItem} />
        {error && <ErrorDisplay message={error} onRetry={onClearError} />}
      </div>
      <SanctuaryAppWindow
        onSubmit={onFormSubmit}
        isLoading={isLoading}
        onCrisisTrigger={onCrisisTrigger}
        voiceMode={voiceProps.voiceMode}
        transcript={voiceProps.transcript}
        interimTranscript={voiceProps.interimTranscript}
        canUseVoice={voiceProps.canUseVoice}
        onStartListening={voiceProps.startListening}
        onStopListening={voiceProps.stopListening}
        userFacingOutput={result?.data.user_facing ?? null}
        onSpeak={voiceProps.speakText}
      />
    </main>
  );
}

export default function SanctuaryUserPage(): React.JSX.Element {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const speakTextRef = useRef<((text: string) => Promise<void>) | null>(null);

  const handleCheckin = useCallback(async (request: ValidatedGenerateRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    logAnalyticsEvent("generate_start", { inputType: request.inputType });
    try {
      const res = await generateResult(request);
      setResult(res);
      logAnalyticsEvent("generate_complete", { sessionId: res.sessionId });
      if (res.data.user_facing.suggested_mode === "CRISIS") setIsCrisisOpen(true);
      if (speakTextRef.current) await speakTextRef.current(res.data.user_facing.grounding_text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process check-in");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleVoiceTranscript = useCallback(async (text?: string): Promise<void> => {
    await handleCheckin(buildVoiceRequest(text));
  }, [handleCheckin]);

  const voiceState = useVoiceConversation(handleVoiceTranscript);
  React.useEffect(() => { speakTextRef.current = voiceState.speakText; }, [voiceState.speakText]);

  const handleSelectHistory = (item: { userFacing: GeminiOutput["user_facing"]; caregiverFacing: GeminiOutput["caregiver_facing"] }): void => {
    setResult({ sessionId: "history-session", data: { user_facing: item.userFacing, caregiver_facing: item.caregiverFacing } });
  };

  const handleFormSubmit = async (req: ValidatedGenerateRequest): Promise<void> => {
    voiceState.resetTranscript();
    await handleCheckin(req);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <HeaderNav />
      <SanctuaryMainView
        onSelectHistoryItem={handleSelectHistory}
        error={error}
        onClearError={() => setError(null)}
        onFormSubmit={handleFormSubmit}
        isLoading={isLoading}
        onCrisisTrigger={() => setIsCrisisOpen(true)}
        voiceProps={voiceState}
        result={result}
      />
      <CrisisTakeoverModal
        isOpen={isCrisisOpen}
        groundingText={result?.data.user_facing.grounding_text ?? "Take a slow, deep breath."}
        onClose={() => setIsCrisisOpen(false)}
      />
    </div>
  );
}
