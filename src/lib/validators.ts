import { z } from "zod";
import {
  MAX_USER_ID_LENGTH,
  MAX_BASE64_LENGTH,
  MAX_PROFILE_FIELD_LENGTH,
  MAX_PROFILE_ARRAY_LENGTH,
  EMOTION_TAPS,
} from "@/lib/constants";

// ── Sub-Schemas ───────────────────────────────────────────────────────────────

export const UserProfileSchema = z.object({
  name: z.string().min(1).max(MAX_PROFILE_FIELD_LENGTH),
  substanceType: z.string().min(1).max(MAX_PROFILE_FIELD_LENGTH),
  comfortTriggers: z
    .array(z.string().max(MAX_PROFILE_FIELD_LENGTH))
    .max(MAX_PROFILE_ARRAY_LENGTH),
  copingMechanisms: z
    .array(z.string().max(MAX_PROFILE_FIELD_LENGTH))
    .max(MAX_PROFILE_ARRAY_LENGTH),
  safeContact: z.string().max(MAX_PROFILE_FIELD_LENGTH),
});

// ── Request Validators ────────────────────────────────────────────────────────

/** Validates the POST /api/generate request body. */
export const GenerateRequestSchema = z.object({
  userId: z.string().min(1).max(MAX_USER_ID_LENGTH),
  inputType: z.enum(["voice", "image", "emotion", "crisis"]),
  emotionTap: z.enum(EMOTION_TAPS).optional(),
  audioBase64: z.string().max(MAX_BASE64_LENGTH).optional(),
  imageBase64: z.string().max(MAX_BASE64_LENGTH).optional(),
  transcriptText: z.string().max(MAX_BASE64_LENGTH).optional(),
  userProfile: UserProfileSchema,
});

export type ValidatedGenerateRequest = z.infer<typeof GenerateRequestSchema>;

// ── Gemini Response Validators ────────────────────────────────────────────────

const UserFacingSchema = z.object({
  grounding_text: z.string().min(1),
  emotional_state: z.string().min(1),
  suggested_mode: z.enum(["CALM", "CRISIS"]),
});

const CaregiverFacingSchema = z.object({
  alert_level: z.enum(["LOW", "MODERATE", "HIGH", "CRITICAL"]),
  privacy_safe_summary: z.string().min(1),
  action_script: z.array(z.string().min(1)).min(1).max(5),
  educational_rationale: z.string().min(1),
});

/** Validates Gemini's structured dual-channel JSON response. */
export const GeminiResponseSchema = z
  .object({
    user_facing: UserFacingSchema,
    caregiver_facing: CaregiverFacingSchema,
  })
  .strict();

export type ValidatedGeminiResponse = z.infer<typeof GeminiResponseSchema>;
