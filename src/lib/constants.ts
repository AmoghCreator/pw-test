/**
 * Application-wide constants — Haven Bridge.
 * ALL magic values live here. No inline strings or numbers in business logic.
 */

// ── Gemini ────────────────────────────────────────────────────────────────────
export const GEMINI_MODEL = "gemini-flash-latest" as const;
export const GEMINI_TEMPERATURE = 0.2;
export const GEMINI_MAX_OUTPUT_TOKENS = 8192;

export const GEMINI_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    user_facing: {
      type: "OBJECT",
      properties: {
        grounding_text: { type: "STRING" },
        emotional_state: { type: "STRING" },
        suggested_mode: { type: "STRING", enum: ["CALM", "CRISIS"] },
      },
      required: ["grounding_text", "emotional_state", "suggested_mode"],
    },
    caregiver_facing: {
      type: "OBJECT",
      properties: {
        alert_level: { type: "STRING", enum: ["LOW", "MODERATE", "HIGH", "CRITICAL"] },
        privacy_safe_summary: { type: "STRING" },
        action_script: { type: "ARRAY", items: { type: "STRING" } },
        educational_rationale: { type: "STRING" },
      },
      required: [
        "alert_level",
        "privacy_safe_summary",
        "action_script",
        "educational_rationale",
      ],
    },
  },
  required: ["user_facing", "caregiver_facing"],
} as const;

// ── Voice Recording ───────────────────────────────────────────────────────────
export const VOICE_MAX_DURATION_MS = 10_000;
export const VOICE_SAMPLE_RATE = 16_000;
export const SPEECH_RECOGNITION_LANG = "en-US";
export const VOICE_CONVERSATION_IDLE_MS = 8_000;

// ── Google Cloud Text-to-Speech ───────────────────────────────────────────────
export const TTS_VOICE_NAME = "en-US-Journey-F" as const;
export const TTS_AUDIO_ENCODING = "MP3" as const;
export const TTS_SPEAKING_RATE = 0.95;
export const TTS_PITCH = -1.0; // Slightly warmer, lower tone

// ── Input Limits ──────────────────────────────────────────────────────────────
export const MAX_USER_ID_LENGTH = 128;
export const MAX_BASE64_LENGTH = 5_000_000; // ~3.75 MB decoded
export const MAX_PROFILE_FIELD_LENGTH = 200;
export const MAX_PROFILE_ARRAY_LENGTH = 10;

// ── Emotion Orbs ──────────────────────────────────────────────────────────────
export const EMOTION_TAPS = ["Anxious", "Cravings", "Restless", "Venting"] as const;

// ── Alert Levels ──────────────────────────────────────────────────────────────
export const ALERT_LEVELS = ["LOW", "MODERATE", "HIGH", "CRITICAL"] as const;

// ── Firestore ─────────────────────────────────────────────────────────────────
export const FIRESTORE_SESSIONS_COLLECTION = "sessions";
export const CAREGIVER_FEED_LIMIT = 20;

// ── Google Cloud ──────────────────────────────────────────────────────────────
export const LOG_NAME = "haven-bridge-events";
export const BQ_DATASET = "haven_analytics";
export const BQ_TABLE = "session_events";

// ── UI Timing ─────────────────────────────────────────────────────────────────
export const DEBOUNCE_MS = 300;
export const TOAST_DURATION_MS = 4000;
export const BREATHING_CYCLE_MS = 8000; // 4s inhale + 4s exhale

// ── Default User Profile ──────────────────────────────────────────────────────
export const DEFAULT_USER_PROFILE = {
  name: "User",
  substanceType: "alcohol",
  comfortTriggers: ["music", "fresh air", "calling a friend"],
  copingMechanisms: ["deep breathing", "grounding exercises"],
  safeContact: "Support contact",
} as const;

// ── Routes ────────────────────────────────────────────────────────────────────
export const USER_ROUTE = "/user" as const;
export const CAREGIVER_ROUTE = "/caregiver" as const;
export const API_GENERATE_ROUTE = "/api/generate" as const;
export const API_TTS_ROUTE = "/api/tts" as const;
