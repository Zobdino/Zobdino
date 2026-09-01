import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { VoiceProviderError } from "../voice/contracts.ts";
import {
  canonicalVoiceId,
  checkpointJob,
  createUserFileJob,
  finalizeUserFileJob,
  orchestrateNormalizedUserFile,
  planNarrationSegments,
  resumeFromQuota,
  runCanonicalAudioStage,
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

assert.equal(canonicalVoiceId("sulafat"), "sulafat");
assert.equal(canonicalVoiceId("schedar"), "iapetus");
const narrationText = `${"این یک بخش آزمایشی برای روایت فارسی است. ".repeat(10)}\n\n${"این بخش دوم برای بررسی ادامه امن پردازش است. ".repeat(10)}`;
const plannedSegments = planNarrationSegments(narrationText, 240, "test-audio");
assert.ok(plannedSegments.length >= 2);
assert.equal(plannedSegments[0]?.index, 0);
assert.equal(plannedSegments.at(-1)?.endOffset, narrationText.trimEnd().length);

function voiceResult(chapterId: string) {
  const audio = new TextEncoder().encode(`wav:${chapterId}`);
  return {
    audio,
    mimeType: "audio/wav" as const,
    durationMs: 1200,
    sha256: createHash("sha256").update(audio).digest("hex"),
    provenance: {
      provider: "offline-canonical-voice",
      model: "offline-test-model",
      providerVoice: "Iapetus",
      adapterVersion: "test-v1",
    },
    retryCount: 0,
  };
}

let audioJob = createUserFileJob({
  ownerId: "audio-user",
  source,
  mode: "full-audio",
  voice: "schedar",
  jobId: "job-audio",
});
audioJob = transitionJob(audioJob, "validating");
audioJob = transitionJob(audioJob, "extracting");
audioJob = transitionJob(audioJob, "normalizing");
audioJob = orchestrateNormalizedUserFile(audioJob);
assert.equal(audioJob.stage, "full-audio");

let providerCalls = 0;
let persistedCheckpoints = 0;
audioJob = await runCanonicalAudioStage(audioJob, {
  text: narrationText,
  maxSegmentCharacters: 240,
  provider: {
    id: "offline-canonical-voice",
    async synthesize(request) {
      providerCalls += 1;
      assert.equal(request.voiceId, "iapetus");
      if (providerCalls === 2) {
        throw new VoiceProviderError("offline-quota", { retryable: true, status: 429 });
      }
      return voiceResult(request.chapterId);
    },
  },
  store: {
    async put(input) {
      return `memory://${input.jobId}/${input.assetId}/${input.segmentId}`;
    },
  },
  onCheckpoint() {
    persistedCheckpoints += 1;
  },
});
assert.equal(audioJob.stage, "quota-paused");
assert.equal(audioJob.quotaPause?.resumeStage, "full-audio");
assert.match(audioJob.quotaPause?.operation ?? "", /^tts:full-audio:/);
const partialSegments = audioJob.assets.find((asset) => asset.kind === "full-audio")?.audioSegments ?? [];
assert.equal(partialSegments.length, 1);
assert.equal(partialSegments[0]?.provenance.providerVoice, "Iapetus");
assert.ok(persistedCheckpoints >= 2);

const firstVerifiedSegmentId = partialSegments[0]!.id;
audioJob = resumeFromQuota(audioJob);
let resumedCalls = 0;
audioJob = await runCanonicalAudioStage(audioJob, {
  text: narrationText,
  maxSegmentCharacters: 240,
  provider: {
    id: "offline-canonical-voice",
    async synthesize(request) {
      resumedCalls += 1;
      assert.notEqual(request.chapterId, firstVerifiedSegmentId);
      return voiceResult(request.chapterId);
    },
  },
  store: {
    async put(input) {
      return `memory://${input.jobId}/${input.assetId}/${input.segmentId}`;
    },
  },
});
assert.equal(audioJob.stage, "quality-check");
const completedAudio = audioJob.assets.find((asset) => asset.kind === "full-audio");
assert.equal(completedAudio?.status, "verified");
assert.equal(completedAudio?.audioSegments?.length, plannedSegments.length);
assert.equal(resumedCalls, plannedSegments.length - 1);
assert.match(completedAudio?.sha256 ?? "", /^[a-f0-9]{64}$/);
assert.ok(audioJob.checkpoints.some((checkpoint) => checkpoint.digest?.startsWith("tts-asset:")));

assert.throws(() => createUserFileJob({ ownerId: "user-test", source: { ...source, rightsConfirmed: false } }));

console.log("User-file autonomous pipeline contract: PASS");
