import { describe, it, expect } from "vitest";
import { GenerateRequestSchema } from "@/lib/validators";

describe("Validators Unit Tests", () => {
  it("validates emotion input type", () => {
    const valid = {
      userId: "user-1",
      inputType: "emotion" as const,
      emotionTap: "Cravings" as const,
      userProfile: {
        name: "Test User",
        substanceType: "alcohol",
        comfortTriggers: ["music"],
        copingMechanisms: ["deep breathing"],
        safeContact: "Support Contact",
      },
    };
    expect(GenerateRequestSchema.safeParse(valid).success).toBe(true);
  });

  it("validates voice input type", () => {
    const valid = {
      userId: "user-1",
      inputType: "voice" as const,
      audioBase64: "SGVsbG8gV29ybGQ=",
      userProfile: {
        name: "Test User",
        substanceType: "alcohol",
        comfortTriggers: ["music"],
        copingMechanisms: ["deep breathing"],
        safeContact: "Support Contact",
      },
    };
    expect(GenerateRequestSchema.safeParse(valid).success).toBe(true);
  });
});
