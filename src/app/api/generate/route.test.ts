import { describe, it, expect, vi } from "vitest";
import { GenerateRequestSchema } from "@/lib/validators";

vi.mock("@google/genai", () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn().mockResolvedValue({
        text: JSON.stringify({
          user_facing: {
            grounding_text: "Deep breath in, hold for 4 seconds.",
            emotional_state: "Anxious",
            suggested_mode: "CALM",
          },
          caregiver_facing: {
            alert_level: "LOW",
            privacy_safe_summary: "User reported feeling anxious.",
            action_script: ["Offer a glass of water", "Encourage breathing"],
            educational_rationale: "Early intervention reduces escalation.",
          },
        }),
      }),
    },
  })),
}));

describe("Generate Route Validation & Logic", () => {
  it("validates valid generate request schema", () => {
    const payload = {
      userId: "test-user-123",
      inputType: "emotion" as const,
      emotionTap: "Anxious" as const,
      userProfile: {
        name: "Test User",
        substanceType: "alcohol",
        comfortTriggers: ["music"],
        copingMechanisms: ["deep breathing"],
        safeContact: "Support Contact",
      },
    };
    const result = GenerateRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects request without required userId", () => {
    const payload = {
      inputType: "emotion",
    };
    const result = GenerateRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
