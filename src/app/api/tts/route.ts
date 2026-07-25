import "server-only";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSecret } from "@/lib/secrets";
import { writeLog } from "@/lib/logger";
import { TTS_VOICE_NAME, TTS_AUDIO_ENCODING, TTS_SPEAKING_RATE, TTS_PITCH } from "@/lib/constants";

const TTS_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
const TtsRequestSchema = z.object({ text: z.string().min(1).max(5000), voiceName: z.string().optional() });
type TtsRequest = z.infer<typeof TtsRequestSchema>;

function buildTtsPayload(body: TtsRequest): Record<string, unknown> {
  return {
    input: { text: body.text },
    voice: { languageCode: "en-US", name: body.voiceName ?? TTS_VOICE_NAME },
    audioConfig: { audioEncoding: TTS_AUDIO_ENCODING, speakingRate: TTS_SPEAKING_RATE, pitch: TTS_PITCH },
  };
}

async function callTtsApi(payload: Record<string, unknown>, apiKey: string): Promise<string> {
  const response = await fetch(`${TTS_API_URL}?key=${apiKey}`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`TTS API error ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as { audioContent?: string };
  if (!data.audioContent) throw new Error("TTS API returned no audio content");
  return data.audioContent;
}

async function parseTtsBody(req: Request): Promise<TtsRequest | null> {
  try {
    const body = await req.json();
    const parsed = TtsRequestSchema.safeParse(body);
    return parsed.success ? parsed.data : null;
  } catch { return null; }
}

async function executeTtsSynthesis(data: TtsRequest): Promise<NextResponse> {
  try {
    const apiKey = await getSecret("GCP_API_KEY");
    const audioContent = await callTtsApi(buildTtsPayload(data), apiKey);
    await writeLog({ event: "tts_synthesized", textLength: data.text.length });
    return NextResponse.json({ success: true, audioContent });
  } catch (err) {
    console.error("[/api/tts] Error:", err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: "Failed to synthesize speech." }, { status: 500 });
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  const data = await parseTtsBody(req);
  if (!data) return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  return executeTtsSynthesis(data);
}
