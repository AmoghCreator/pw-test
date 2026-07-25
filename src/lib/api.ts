/**
 * Client-side API wrapper.
 * This is the ONLY place fetch() is called in frontend code.
 * Never import this in route handlers (server-side) — use Firebase Admin directly.
 */

import type { GenerateResult } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";
import { API_TTS_ROUTE } from "@/lib/constants";

const API_BASE = "";

/**
 * Calls POST /api/generate and returns the generated result.
 * Throws an Error with a user-readable message on failure.
 */
export async function generateResult(
  input: ValidatedGenerateRequest
): Promise<GenerateResult> {
  const response = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message =
      isErrorResponse(data) ? data.error : "Something went wrong. Please try again.";
    throw new Error(message);
  }

  return data as GenerateResult;
}

function isErrorResponse(data: unknown): data is { error: string } {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof (data as Record<string, unknown>).error === "string"
  );
}

/**
 * Calls POST /api/tts and returns base64-encoded MP3 audio.
 * Throws an Error with a user-readable message on failure.
 */
export async function synthesizeSpeech(text: string): Promise<string> {
  const response = await fetch(API_TTS_ROUTE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  const data: unknown = await response.json();

  if (!response.ok) {
    const message = isErrorResponse(data)
      ? data.error
      : "Failed to synthesize speech.";
    throw new Error(message);
  }

  const result = data as { audioContent?: string };
  if (!result.audioContent) {
    throw new Error("No audio content received from TTS service.");
  }
  return result.audioContent;
}
