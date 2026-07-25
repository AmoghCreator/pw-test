/**
 * Application TypeScript interfaces and types — Haven Bridge.
 * All domain types live here. No inline `type` or `interface` in component files.
 */

// ── Input Types ────────────────────────────────────────────────────────────────

export type InputType = "voice" | "image" | "emotion" | "crisis";

export type EmotionTap = "Anxious" | "Cravings" | "Restless" | "Venting";

export type SuggestedMode = "CALM" | "CRISIS";

export type AlertLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

// ── User Profile ───────────────────────────────────────────────────────────────

export interface UserProfile {
  name: string;
  substanceType: string;
  comfortTriggers: string[];
  copingMechanisms: string[];
  safeContact: string;
}

// ── API Contract ───────────────────────────────────────────────────────────────

/** Request body for POST /api/generate */
export interface GenerateRequest {
  userId: string;
  inputType: InputType;
  emotionTap?: EmotionTap;
  audioBase64?: string;
  imageBase64?: string;
  transcriptText?: string;
  userProfile: UserProfile;
}

/** Successful response from POST /api/generate */
export interface GenerateResult {
  sessionId: string;
  data: GeminiOutput;
}

// ── Gemini Output ──────────────────────────────────────────────────────────────

export interface UserFacingOutput {
  grounding_text: string;
  emotional_state: string;
  suggested_mode: SuggestedMode;
}

export interface CaregiverFacingOutput {
  alert_level: AlertLevel;
  privacy_safe_summary: string;
  action_script: string[];
  educational_rationale: string;
}

/** The structured dual-channel output Gemini returns. */
export interface GeminiOutput {
  user_facing: UserFacingOutput;
  caregiver_facing: CaregiverFacingOutput;
}

// ── Firestore Documents ───────────────────────────────────────────────────────

export interface SessionDocument {
  userId: string;
  inputType: InputType;
  emotionTap?: EmotionTap;
  userFacing: UserFacingOutput;
  caregiverFacing: CaregiverFacingOutput;
  createdAt: Date;
}

// ── Voice Conversation ──────────────────────────────────────────────────

/** The four states of the voice conversation state machine. */
export type VoiceMode = "idle" | "listening" | "processing" | "speaking";

export interface ConversationTurn {
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

// ── UI State ──────────────────────────────────────────────────────────────────

export type AppStatus = "idle" | "loading" | "success" | "error";

export type UiMode = "CALM" | "CRISIS";

export interface UiState {
  status: AppStatus;
  mode: UiMode;
  lastSession: SessionDocument | null;
  errorMessage: string | null;
}
