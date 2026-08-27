import assert from "node:assert/strict";

import {
  checkpointJob,
  createUserFileJob,
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

job = transitionJob(
  job,
  "validating",
  "2026-08-27T00:01:00.000Z",
);

job = transitionJob(
  job,
  "extracting",
  "2026-08-27T00:02:00.000Z",
);

job = checkpointJob(
  job,
  "extract-checkpoint-sha",
  "2026-08-27T00:03:00.000Z",
);

assert.equal(job.checkpoints.length, 1);
assert.equal(
  job.checkpoints[0]?.stage,
  "extracting",
);

job = transitionJob(
  job,
  "normalizing",
  "2026-08-27T00:04:00.000Z",
);

job = transitionJob(
  job,
  "indexing",
  "2026-08-27T00:05:00.000Z",
);

job = transitionJob(
  job,
  "planning",
  "2026-08-27T00:06:00.000Z",
);

job = transitionJob(
  job,
  "full-audio",
  "2026-08-27T00:07:00.000Z",
);

job = pauseForQuota(job, {
  provider: "gemini",
  operation: "tts",
  resumeStage: "full-audio",
  retryAfterSeconds: 60,
  pausedAt: "2026-08-27T00:08:00.000Z",
});

assert.equal(job.stage, "quota-paused");

job = resumeFromQuota(
  job,
  "2026-08-27T00:09:00.000Z",
);

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

console.log(
  "User-file autonomous pipeline contract: PASS",
);
