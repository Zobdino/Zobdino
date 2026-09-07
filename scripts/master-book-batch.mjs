#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const REPO = process.env.ZOBDINO_REPO || "Zobdino/Zobdino";
const REF = process.env.ZOBDINO_BATCH_REF || "feat/268-master-book-completion-batch";
const WORKFLOW = "dual-voice-production.yml";
const TRACKING_ISSUE = process.env.ZOBDINO_TRACKING_ISSUE || "268";
const MEDIA_TAG = process.env.ZOBDINO_MEDIA_TAG || "media-dual-v0.2.0-beta.7";
const MAX_RESUMES_PER_BATCH = Number(process.env.ZOBDINO_MAX_RESUMES || 30);
const POLL_MS = Number(process.env.ZOBDINO_POLL_MS || 30000);
const RESUME_COOLDOWN_MS = Number(process.env.ZOBDINO_RESUME_COOLDOWN_MS || 75000);
const STATE_DIR = path.join(ROOT, ".master-book-batch");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const REPORT_FILE = path.join(STATE_DIR, "report.json");

const BATCHES = [
  { batch: "batch-b", books: ["think-again", "zero-to-one"] },
  { batch: "batch-c", books: ["leading-teams"] },
];
const CANONICAL_COMPLETE = new Set(["atomic-habits", "deep-work"]);

function command(cmd, args, { inherit = false, allowFailure = false } = {}) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: inherit ? "inherit" : ["ignore", "pipe", "pipe"],
  });
  if (!allowFailure && result.status !== 0) {
    throw new Error(`${cmd} ${args.join(" ")} failed (${result.status}): ${result.stderr || result.stdout}`);
  }
  return { status: result.status, stdout: result.stdout?.trim() || "", stderr: result.stderr?.trim() || "" };
}

function ghJson(args) {
  const result = command("gh", args);
  return JSON.parse(result.stdout || "null");
}

function sleep(ms) {
  const end = Date.now() + ms;
  while (Date.now() < end) {
    const remaining = end - Date.now();
    Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, Math.min(remaining, 1000));
  }
}

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; }
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + "\n");
}

function assertTool(name, args = ["--version"]) {
  const probe = command(name, args, { allowFailure: true });
  if (probe.status !== 0) throw new Error(`${name} is required but unavailable.`);
}

function currentHead() {
  return command("git", ["rev-parse", "HEAD"]).stdout;
}

function currentBranch() {
  return command("git", ["branch", "--show-current"]).stdout;
}

function remoteHead() {
  const output = command("git", ["ls-remote", "origin", `refs/heads/${REF}`]).stdout;
  return output.split(/\s+/u)[0] || "";
}

function listWorkflowRuns() {
  return ghJson([
    "run", "list", "--repo", REPO, "--workflow", WORKFLOW,
    "--branch", REF, "--event", "workflow_dispatch", "--limit", "50",
    "--json", "databaseId,createdAt,status,conclusion,headSha,url",
  ]);
}

function dispatchAndResolveRun(batch, resumeRunId, expectedSha) {
  const before = new Set(listWorkflowRuns().map((run) => Number(run.databaseId)));
  const args = [
    "workflow", "run", WORKFLOW, "--repo", REPO, "--ref", REF,
    "-f", `batch=${batch}`,
    "-f", `tracking_issue=${TRACKING_ISSUE}`,
    "-f", `media_tag=${MEDIA_TAG}`,
  ];
  if (resumeRunId) args.push("-f", `resume_run_id=${resumeRunId}`);

  console.log(`\nDispatching ${batch}${resumeRunId ? ` from checkpoint ${resumeRunId}` : ""}...`);
  command("gh", args, { inherit: true });

  for (let attempt = 0; attempt < 40; attempt += 1) {
    sleep(3000);
    const candidate = listWorkflowRuns().find((run) =>
      !before.has(Number(run.databaseId)) && run.headSha === expectedSha,
    );
    if (candidate) {
      console.log(`Run #${candidate.databaseId}: ${candidate.url}`);
      return Number(candidate.databaseId);
    }
  }
  throw new Error(`Could not resolve the newly dispatched ${batch} run.`);
}

function waitForRun(runId) {
  while (true) {
    const view = ghJson([
      "run", "view", String(runId), "--repo", REPO,
      "--json", "databaseId,status,conclusion,url,headSha",
    ]);
    const status = String(view.status || "");
    const conclusion = String(view.conclusion || "");
    process.stdout.write(`\rRun #${runId}: ${status}${conclusion ? ` / ${conclusion}` : ""}                    `);
    if (status === "completed") {
      process.stdout.write("\n");
      return view;
    }
    sleep(POLL_MS);
  }
}

function checkpointExists(runId, batch) {
  const response = ghJson([
    "api", `repos/${REPO}/actions/runs/${runId}/artifacts?per_page=100`,
  ]);
  const wanted = `dual-voice-failed-${batch}-${runId}`;
  return Array.isArray(response?.artifacts) && response.artifacts.some((artifact) =>
    artifact.name === wanted && artifact.expired === false,
  );
}

