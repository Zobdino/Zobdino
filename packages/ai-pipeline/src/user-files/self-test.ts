import assert from "node:assert/strict";

import {
  checkpointJob,
  createUserFileJob,
  orchestrateNormalizedUserFile,
  resumeFromQuota,
  runUserFileGeneration,
  transitionJob,
} from "./index.ts";

const source = {
  fileName: "sample.pdf",
  format: "pdf" as const,
  mimeType: "application/pdf",
  sizeBytes: 1024,
  sha256: "a".repeat(64),
  rightsConfirmed: true,
};

let job = createUserFileJob({
  ownerId: "user-test",
  source,
  now: "2026-08-27T00:00:00.000Z",
  jobId: "job-test",
});
job = transitionJob(job, "validating");
job = transitionJob(job, "extracting");
job = checkpointJob(job, "extract-checkpoint-sha");
job = transitionJob(job, "normalizing");
job = orchestrateNormalizedUserFile(job, "2026-08-27T00:05:00.000Z");

assert.equal(job.stage, "full-audio");
assert.equal(job.assets.length, 5);

let calls = 0;
job = await runUserFileGeneration(job, {
  async run(unit) {
    calls += 1;
    assert.equal(unit.stage, "full-audio");
    return {
      status: "verified" as const,
      sha256: "f".repeat(64),
      uri: "memory://full-audio",
      bytes: 2048,
    };
  },
}, "2026-08-27T00:06:00.000Z");

assert.equal(calls, 1);
assert.equal(job.stage, "summarizing");
assert.equal(job.assets.find((asset) => asset.kind === "full-audio")?.status, "verified");
assert.ok(job.checkpoints.some((checkpoint) => checkpoint.digest?.includes("full-audio:v1:verified")));

job = await runUserFileGeneration(job, {
  async run(unit) {
    assert.equal(unit.stage, "summarizing");
    return {
      status: "verified" as const,
      sha256: "e".repeat(64),
      uri: "memory://summary",
      bytes: 512,
    };
  },
}, "2026-08-27T00:07:00.000Z");
assert.equal(job.stage, "summary-audio");
assert.equal(job.assets.find((asset) => asset.kind === "summary")?.status, "verified");

let quotaJob = createUserFileJob({
  ownerId: "quota-user",
  source,
  mode: "both",
  jobId: "job-quota",
});
quotaJob = transitionJob(quotaJob, "validating");
quotaJob = transitionJob(quotaJob, "extracting");
quotaJob = transitionJob(quotaJob, "normalizing");
quotaJob = orchestrateNormalizedUserFile(quotaJob);

let quotaCalls = 0;
quotaJob = await runUserFileGeneration(quotaJob, {
  async run() {
    quotaCalls += 1;
    return {
      status: "quota-paused" as const,
      provider: "gemini",
      operation: "tts",
      retryAfterSeconds: 60,
    };
  },
}, "2026-08-27T00:08:00.000Z");

assert.equal(quotaJob.stage, "quota-paused");
assert.equal(quotaJob.quotaPause?.resumeStage, "full-audio");
assert.equal(quotaCalls, 1);

quotaJob = resumeFromQuota(quotaJob, "2026-08-27T00:09:00.000Z");
quotaJob = await runUserFileGeneration(quotaJob, {
  async run() {
    return {
      status: "verified" as const,
      sha256: "d".repeat(64),
      uri: "memory://resumed-full-audio",
    };
  },
});
assert.equal(quotaJob.stage, "summarizing");

let idempotentCalls = 0;
const fullAudioCheckpointed = {
  ...orchestrateNormalizedUserFile(
    transitionJob(
      transitionJob(
        transitionJob(createUserFileJob({ ownerId: "idempotent", source, jobId: "job-idempotent" }), "validating"),
        "extracting",
      ),
      "normalizing",
    ),
  ),
};
const completed = await runUserFileGeneration(fullAudioCheckpointed, {
  async run() {
    idempotentCalls += 1;
    return { status: "verified" as const };
  },
});
assert.equal(idempotentCalls, 1);
assert.equal(completed.stage, "summarizing");

assert.throws(() =>
  createUserFileJob({
    ownerId: "user-test",
    source: { ...source, rightsConfirmed: false },
  }),
);

console.log("User-file autonomous pipeline contract: PASS");
