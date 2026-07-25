import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSecret } from "@/lib/secrets";
import { writeLog } from "@/lib/logger";
import {
  TTS_VOICE_NAME,
  TTS_AUDIO_ENCODING,
  TTS_SPEAKING_RATE,
  TTS_PITCH,
} from "@/lib/constants";

const TTS_API_URL =
  "https://texttospeech.googleapis.com/v1/text:synthesize";

const TtsRequestSchema = z.object({
  text: z.string().min(1).max(5000),
  voiceName: z.string().optional(),
});

type TtsRequest = z.infer<typeof TtsRequestSchema>;

/** Builds the TTS API payload */
function buildTtsPayload(body: TtsRequest): Record<string, unknown> {
  return {
    input: { text: body.text },
    voice: {
      languageCode: "en-US",
      name: body.voiceName ?? TTS_VOICE_NAME,
    },
    audioConfig: {
      audioEncoding: TTS_AUDIO_ENCODING,
      speakingRate: TTS_SPEAKING_RATE,
      pitch: TTS_PITCH,
    },
  };
}

/** Calls Google Cloud TTS REST API */
async function callTtsApi(
  payload: Record<string, unknown>,
  apiKey: string
): Promise<string> {
  const response = await fetch(`${TTS_API_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`TTS API error ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) {
    throw new Error("TTS API returned no audio content");
  }
  return data.audioContent;
}

/** POST /api/tts — synthesize speech from text */
export async function POST(req: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid request body" },
      { status: 400 }
    );
  }

  const parsed = TtsRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: "Invalid request: text is required" },
      { status: 400 }
    );
  }

  try {
    const apiKey = await getSecret("GCP_API_KEY");
    const payload = buildTtsPayload(parsed.data);
    const audioContent = await callTtsApi(payload, apiKey);
    await writeLog({ event: "tts_synthesized", textLength: parsed.data.text.length });
    return NextResponse.json({ success: true, audioContent });
  } catch (err) {
    console.error("[/api/tts] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json(
      { success: false, error: "Failed to synthesize speech. Please try again." },
      { status: 500 }
    );
  }
}
