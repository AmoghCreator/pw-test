#!/usr/bin/env node
/**
 * PromptWars Score Checker
 *
 * Run before each of your 3 submissions:
 *   node scripts/score-check.mjs
 *
 * Scans your codebase and estimates your score on each of the 7 AI judge criteria.
 * Fix the RED items first — they have the most score impact.
 */

import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import { join, extname } from "path";

const ROOT = process.cwd();
const SRC = join(ROOT, "src");

// ── Utilities ─────────────────────────────────────────────────────────────────

function getAllFiles(dir, exts = [".ts", ".tsx"]) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      results.push(...getAllFiles(full, exts));
    } else if (exts.some((ext) => full.endsWith(ext))) {
      results.push(full);
    }
  }
  return results;
}

function readAll(dir) {
  return getAllFiles(dir).map((f) => ({
    path: f.replace(ROOT + "/", "").replace(ROOT + "\\", ""),
    content: readFileSync(f, "utf8"),
  }));
}

function count(str, pattern) {
  return (str.match(pattern) || []).length;
}

const files = readAll(SRC);
const allContent = files.map((f) => f.content).join("\n");

// ── Checks ────────────────────────────────────────────────────────────────────

const checks = [];

function check(criterion, label, pass, note = "") {
  checks.push({ criterion, label, pass, note });
}

// ─── CODE QUALITY ─────────────────────────────────────────────────────────────

const anyCount = count(allContent, /: any\b/g);
check("Code Quality", "Zero `any` types", anyCount === 0, `Found ${anyCount} occurrences`);

const todoCount = count(allContent, /\/\/\s*TODO|\/\/\s*FIXME|\/\*\s*TODO/gi);
check("Code Quality", "No TODOs in source", todoCount === 0, `Found ${todoCount} TODOs`);

