import { test, expect } from "@playwright/test";

test.describe("Haven Bridge Application Flow", () => {
  test("home page loads dual-window layout without errors", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByRole("heading", { name: /Haven Bridge/i })).toBeVisible();
  });

  test("generates dual guidance results upon emotion check-in", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          success: true,
          sessionId: "e2e-session-123",
          data: {
            user_facing: {
              grounding_text: "Take a deep breath and stay present.",
              emotional_state: "High Anxiety",
              suggested_mode: "CALM",
            },
            caregiver_facing: {
              alert_level: "MODERATE",
              privacy_safe_summary: "User selected anxious emotion check-in.",
              action_script: ["Step 1: Check in via call."],
              educational_rationale: "Early check-ins prevent escalation.",
            },
          },
        }),
      })
    );

    await page.goto("/");
    await page.click('button:has-text("Anxious")');
    await page.click('button[type="submit"]');

    await expect(page.getByText("Take a deep breath and stay present.")).toBeVisible();
    await expect(page.getByText("MODERATE RISK")).toBeVisible();
  });

  test("opens crisis modal when crisis button is clicked", async ({ page }) => {
    await page.goto("/");
    await page.click('button:has-text("Overwhelmed / Crisis Mode")');
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Crisis Mode — Sanctuary Takeover")).toBeVisible();
  });

  test("displays error state when API fails", async ({ page }) => {
    await page.route("**/api/generate", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ success: false, error: "Failed to generate guidance" }),
      })
    );

    await page.goto("/");
    await page.click('button[type="submit"]');
    await expect(page.getByRole("alert")).toBeVisible();
  });
});
