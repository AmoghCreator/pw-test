import "server-only";
import { GoogleGenAI, Part } from "@google/genai";
import { getSecret } from "@/lib/secrets";
import {
  GeminiResponseSchema,
  ValidatedGenerateRequest,
  ValidatedGeminiResponse,
} from "@/lib/validators";
import {
  GEMINI_MODEL,
  GEMINI_TEMPERATURE,
  GEMINI_MAX_OUTPUT_TOKENS,
  GEMINI_RESPONSE_SCHEMA,
} from "@/lib/constants";

/** Formats user profile section of prompt */
function formatProfileText(input: ValidatedGenerateRequest): string {
  const p = input.userProfile;
  return `User: ${p.name} | Substance: ${p.substanceType} | Triggers: ${p.comfortTriggers.join(
    ", "
  )} | Coping: ${p.copingMechanisms.join(", ")} | Contact: ${p.safeContact}`;
}

/** Formats system prompt with privacy instructions */
function getSystemPrompt(input: ValidatedGenerateRequest): string {
  const profileText = formatProfileText(input);
  const transcriptSection = input.transcriptText
    ? `\nUser's spoken words (transcribed): "${input.transcriptText}"\n`
    : "";
  return `You are Haven Bridge, a compassionate GenAI recovery and prevention companion.
${profileText}
Input Type: ${input.inputType} | Emotion Tap: ${input.emotionTap ?? "None"}
${transcriptSection}
INSTRUCTIONS:
1. CAREFULLY analyze the user's input — their spoken words, selected emotion, and any uploaded images.
2. Detect their ACTUAL emotional state from the content they shared. Do NOT default to crisis.
3. Only set suggested_mode to "CRISIS" if the user expresses active self-harm ideation, substance relapse, or extreme distress.
4. For normal check-ins, reflections, venting, or mild anxiety — use "CALM" mode with empathetic, personalized guidance.
5. Reference what the user actually said in your grounding_text response. Make them feel heard.
6. The grounding_text should be a warm, conversational response — NOT a generic breathing exercise.

PRIVACY MANDATE:
- Never quote raw user speech verbatim in caregiver_facing.privacy_safe_summary.
- Provide an abstracted, high-level summary suitable for caregiver guidance.

Return dual-channel structured guidance JSON based on your analysis.`;
}

/** Extracts audio part if provided */
function getAudioPart(audioBase64?: string): Part | null {
  if (!audioBase64) return null;
  return { inlineData: { mimeType: "audio/webm", data: audioBase64 } };
}

/** Extracts image part if provided */
function getImagePart(imageBase64?: string): Part | null {
  if (!imageBase64) return null;
  return { inlineData: { mimeType: "image/jpeg", data: imageBase64 } };
}

/** Assembles multimodal parts array */
function buildContentParts(input: ValidatedGenerateRequest): Part[] {
  const parts: Part[] = [{ text: getSystemPrompt(input) }];
  const audioPart = getAudioPart(input.audioBase64);
  if (audioPart) parts.push(audioPart);
  const imagePart = getImagePart(input.imageBase64);
  if (imagePart) parts.push(imagePart);
  return parts;
}

/** Dynamic fallback guidance when API key is unconfigured or rate limited */
export function getFallbackGuidance(input: ValidatedGenerateRequest): ValidatedGeminiResponse {
  const isExplicitCrisis = input.inputType === "crisis";
  const emotionLabel = input.emotionTap ?? "Reflective";
  const hasTranscript = Boolean(input.transcriptText);
  return {
    user_facing: {
      grounding_text: isExplicitCrisis
        ? "Pause and feel your feet flat on the floor. Take a 4-second slow breath in, hold, and release slowly."
        : hasTranscript
        ? `Thank you for sharing. I hear you — you mentioned feeling ${emotionLabel.toLowerCase()}. Let's work through this together. Notice 3 calming things around you right now.`
        : `You are taking a positive step by checking in. You selected '${emotionLabel}' — that takes self-awareness. Notice 3 calming things around you right now.`,
      emotional_state: emotionLabel,
      suggested_mode: isExplicitCrisis ? "CRISIS" : "CALM",
    },
    caregiver_facing: {
      alert_level: isExplicitCrisis ? "HIGH" : "LOW",
      privacy_safe_summary: `User logged a ${input.inputType} check-in with ${emotionLabel} emotional state.`,
      action_script: [
        "Send a reassuring text or initiate a brief phone check-in.",
        "Validate their proactive effort without probing for private details.",
        "Offer to join them in a comforting grounding activity like fresh air.",
      ],
      educational_rationale: "Proactive supportive responses reinforce recovery habits and de-escalate crisis moments.",
    },
  };
}

/** Calls Gemini 2.5 Flash API with JSON schema enforcement */
export async function generateDualChannelGuidance(
  input: ValidatedGenerateRequest
): Promise<ValidatedGeminiResponse> {
  const apiKey = await getSecret("GEMINI_API_KEY");
  if (!apiKey || apiKey.startsWith("your_")) {
    console.warn("[Gemini] GEMINI_API_KEY is unconfigured. Serving fallback guidance.");
    return getFallbackGuidance(input);
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: buildContentParts(input) }],
    config: {
      responseMimeType: "application/json",
      responseSchema: GEMINI_RESPONSE_SCHEMA,
      temperature: GEMINI_TEMPERATURE,
      maxOutputTokens: GEMINI_MAX_OUTPUT_TOKENS,
    },
  });

  if (!response.text) throw new Error("Gemini returned an empty response");
  const rawJson: unknown = JSON.parse(response.text);
  return GeminiResponseSchema.parse(rawJson);
}
