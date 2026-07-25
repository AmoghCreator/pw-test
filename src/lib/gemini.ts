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
  return `User: ${p.name} | Substance: ${p.substanceType} | Triggers: ${p.comfortTriggers.join(", ")} | Coping: ${p.copingMechanisms.join(", ")} | Contact: ${p.safeContact}`;
}

/** Privacy mandate instructions */
const PRIVACY_MANDATE = `
PRIVACY MANDATE:
- Never quote raw user speech verbatim in caregiver_facing.privacy_safe_summary.
- Provide an abstracted, high-level summary suitable for caregiver guidance.
Return dual-channel structured guidance JSON based on your analysis.`;

/** Formats system prompt with privacy instructions */
function getSystemPrompt(input: ValidatedGenerateRequest): string {
  const profileText = formatProfileText(input);
  const transcriptSection = input.transcriptText ? `\nUser's spoken words (transcribed): "${input.transcriptText}"\n` : "";
  return `You are Haven Bridge, a compassionate GenAI recovery and prevention companion.
${profileText}
Input Type: ${input.inputType} | Emotion Tap: ${input.emotionTap ?? "None"}
${transcriptSection}
INSTRUCTIONS:
1. CAREFULLY analyze the user's input.
2. Detect their ACTUAL emotional state from the content.
3. Set suggested_mode to "CRISIS" only if extreme distress/relapse ideation exists.
4. For normal check-ins, use "CALM" mode with empathetic guidance.
5. Reference what the user said in grounding_text. Make them feel heard.
6. GUIDED EXERCISE MANDATE: If the user requests a meditation, breathing exercise, grounding technique, or visualization (e.g. garden meditation, body scan, 5-4-3-2-1), you MUST provide a COMPLETE, fully guided, multi-step walkthrough in grounding_text from beginning to end. Do NOT stop after just an introductory sentence or single breath. Provide at least 5 to 7 detailed, calming steps (settling in, rhythmic breathing, rich sensory immersion, deepening relaxation, walking through the full visualization, and gentle closing/re-centering) so the user experiences a thorough, satisfying session.
${PRIVACY_MANDATE}`;
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

/** Detects if user requested a guided exercise in their transcript */
function isExerciseRequest(text?: string): boolean {
  if (!text) return false;
  const lower = text.toLowerCase();
  return lower.includes("meditat") || lower.includes("breath") || lower.includes("grounding") || lower.includes("garden");
}

/** Generates a complete 6-step guided meditation for fallback requests */
function getGuidedMeditationFallback(): string {
  return "I hear that you're reaching out for a meditation to center yourself. Let's take a deep breath together and begin a complete guided journey.\n\nStep 1: Find a comfortable, quiet seated position. Gently close your eyes and let your shoulders relax away from your ears.\n\nStep 2: Take a slow, deep breath in through your nose for 4 seconds... filling your lungs completely... hold for 2 seconds... and exhale gently through your mouth for 6 seconds.\n\nStep 3: Picture a quiet, peaceful garden filled with fresh morning air and vibrant greenery. Imagine stepping barefoot onto a soft, cool mossy path.\n\nStep 4: As you walk along the calm garden path, notice the gentle warmth of sunlight filtering through the canopy above, touching your skin with comforting warmth.\n\nStep 5: Listen to the soothing sound of a distant trickling stream and the gentle rustle of leaves in a light breeze. With every breath you take, feel yourself becoming more centered, safe, and deeply relaxed.\n\nStep 6: When you are ready, take one final deep, refreshing breath in this tranquil sanctuary. Slowly wiggle your fingers and toes, open your eyes, and carry this peaceful calm back into your day.";
}

/** Resolves fallback grounding text based on user request */
function resolveFallbackGroundingText(input: ValidatedGenerateRequest, isCrisis: boolean, emotionLabel: string): string {
  if (isCrisis) return "Pause and feel your feet flat on the floor. Take a 4-second slow breath in, hold, and release slowly.";
  if (isExerciseRequest(input.transcriptText)) return getGuidedMeditationFallback();
  if (input.transcriptText) return `Thank you for sharing. I hear you — you mentioned feeling ${emotionLabel.toLowerCase()}. Let's work through this together. Notice 3 calming things around you right now.`;
  return `You are taking a positive step by checking in. You selected '${emotionLabel}' — that takes self-awareness. Notice 3 calming things around you right now.`;
}

/** Fallback user guidance generator */
function getFallbackUserFacing(input: ValidatedGenerateRequest, isCrisis: boolean, emotionLabel: string) {
  return {
    grounding_text: resolveFallbackGroundingText(input, isCrisis, emotionLabel),
    emotional_state: emotionLabel,
    suggested_mode: (isCrisis ? "CRISIS" : "CALM") as "CRISIS" | "CALM",
  };
}

/** Dynamic fallback guidance when API key is unconfigured or rate limited */
export function getFallbackGuidance(input: ValidatedGenerateRequest): ValidatedGeminiResponse {
  const isCrisis = input.inputType === "crisis";
  const emotionLabel = input.emotionTap ?? "Reflective";
  return {
    user_facing: getFallbackUserFacing(input, isCrisis, emotionLabel),
    caregiver_facing: {
      alert_level: isCrisis ? "HIGH" : "LOW",
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
export async function generateDualChannelGuidance(input: ValidatedGenerateRequest): Promise<ValidatedGeminiResponse> {
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
  return GeminiResponseSchema.parse(JSON.parse(response.text));
}
