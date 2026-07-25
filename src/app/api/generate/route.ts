import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { BigQuery } from "@google-cloud/bigquery";
import { writeLog } from "@/lib/logger";
import { getFirestoreAdmin } from "@/lib/firebase-admin";
import { generateDualChannelGuidance, getFallbackGuidance } from "@/lib/gemini";
import { GenerateRequestSchema, ValidatedGenerateRequest, ValidatedGeminiResponse } from "@/lib/validators";
import { BQ_DATASET, BQ_TABLE, FIRESTORE_SESSIONS_COLLECTION } from "@/lib/constants";
import type { GenerateResult } from "@/lib/types";

const bigquery = new BigQuery();

/** Inserts analytics metrics to BigQuery */
async function trackEvent(userId: string, durationMs: number): Promise<void> {
  try {
    const table = bigquery.dataset(BQ_DATASET).table(BQ_TABLE);
    await table.insert([{ userId, durationMs, timestamp: new Date().toISOString() }]);
  } catch (err) {
    console.error("[BigQuery] Insert failed:", err);
  }
}

/** Saves generation outcome to Firestore */
async function cacheSession(
  input: ValidatedGenerateRequest,
  guidance: ValidatedGeminiResponse
): Promise<string> {
  const db = getFirestoreAdmin();
  const docRef = await db.collection(FIRESTORE_SESSIONS_COLLECTION).add({
    userId: input.userId,
    inputType: input.inputType,
    emotionTap: input.emotionTap ?? null,
    userFacing: guidance.user_facing,
    caregiverFacing: guidance.caregiver_facing,
    createdAt: new Date(),
  });
  return docRef.id;
}

/** Helper to record telemetry asynchronously */
async function recordTelemetry(userId: string, sessionId: string, durationMs: number): Promise<void> {
  await Promise.all([
    writeLog({ event: "generation_complete", docId: sessionId, durationMs, userId }),
    trackEvent(userId, durationMs),
  ]);
}

/** Formats error response cleanly */
function handleApiError(err: unknown): NextResponse {
  if (err instanceof z.ZodError) {
    return NextResponse.json({ success: false, error: "Invalid request data" }, { status: 400 });
  }
  const message = err instanceof Error ? err.message : "Unknown error";
  console.error("[/api/generate] Error:", message);
  return NextResponse.json(
    { success: false, error: "Failed to generate result. Please try again." },
    { status: 500 }
  );
}

/** POST /api/generate - Main Route Handler */
export async function POST(req: Request): Promise<NextResponse> {
  const startTime = Date.now();
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid request body" }, { status: 400 });
  }

  const parseResult = GenerateRequestSchema.safeParse(body);
  if (!parseResult.success) {
    return handleApiError(parseResult.error);
  }

  const input = parseResult.data;
  let guidance: ValidatedGeminiResponse;

  try {
    guidance = await generateDualChannelGuidance(input);
  } catch (err) {
    console.error("[/api/generate] Gemini call failed, utilizing safe fallback:", err);
    guidance = getFallbackGuidance(input);
  }

  try {
    const sessionId = await cacheSession(input, guidance);
    const durationMs = Date.now() - startTime;
    await recordTelemetry(input.userId, sessionId, durationMs);
    const responsePayload: GenerateResult = { sessionId, data: guidance };
    return NextResponse.json({ success: true, ...responsePayload });
  } catch (err) {
    return handleApiError(err);
  }
}