function runPreflight() {
  console.log("\n=== MASTER BATCH PREFLIGHT ===");
  command("npm", ["run", "lint"], { inherit: true });
  command("npm", ["run", "typecheck"], { inherit: true });
  command("npm", ["run", "check:text"], { inherit: true });
  command("npm", ["run", "check:episodes"], { inherit: true });
  command("npm", ["run", "factory:validate"], { inherit: true });
  for (const { batch } of BATCHES) {
    command("node", ["scripts/dual-voice-render.mjs", "--mode", "validate", "--batch", batch, "--out", `.dual-voice-${batch}-validate`], { inherit: true });
  }
}

function markBooks(state, slugs, payload) {
  for (const slug of slugs) {
    state.books[slug] = { ...(state.books[slug] || { slug }), ...payload };
  }
  writeJson(STATE_FILE, state);
}

assertTool("git");
assertTool("node");
assertTool("npm");
assertTool("gh", ["--version"]);
command("gh", ["auth", "status"], { inherit: true });

if (currentBranch() !== REF) throw new Error(`Run this command on ${REF}; current branch is ${currentBranch()}.`);
const expectedSha = currentHead();
const originSha = remoteHead();
if (!originSha || originSha !== expectedSha) {
  throw new Error(`Local HEAD ${expectedSha} is not the exact remote ${REF} head ${originSha}. Pull/push before starting.`);
}

const state = readJson(STATE_FILE, {
  version: 2,
  ref: REF,
  sourceSha: expectedSha,
  mediaTag: MEDIA_TAG,
  startedAt: new Date().toISOString(),
  books: {},
  batches: {},
});
state.sourceSha = expectedSha;
state.mediaTag = MEDIA_TAG;
for (const slug of CANONICAL_COMPLETE) {
  state.books[slug] = { slug, status: "canonical-complete", regenerated: false };
}
writeJson(STATE_FILE, state);

if (!state.preflight?.ok) {
  runPreflight();
  state.preflight = { ok: true, at: new Date().toISOString() };
  writeJson(STATE_FILE, state);
}

for (const plan of BATCHES) {
  if (state.batches[plan.batch]?.status === "success") {
    console.log(`\n${plan.batch}: already complete; skipping.`);
    continue;
  }

  let resumeRunId = state.batches[plan.batch]?.lastFailedRunId || null;
  let resumes = Number(state.batches[plan.batch]?.resumes || 0);

  while (true) {
    const runId = dispatchAndResolveRun(plan.batch, resumeRunId, expectedSha);
    state.batches[plan.batch] = {
      ...(state.batches[plan.batch] || {}),
      status: "running",
      runId,
      resumes,
      updatedAt: new Date().toISOString(),
    };
    markBooks(state, plan.books, { status: "audio-running", batch: plan.batch, runId });

    const result = waitForRun(runId);
    if (result.conclusion === "success") {
      state.batches[plan.batch] = {
        ...state.batches[plan.batch],
        status: "success",
        successfulRunId: runId,
        completedAt: new Date().toISOString(),
      };
      markBooks(state, plan.books, {
        status: "audio-release-complete",
        batch: plan.batch,
        successfulRunId: runId,
        mediaTag: MEDIA_TAG,
      });
      break;
    }

    if (!checkpointExists(runId, plan.batch)) {
      state.batches[plan.batch] = { ...state.batches[plan.batch], status: "failed-no-checkpoint", lastFailedRunId: runId };
      markBooks(state, plan.books, { status: "blocked", failedRunId: runId });
      throw new Error(`${plan.batch} failed without a verified resume checkpoint. Inspect run #${runId}.`);
    }

    resumes += 1;
    if (resumes > MAX_RESUMES_PER_BATCH) {
      throw new Error(`${plan.batch} exceeded ${MAX_RESUMES_PER_BATCH} automatic resume attempts.`);
    }

    state.batches[plan.batch] = {
      ...state.batches[plan.batch],
      status: "checkpointed-failure",
      lastFailedRunId: runId,
      resumes,
    };
    writeJson(STATE_FILE, state);
    console.log(`Checkpoint preserved for ${plan.batch}. Cooling down ${(RESUME_COOLDOWN_MS / 1000).toFixed(0)}s before automatic resume...`);
    sleep(RESUME_COOLDOWN_MS);
    resumeRunId = runId;
  }
}

console.log("\n=== FINAL LOCAL GATES ===");
command("npm", ["run", "build"], { inherit: true });

state.finishedAt = new Date().toISOString();
state.status = "media-batches-complete";
writeJson(STATE_FILE, state);
writeJson(REPORT_FILE, {
  generatedAt: new Date().toISOString(),
  sourceSha: expectedSha,
  mediaTag: MEDIA_TAG,
  status: state.status,
  books: state.books,
  batches: state.batches,
});

console.log("\nMASTER MEDIA BATCH COMPLETE");
console.log(`Media tag: ${MEDIA_TAG}`);
console.log(`Checkpoint: ${path.relative(ROOT, STATE_FILE)}`);
console.log(`Report: ${path.relative(ROOT, REPORT_FILE)}`);
console.log("Next gate: pin immutable SHA/bytes/duration metadata for the three new books, wire canonical episodes/reference pages, CI, browser QA, then explicit production approval.");
