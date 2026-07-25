"use client";

import React, { useState } from "react";
import { HeaderNav } from "@/components/HeaderNav";
import { SanctuaryInputForm } from "@/components/SanctuaryInputForm";
import { GroundingDisplay } from "@/components/GroundingDisplay";
import { CrisisTakeoverModal } from "@/components/CrisisTakeoverModal";
import { CaregiverCard } from "@/components/CaregiverCard";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { AuthHistoryBar } from "@/components/AuthHistoryBar";
import { generateResult } from "@/lib/api";
import { logAnalyticsEvent } from "@/lib/firebase";
import type { GenerateResult, CaregiverFacingOutput, GeminiOutput } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";

interface FeedItem {
  id: string;
  caregiverFacing: CaregiverFacingOutput;
  createdAt: Date;
  inputType: string;
}

/** Side-by-side Dual View Home Page */
export default function HomePage(): React.JSX.Element {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [caregiverFeed, setCaregiverFeed] = useState<FeedItem[]>([]);

  async function handleCheckin(request: ValidatedGenerateRequest): Promise<void> {
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
      <main id="main-content" tabIndex={-1} className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
        <section aria-label="Dual-Window Platform Overview" className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-2xl font-extrabold text-teal-400">
            Haven Bridge — Dual-Window Interface
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Left: The Sanctuary (User zero-typing check-in &amp; calm mode) | Right: Command Center (Caregiver real-time guidance)
          </p>
        </section>

        <AuthHistoryBar onSelectHistoryItem={handleSelectHistoryItem} />

        {error && <ErrorDisplay message={error} onRetry={() => setError(null)} />}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section aria-label="Sanctuary Window" className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-6">
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
          </section>

          <section aria-label="Caregiver Command Center Feed Window" className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-6">
            <header className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">Caregiver Command Feed</h3>
                <p className="text-xs text-slate-400">Real-time synchronized guidance cards</p>
              </div>
              <span className="text-xs bg-teal-900/60 text-teal-300 border border-teal-700 px-2.5 py-1 rounded-full font-semibold">
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
