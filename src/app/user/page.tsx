"use client";

import React, { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { SanctuaryInputForm } from "@/components/SanctuaryInputForm";
import { GroundingDisplay } from "@/components/GroundingDisplay";
import { CrisisTakeoverModal } from "@/components/CrisisTakeoverModal";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { AuthHistoryBar } from "@/components/AuthHistoryBar";
import { generateResult } from "@/lib/api";
import { logAnalyticsEvent } from "@/lib/firebase";
import type { GenerateResult, GeminiOutput } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";

export default function SanctuaryUserPage(): React.JSX.Element {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);

  async function handleCheckin(request: ValidatedGenerateRequest): Promise<void> {
    setIsLoading(true);
    setError(null);
    logAnalyticsEvent("generate_start", { inputType: request.inputType });
    try {
      const res = await generateResult(request);
      setResult(res);
      logAnalyticsEvent("generate_complete", { sessionId: res.sessionId });
      if (res.data.user_facing.suggested_mode === "CRISIS") {
        setIsCrisisOpen(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to process check-in";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSelectHistoryItem(item: { userFacing: GeminiOutput["user_facing"]; caregiverFacing: GeminiOutput["caregiver_facing"] }): void {
    setResult({
      sessionId: "history-session",
      data: {
        user_facing: item.userFacing,
        caregiver_facing: item.caregiverFacing,
      },
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 space-y-6">
        <section aria-label="Sanctuary Mode Instructions" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-teal-400 mb-2">The Sanctuary</h2>
          <p className="text-sm text-slate-300">
            A calm space for instant, zero-typing support. Record voice, select an emotion orb, or trigger crisis mode.
          </p>
        </section>

        <AuthHistoryBar onSelectHistoryItem={handleSelectHistoryItem} />

        {error && <ErrorDisplay message={error} onRetry={() => setError(null)} />}

        <SanctuaryInputForm
          onSubmit={handleCheckin}
          isLoading={isLoading}
          onCrisisTrigger={() => setIsCrisisOpen(true)}
        />

        {result && (
          <GroundingDisplay
            userFacing={result.data.user_facing}
            onEnterCrisisMode={() => setIsCrisisOpen(true)}
          />
        )}
      </main>

      <CrisisTakeoverModal
        isOpen={isCrisisOpen}
        groundingText={result?.data.user_facing.grounding_text ?? "Take a slow, deep breath."}
        onClose={() => setIsCrisisOpen(false)}
      />
    </div>
  );
}