const consoleLogCount = count(allContent, /console\.log\(/g);
check("Code Quality", "No console.log (only console.error)", consoleLogCount === 0, `Found ${consoleLogCount} console.log calls`);

const commentedCode = count(allContent, /\/\/\s+(const|let|var|function|return|import|export)\s/g);
check("Code Quality", "No commented-out code", commentedCode === 0, `Found ~${commentedCode} commented code lines`);

const hasConstants = existsSync(join(SRC, "lib/constants.ts"));
check("Code Quality", "constants.ts exists", hasConstants, "Create src/lib/constants.ts with all magic values");

const hasTypes = existsSync(join(SRC, "lib/types.ts"));
check("Code Quality", "types.ts exists", hasTypes, "Create src/lib/types.ts with all interfaces");

// ─── SECURITY ─────────────────────────────────────────────────────────────────

const hardcodedKeyPattern = /['"]AIza[A-Za-z0-9_-]{35}['"]|GEMINI_API_KEY\s*=\s*['"][A-Za-z0-9_-]{10,}/g;
const hardcodedKeys = count(allContent, hardcodedKeyPattern);
check("Security", "No hardcoded API keys in source", hardcodedKeys === 0, `CRITICAL: Found ${hardcodedKeys} potential key patterns`);

const nextPublicGemini = count(allContent, /NEXT_PUBLIC_GEMINI/g);
check("Security", "GEMINI_API_KEY not in NEXT_PUBLIC_*", nextPublicGemini === 0, `Found ${nextPublicGemini} NEXT_PUBLIC_GEMINI references`);

const hasServerOnly = count(allContent, /import ['"]server-only['"]/g);
check("Security", "server-only imported in route handlers", hasServerOnly > 0, `Add: import 'server-only' at top of route.ts files`);

const hasZod = count(allContent, /from ['"]zod['"]/g);
check("Security", "Zod validation present", hasZod > 0, "Add Zod schema validation on all API inputs");

const hasCspHeaders = existsSync(join(ROOT, "next.config.ts"))
  ? readFileSync(join(ROOT, "next.config.ts"), "utf8").includes("X-Content-Type-Options")
  : false;
check("Security", "Security headers in next.config.ts", hasCspHeaders, "Add X-Content-Type-Options, X-Frame-Options, X-XSS-Protection");

// ─── EFFICIENCY ───────────────────────────────────────────────────────────────

const hasFirestoreCache = count(allContent, /\.collection\(|\.add\(|\.set\(/g);
check("Efficiency", "Firestore writes present (caching)", hasFirestoreCache > 0, "Write Gemini results to Firestore — never re-call for same input");

const multipleGeminiCalls = count(allContent, /generateContent\(/g);
check("Efficiency", "Single Gemini call per flow", multipleGeminiCalls <= 2, `Found ${multipleGeminiCalls} generateContent calls — aim for 1`);

// ─── TESTING ──────────────────────────────────────────────────────────────────

const testFiles = getAllFiles(SRC, [".test.ts", ".test.tsx"]);
check("Testing", "Unit test files present", testFiles.length >= 2, `Found ${testFiles.length} test files — need ≥2`);

const e2eFiles = getAllFiles(join(ROOT, "tests"), [".spec.ts"]);
check("Testing", "Playwright E2E tests present", e2eFiles.length >= 1, `Found ${e2eFiles.length} E2E spec files`);

const hasAxeTest = e2eFiles.some((f) => readFileSync(f, "utf8").includes("AxeBuilder"));
check("Testing", "axe-core accessibility test exists", hasAxeTest, "Add tests/a11y.spec.ts with AxeBuilder — it's already scaffolded");

const hasMockedGemini = count(allContent, /vi\.mock.*genai|vi\.mock.*gemini/gi);
check("Testing", "Gemini is mocked in tests", hasMockedGemini > 0, "Add vi.mock('@google/genai', ...) — never call real Gemini in tests");

// ─── ACCESSIBILITY ────────────────────────────────────────────────────────────

const htmlForCount = count(allContent, /htmlFor=/g);
const inputCount = count(allContent, /<input|<select|<textarea/g);
check("Accessibility", "All inputs have htmlFor labels", htmlForCount >= inputCount, `Found ${htmlForCount} htmlFor vs ${inputCount} inputs`);

const roleAlertCount = count(allContent, /role=["']alert["']/g);
check("Accessibility", "Error states use role=alert", roleAlertCount > 0, "Add role=\"alert\" to error message elements");

const ariaLiveCount = count(allContent, /aria-live=["']polite["']/g);
check("Accessibility", "Loading/success states use aria-live", ariaLiveCount > 0, "Add aria-live=\"polite\" to loading/success states");

const skipLink = count(allContent, /skip.*main|main.*content/gi);
check("Accessibility", "Skip-to-content link present", skipLink > 0, "Add skip-to-content link in layout.tsx — already scaffolded");

const semanticMain = count(allContent, /<main/g);
check("Accessibility", "<main> element present", semanticMain > 0, "Wrap page content in <main id=\"main-content\">");

const ariaHiddenIcons = count(allContent, /aria-hidden=["']true["']/g);
check("Accessibility", "Decorative icons aria-hidden", ariaHiddenIcons > 0, "Add aria-hidden=\"true\" to decorative icons/SVGs");

// ─── GOOGLE SERVICES ──────────────────────────────────────────────────────────

const googleServices = [
  { name: "Gemini (@google/genai)", pattern: /@google\/genai/ },
  { name: "Secret Manager", pattern: /@google-cloud\/secret-manager/ },
  { name: "Cloud Logging", pattern: /@google-cloud\/logging/ },
  { name: "BigQuery", pattern: /@google-cloud\/bigquery/ },
  { name: "Firebase Auth", pattern: /getAuth|firebase\/auth/ },
  { name: "Firestore", pattern: /getFirestore|firebase\/firestore/ },
  { name: "Firebase Analytics", pattern: /getAnalytics|logEvent/ },
  { name: "Vertex AI", pattern: /@google-cloud\/vertexai/ },
  { name: "Maps API", pattern: /js-api-loader|google\.maps/ },
  { name: "Firebase Admin", pattern: /firebase-admin/ },
];

const detectedServices = googleServices.filter(({ pattern }) => pattern.test(allContent));
check(
  "Google Services",
  `${detectedServices.length}/10 Google services detected`,
  detectedServices.length >= 8,
  `Detected: ${detectedServices.map((s) => s.name).join(", ")}`
);

// ─── PROBLEM ALIGNMENT ────────────────────────────────────────────────────────

const hasRequirements = existsSync(join(ROOT, "REQUIREMENTS.md"));
check("Alignment", "REQUIREMENTS.md exists", hasRequirements, "Create REQUIREMENTS.md with full feature checklist");

const hasReadmeSection = existsSync(join(ROOT, "README.md"))
  ? readFileSync(join(ROOT, "README.md"), "utf8").includes("Evaluation Focus Areas Met")
  : false;
check("Alignment", "README has 'Evaluation Focus Areas Met' section", hasReadmeSection, "Add this section before submitting — spoon-feeds the AI judge");

// ── Output ─────────────────────────────────────────────────────────────────────

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const GREEN = "\x1b[32m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";

console.log("\n" + BOLD + "═══════════════════════════════════════════════════" + RESET);
console.log(BOLD + "  PromptWars Score Check" + RESET);
console.log("═══════════════════════════════════════════════════\n");

const byCriterion = {};
for (const c of checks) {
  if (!byCriterion[c.criterion]) byCriterion[c.criterion] = [];
  byCriterion[c.criterion].push(c);
}

let totalPass = 0;
let totalFail = 0;

for (const [criterion, items] of Object.entries(byCriterion)) {
  const pass = items.filter((i) => i.pass).length;
  const total = items.length;
  const allPass = pass === total;
  const icon = allPass ? GREEN + "✓" + RESET : YELLOW + "△" + RESET;

  console.log(`${icon} ${BOLD}${criterion}${RESET} (${pass}/${total})`);

  for (const item of items) {
    if (item.pass) {
      console.log(`  ${GREEN}✓${RESET} ${item.label}`);
      totalPass++;
    } else {
      console.log(`  ${RED}✗${RESET} ${item.label}`);
      if (item.note) console.log(`    ${YELLOW}→ ${item.note}${RESET}`);
      totalFail++;
    }
  }

  console.log();
}

const total = totalPass + totalFail;
const pct = Math.round((totalPass / total) * 100);
const color = pct >= 90 ? GREEN : pct >= 70 ? YELLOW : RED;

console.log("═══════════════════════════════════════════════════");
console.log(`  Result: ${color}${BOLD}${totalPass}/${total} checks passing (${pct}%)${RESET}`);

if (totalFail === 0) {
  console.log(`  ${GREEN}${BOLD}✓ Ready to submit!${RESET}`);
} else {
  console.log(`  ${RED}Fix the ${totalFail} failing checks above before submitting.${RESET}`);
}
console.log("═══════════════════════════════════════════════════\n");
