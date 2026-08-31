import assert from "node:assert/strict";

import {
  checkpointJob,
  createUserFileJob,
  finalizeUserFileJob,
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

let job = createUserFileJob({ ownerId: "user-test", source, jobId: "job-test" });
job = transitionJob(job, "validating");
job = transitionJob(job, "extracting");
job = checkpointJob(job, "extract-checkpoint-sha");
job = transitionJob(job, "normalizing");
job = orchestrateNormalizedUserFile(job);

for (const expectedStage of ["full-audio", "summarizing", "summary-audio"] as const) {
  assert.equal(job.stage, expectedStage);
  job = await runUserFileGeneration(job, {
    async run(unit) {
      assert.equal(unit.stage, expectedStage);
      return {
        status: "verified" as const,
        sha256: expectedStage[0]!.repeat(64),
        uri: `memory://${expectedStage}`,
        bytes: 1024,
      };
    },
  });
}
assert.equal(job.stage, "quality-check");
job = finalizeUserFileJob(job);
assert.equal(job.stage, "ready");
assert.equal(job.privacy, "private");
assert.ok(job.checkpoints.some((checkpoint) => checkpoint.digest?.startsWith("private-library-ready:v1")));
assert.deepEqual(finalizeUserFileJob(job), job);

let blocked = createUserFileJob({ ownerId: "blocked", source, mode: "summary-podcast", jobId: "job-blocked" });
blocked = transitionJob(blocked, "validating");
blocked = transitionJob(blocked, "extracting");
blocked = transitionJob(blocked, "normalizing");
blocked = orchestrateNormalizedUserFile(blocked);
blocked = await runUserFileGeneration(blocked, { async run() { return { status: "verified" as const }; } });
blocked = transitionJob(blocked, "quality-check");
assert.throws(() => finalizeUserFileJob(blocked), /summary-audio/);

let quotaJob = createUserFileJob({ ownerId: "quota-user", source, mode: "summary-podcast", jobId: "job-quota" });
quotaJob = transitionJob(quotaJob, "validating");
quotaJob = transitionJob(quotaJob, "extracting");
quotaJob = transitionJob(quotaJob, "normalizing");
quotaJob = orchestrateNormalizedUserFile(quotaJob);
quotaJob = await runUserFileGeneration(quotaJob, { async run() { return { status: "verified" as const }; } });
assert.equal(quotaJob.stage, "summary-audio");
quotaJob = await runUserFileGeneration(quotaJob, {
  async run() {
    return { status: "quota-paused" as const, provider: "test", operation: "summary-tts", retryAfterSeconds: 30 };
  },
});
assert.equal(quotaJob.stage, "quota-paused");
assert.equal(quotaJob.quotaPause?.resumeStage, "summary-audio");
quotaJob = resumeFromQuota(quotaJob);
assert.equal(quotaJob.stage, "summary-audio");
quotaJob = await runUserFileGeneration(quotaJob, { async run() { return { status: "verified" as const }; } });
assert.equal(quotaJob.stage, "quality-check");
assert.equal(finalizeUserFileJob(quotaJob).stage, "ready");

assert.throws(() => createUserFileJob({ ownerId: "user-test", source: { ...source, rightsConfirmed: false } }));

console.log("User-file autonomous pipeline contract: PASS");
