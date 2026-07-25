"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { generateResult } from "@/lib/api";
import { logAnalyticsEvent } from "@/lib/firebase";
import { useVoiceConversation } from "@/features/voice/useVoiceConversation";
import type { GenerateResult, GeminiOutput, FeedItem, DualAppController } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";

/** Builds a ValidatedGenerateRequest from a spoken transcript */
function buildVoiceRequest(spokenText: string): ValidatedGenerateRequest {
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

/** Prepends a new guidance item to the caregiver feed state */
function appendFeedItem(res: GenerateResult, inputType: string, setFeed: React.Dispatch<React.SetStateAction<FeedItem[]>>): void {
  setFeed((prev) => [{ id: res.sessionId, caregiverFacing: res.data.caregiver_facing, createdAt: new Date(), inputType }, ...prev]);
}

const INITIAL_CHECKIN_ITEM: FeedItem = {
  id: "initial-checkin-01",
  createdAt: new Date(),
  inputType: "Check-in",
  caregiverFacing: {
    alert_level: "LOW",
    privacy_safe_summary: "Patient opened Sanctuary active recovery app and completed daily check-in.",
    action_script: [
      "Acknowledge the daily check-in with a positive reinforcement nudge.",
      "Check in on their daily active recovery goals if appropriate.",
      "No urgent action required; continue passive supportive monitoring.",
    ],
    educational_rationale: "Regular daily check-ins establish a consistent habit loop that strengthens resilience and early intervention.",
  },
};

/** Manages core dual-app state variables */
function useDualAppState() {
  const [result, setResult] = useState<GenerateResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCrisisOpen, setIsCrisisOpen] = useState<boolean>(false);
  const [caregiverFeed, setCaregiverFeed] = useState<FeedItem[]>([INITIAL_CHECKIN_ITEM]);
  return { result, setResult, isLoading, setIsLoading, error, setError, isCrisisOpen, setIsCrisisOpen, caregiverFeed, setCaregiverFeed };
}

/** Executes check-in API call */
async function executeCheckin(request: ValidatedGenerateRequest, state: ReturnType<typeof useDualAppState>, speakFn?: (text: string) => Promise<void>): Promise<void> {
  state.setIsLoading(true);
  state.setError(null);
  logAnalyticsEvent("generate_start", { inputType: request.inputType });
  try {
    const res = await generateResult(request);
    state.setResult(res);
    logAnalyticsEvent("generate_complete", { sessionId: res.sessionId });
    appendFeedItem(res, request.inputType, state.setCaregiverFeed);
    if (res.data.user_facing.suggested_mode === "CRISIS") state.setIsCrisisOpen(true);
    if (speakFn) await speakFn(res.data.user_facing.grounding_text);
  } catch (err) {
    state.setError(err instanceof Error ? err.message : "Failed to process check-in");
  } finally {
    state.setIsLoading(false);
  }
}

/** Main controller hook for dual-app synchronized workflow */
export function useDualAppController(): DualAppController {
  const state = useDualAppState();
  const speakRef = useRef<((text: string) => Promise<void>) | null>(null);

  const handleCheckin = useCallback(async (req: ValidatedGenerateRequest): Promise<void> => {
    await executeCheckin(req, state, speakRef.current ?? undefined);
  }, [state]);

  const handleVoiceTranscript = useCallback(async (text: string): Promise<void> => {
    await handleCheckin(buildVoiceRequest(text));
  }, [handleCheckin]);

  const voice = useVoiceConversation(handleVoiceTranscript);
  useEffect(() => { speakRef.current = voice.speakText; }, [voice.speakText]);

  const handleSelectHistoryItem = (item: { userFacing: GeminiOutput["user_facing"]; caregiverFacing: GeminiOutput["caregiver_facing"] }): void => {
    state.setResult({ sessionId: "history-session", data: { user_facing: item.userFacing, caregiver_facing: item.caregiverFacing } });
  };

  const handleFormSubmit = async (req: ValidatedGenerateRequest): Promise<void> => {
    voice.resetTranscript();
    await handleCheckin(req);
  };

  return {
    result: state.result, isLoading: state.isLoading, error: state.error, isCrisisOpen: state.isCrisisOpen, caregiverFeed: state.caregiverFeed,
    voiceMode: voice.voiceMode, transcript: voice.transcript, interimTranscript: voice.interimTranscript, canUseVoice: voice.canUseVoice,
    startListening: voice.startListening, stopListening: voice.stopListening, speakText: voice.speakText,
    handleFormSubmit, handleSelectHistoryItem, handleClearError: () => state.setError(null), handleOpenCrisis: () => state.setIsCrisisOpen(true), handleCloseCrisis: () => state.setIsCrisisOpen(false),
  };
}
