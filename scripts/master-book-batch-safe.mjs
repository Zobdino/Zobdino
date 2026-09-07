#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPO = process.env.ZOBDINO_REPO || "Zobdino/Zobdino";
const STATE_DIR = path.join(ROOT, ".master-book-batch");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const REPORT_FILE = path.join(STATE_DIR, "report.json");
const CORE = path.join(ROOT, "scripts", "master-book-batch.mjs");

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function run(cmd, args, options = {}) {
  return spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
    ...options,
  });
}

function latestFailedRunId(state) {
  const batches = Object.values(state?.batches || {});
  return Math.max(0, ...batches.map((entry) => Number(entry?.lastFailedRunId || entry?.runId || 0)));
}

function resetResumeCounters() {
  const state = readJson(STATE_FILE, null);
  if (!state?.batches) return;
  for (const entry of Object.values(state.batches)) {
    if (entry && entry.status !== "success") entry.resumes = 0;
  }
  writeJson(STATE_FILE, state);
}

function failedRunLog(runId) {
  if (!runId) return "";
  const result = run("gh", ["run", "view", String(runId), "--repo", REPO, "--log-failed"], {
    stdio: ["ignore", "pipe", "pipe"],
  });
  return `${result.stdout || ""}\n${result.stderr || ""}`;
}

function isQuotaFailure(logText) {
  const text = String(logText || "").toLowerCase();
  return (
    text.includes("quota_exceeded") ||
    text.includes("generate_content_free_tier_requests") ||
    (text.includes("exceeded your current quota") && text.includes("gemini"))
  );
}

function persistQuotaPause(runId, logText) {
  const state = readJson(STATE_FILE, { version: 4, books: {}, batches: {} });
  let batchName = null;
  for (const [name, entry] of Object.entries(state.batches || {})) {
    if (Number(entry?.lastFailedRunId || entry?.runId || 0) === Number(runId)) {
      batchName = name;
      entry.status = "quota-paused";
      entry.quotaPausedAt = new Date().toISOString();
      entry.lastFailedRunId = Number(runId);
      entry.resumes = 0;
      entry.quotaReason = logText.includes("generate_content_free_tier_requests")
        ? "generate_content_free_tier_requests"
        : "quota_exceeded";
    }
  }
  state.status = "quota-paused";
  state.quotaPausedAt = new Date().toISOString();
  state.quotaRunId = Number(runId);
  writeJson(STATE_FILE, state);
  writeJson(REPORT_FILE, {
    generatedAt: new Date().toISOString(),
    status: "quota-paused",
    batch: batchName,
    runId: Number(runId),
    sourceSha: state.sourceSha || null,
    mediaTag: state.mediaTag || null,
    books: state.books || {},
    batches: state.batches || {},
  });
  return batchName;
}

resetResumeCounters();

const child = run(process.execPath, [CORE], {
  stdio: "inherit",
  env: {
    ...process.env,
    // Exactly one live dispatch per operator invocation. The core runner still verifies
    // and uploads a checkpoint; this guard decides whether the failure is quota-only.
    ZOBDINO_MAX_RESUMES: "0",
  },
});

if (child.status === 0) process.exit(0);

const state = readJson(STATE_FILE, {});
const runId = latestFailedRunId(state);
const logText = failedRunLog(runId);

if (runId && isQuotaFailure(logText)) {
  const batch = persistQuotaPause(runId, logText);
  console.log("\n=== MASTER BATCH QUOTA PAUSE ===");
  console.log(`Checkpoint preserved: run #${runId}${batch ? ` (${batch})` : ""}`);
  console.log("Gemini free-tier quota is currently exhausted. No additional workflow was dispatched.");
  console.log("Run the same command later; it will recover this exact checkpoint and continue without regenerating completed segments.");
  process.exit(0);
}

console.error("\nMaster batch failed for a non-quota reason. Inspect the latest workflow run before retrying.");
process.exit(child.status || 1);
