import type { GenerateResult } from "@/lib/types";
import type { ValidatedGenerateRequest } from "@/lib/validators";
import { API_TTS_ROUTE } from "@/lib/constants";

function isErrorResponse(data: unknown): data is { error: string } {
  return typeof data === "object" && data !== null && "error" in data && typeof (data as Record<string, unknown>).error === "string";
}

export async function generateResult(input: ValidatedGenerateRequest): Promise<GenerateResult> {
  const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
  const data: unknown = await response.json();
  if (!response.ok) throw new Error(isErrorResponse(data) ? data.error : "Something went wrong. Please try again.");
  return data as GenerateResult;
}

export async function synthesizeSpeech(text: string): Promise<string> {
  const response = await fetch(API_TTS_ROUTE, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
  const data: unknown = await response.json();
  if (!response.ok) throw new Error(isErrorResponse(data) ? data.error : "Failed to synthesize speech.");
  const result = data as { audioContent?: string };
  if (!result.audioContent) throw new Error("No audio content received from TTS service.");
  return result.audioContent;
}
