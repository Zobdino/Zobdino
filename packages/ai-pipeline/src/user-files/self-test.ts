import assert from "node:assert/strict";

import {
  checkpointJob,
  createUserFileJob,
  orchestrateNormalizedUserFile,
  pauseForQuota,
  resumeFromQuota,
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

assert.equal(job.privacy, "private");
assert.equal(job.mode, "both");
assert.equal(job.stage, "received");
assert.equal(job.voice, "sulafat");

job = transitionJob(job, "validating", "2026-08-27T00:01:00.000Z");
job = transitionJob(job, "extracting", "2026-08-27T00:02:00.000Z");
job = checkpointJob(job, "extract-checkpoint-sha", "2026-08-27T00:03:00.000Z");

assert.equal(job.checkpoints.length, 1);
assert.equal(job.checkpoints[0]?.stage, "extracting");

job = transitionJob(job, "normalizing", "2026-08-27T00:04:00.000Z");

const orchestrated = orchestrateNormalizedUserFile(
  job,
  "2026-08-27T00:05:00.000Z",
);

assert.equal(orchestrated.stage, "full-audio");
assert.deepEqual(
  orchestrated.assets.map((asset) => asset.kind),
  ["transcript", "chapter-map", "full-audio", "summary", "summary-audio"],
);
assert.equal(
  orchestrated.checkpoints.filter((checkpoint) => checkpoint.stage === "planning").length,
  1,
);
assert.deepEqual(
  orchestrateNormalizedUserFile(orchestrated),
  orchestrated,
);

let summaryJob = createUserFileJob({
  ownerId: "summary-user",
  source,
  mode: "summary-podcast",
  now: "2026-08-27T00:00:00.000Z",
  jobId: "job-summary",
});
summaryJob = transitionJob(summaryJob, "validating");
summaryJob = transitionJob(summaryJob, "extracting");
summaryJob = transitionJob(summaryJob, "normalizing");
summaryJob = orchestrateNormalizedUserFile(summaryJob);
assert.equal(summaryJob.stage, "summarizing");
assert.deepEqual(
  summaryJob.assets.map((asset) => asset.kind),
  ["transcript", "chapter-map", "summary", "summary-audio"],
);

job = pauseForQuota(orchestrated, {
  provider: "gemini",
  operation: "tts",
  resumeStage: "full-audio",
  retryAfterSeconds: 60,
  pausedAt: "2026-08-27T00:08:00.000Z",
});

assert.equal(job.stage, "quota-paused");
job = resumeFromQuota(job, "2026-08-27T00:09:00.000Z");
assert.equal(job.stage, "full-audio");
assert.equal(job.quotaPause, undefined);

assert.throws(() =>
  createUserFileJob({
    ownerId: "user-test",
    source: {
      ...source,
      rightsConfirmed: false,
    },
  }),
);

console.log("User-file autonomous pipeline contract: PASS");
