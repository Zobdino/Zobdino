#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPO = process.env.ZOBDINO_REPO || "Zobdino/Zobdino";
const REF = process.env.ZOBDINO_BATCH_REF || "feat/268-master-book-completion-batch";
const WORKFLOW = "dual-voice-production.yml";
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
    shell: false,
    windowsHide: true,
    ...options,
  });
}

function ghJson(args) {
  const result = run("gh", args, { stdio: ["ignore", "pipe", "pipe"] });
  if (result.status !== 0) {
    throw new Error(`gh ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout || "unknown error"}`);
  }
  return JSON.parse(result.stdout || "null");
}

function listRecentWorkflowRuns() {
  return ghJson([
    "run", "list", "--repo", REPO, "--workflow", WORKFLOW,
    "--branch", REF, "--event", "workflow_dispatch", "--limit", "50",
    "--json", "databaseId,status,conclusion,headSha,createdAt,url",
  ]);
}

function checkpointExists(runId, batch) {
  const response = ghJson(["api", `repos/${REPO}/actions/runs/${runId}/artifacts?per_page=100`]);
  const wanted = `dual-voice-failed-${batch}-${runId}`;
  return Array.isArray(response?.artifacts) && response.artifacts.some((artifact) =>
    artifact.name === wanted && artifact.expired === false,
  );
}

function newestVerifiedCheckpoint(state) {
  const stateCandidates = Object.entries(state?.batches || {})
    .map(([batch, entry]) => ({
      batch,
      runId: Number(entry?.lastFailedRunId || entry?.runId || 0),
    }))
    .filter((item) => item.runId > 0);

  const batchNames = new Set(stateCandidates.map((item) => item.batch));
  if (!batchNames.size) {
    batchNames.add("batch-b");
    batchNames.add("batch-c");
  }

  try {
    const runs = listRecentWorkflowRuns()
      .filter((run) => run.status === "completed" && run.conclusion === "failure")
      .sort((a, b) => Number(b.databaseId) - Number(a.databaseId));

    for (const run of runs) {
      const runId = Number(run.databaseId);
      for (const batch of batchNames) {
        try {
          if (checkpointExists(runId, batch)) return { batch, runId };
        } catch {}
      }
    }
  } catch (error) {
    console.warn(`Could not query GitHub for newest checkpoint: ${error.message}`);
  }

  const fallback = stateCandidates.sort((a, b) => b.runId - a.runId)[0];
  return fallback || { batch: null, runId: 0 };
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

function persistQuotaPause(runId, batchName, logText) {
  const state = readJson(STATE_FILE, { version: 4, books: {}, batches: {} });
  if (batchName) {
    const entry = state.batches[batchName] || {};
    state.batches[batchName] = {
      ...entry,
      status: "quota-paused",
      quotaPausedAt: new Date().toISOString(),
      lastFailedRunId: Number(runId),
      resumes: 0,
      quotaReason: logText.includes("generate_content_free_tier_requests")
        ? "generate_content_free_tier_requests"
        : "quota_exceeded",
    };
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
const checkpoint = newestVerifiedCheckpoint(state);
const logText = failedRunLog(checkpoint.runId);

if (checkpoint.runId && isQuotaFailure(logText)) {
  persistQuotaPause(checkpoint.runId, checkpoint.batch, logText);
  console.log("\n=== MASTER BATCH QUOTA PAUSE ===");
  console.log(`Checkpoint preserved: run #${checkpoint.runId}${checkpoint.batch ? ` (${checkpoint.batch})` : ""}`);
  console.log("Gemini free-tier quota is currently exhausted. No additional workflow was dispatched.");
  console.log("Run the same command later; it will recover this exact checkpoint and continue without regenerating completed segments.");
  process.exit(0);
}

console.error("\nMaster batch failed for a non-quota reason. Inspect the latest workflow run before retrying.");
process.exit(child.status || 1);
