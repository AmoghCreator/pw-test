import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateDualChannelGuidance, getFallbackGuidance } from "./gemini";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("server-only", () => ({}));

const mockGenerateContent = vi.fn();

vi.mock("@google/genai", () => ({
  GoogleGenAI: class {
    models = {
      generateContent: mockGenerateContent,
    };
  },
}));

vi.mock("@/lib/secrets", () => ({
  getSecret: vi.fn().mockResolvedValue("mock-api-key"),
}));

const VALID_PROFILE = {
  name: "Alex",
  substanceType: "alcohol",
  comfortTriggers: ["music"],
  copingMechanisms: ["breathing"],
  safeContact: "Mom",
};

const VALID_INPUT = {
  userId: "user-123",
  inputType: "emotion" as const,
  emotionTap: "Anxious" as const,
  userProfile: VALID_PROFILE,
};

const MOCK_GEMINI_RESPONSE = {
  user_facing: {
    grounding_text: "Take a breath.",
    emotional_state: "Anxious",
    suggested_mode: "CALM",
  },
  caregiver_facing: {
    alert_level: "LOW",
    privacy_safe_summary: "User experiencing mild anxiety.",
    action_script: ["Check in with user."],
    educational_rationale: "Early intervention helps.",
  },
};

describe("generateDualChannelGuidance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls Gemini and returns parsed guidance", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(MOCK_GEMINI_RESPONSE),
    });

    const result = await generateDualChannelGuidance(VALID_INPUT);
    expect(result).toEqual(MOCK_GEMINI_RESPONSE);
  });

  it("throws when Gemini returns empty response", async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: null });

    await expect(generateDualChannelGuidance(VALID_INPUT)).rejects.toThrow(
      "Gemini returned an empty response"
    );
  });

  it("throws when Gemini returns invalid JSON structure", async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify({ invalid: true }),
    });

    await expect(generateDualChannelGuidance(VALID_INPUT)).rejects.toThrow();
  });
});

describe("getFallbackGuidance", () => {
  it("returns full guided meditation when user requests meditation", () => {
    const input = {
      ...VALID_INPUT,
      inputType: "voice" as const,
      transcriptText: "please do a garden meditation",
    };
    const result = getFallbackGuidance(input);
    expect(result.user_facing.grounding_text).toContain("Step 1:");
    expect(result.user_facing.grounding_text).toContain("Step 6:");
  });
});

