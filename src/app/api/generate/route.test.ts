import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "./route";
import * as geminiModule from "@/lib/gemini";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("server-only", () => ({}));

vi.mock("@/lib/gemini", () => ({
  generateDualChannelGuidance: vi.fn(),
}));

vi.mock("@google-cloud/logging", () => ({
  Logging: class {
    log() {
      return {
        entry: vi.fn().mockReturnValue({}),
        write: vi.fn().mockResolvedValue(undefined),
      };
    }
  },
}));

vi.mock("@google-cloud/bigquery", () => ({
  BigQuery: class {
    dataset() {
      return {
        table: () => ({
          insert: vi.fn().mockResolvedValue(undefined),
        }),
      };
    }
  },
}));

vi.mock("@/lib/firebase-admin", () => ({
  getFirestoreAdmin: vi.fn().mockReturnValue({
    collection: vi.fn().mockReturnValue({
      add: vi.fn().mockResolvedValue({ id: "mock-session-id" }),
    }),
  }),
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_PROFILE = {
  name: "Alex",
  substanceType: "alcohol",
  comfortTriggers: ["music", "fresh air"],
  copingMechanisms: ["deep breathing"],
  safeContact: "Mom",
};

const VALID_REQUEST = {
  userId: "test-user-123",
  inputType: "emotion",
  emotionTap: "Anxious",
  userProfile: VALID_PROFILE,
};

const MOCK_GUIDANCE = {
  user_facing: {
    grounding_text: "Take a slow breath.",
    emotional_state: "High Anxiety",
    suggested_mode: "CALM" as const,
  },
  caregiver_facing: {
    alert_level: "MODERATE" as const,
    privacy_safe_summary: "User experiencing workplace stress.",
    action_script: ["Step 1: Call them."],
    educational_rationale: "Verbal grounding helps.",
  },
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("POST /api/generate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with generated result for a valid request", async () => {
    vi.mocked(geminiModule.generateDualChannelGuidance).mockResolvedValueOnce(MOCK_GUIDANCE);

    const res = await POST(makeRequest(VALID_REQUEST));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.sessionId).toBe("mock-session-id");
    expect(json.data).toEqual(MOCK_GUIDANCE);
  });

  it("returns 400 when required fields are missing", async () => {
    const res = await POST(makeRequest({ userId: "test" }));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Invalid request data");
  });

  it("returns 400 when body is completely empty", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
  });

  it("returns 500 with generic message when Gemini throws", async () => {
    vi.mocked(geminiModule.generateDualChannelGuidance).mockRejectedValueOnce(
      new Error("Gemini API error")
    );

    const res = await POST(makeRequest(VALID_REQUEST));
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).not.toContain("Gemini API error");
  });
});
