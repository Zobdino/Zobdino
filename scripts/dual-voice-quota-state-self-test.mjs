import assert from "node:assert/strict";
import {
  classifyControlledPause,
  classifyQuotaPause,
  classifyTransientProviderPause,
  createControlledPauseManifest,
  createQuotaPausedManifest,
} from "./dual-voice-quota-state.mjs";

const realFailure = new Error(
  "TTS_STREAM_PROVIDER_ERROR: code=quota_exceeded; You exceeded your current quota, please check your plan and billing details. Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 10. Please retry in 13.848760555s.",
);

const classified = classifyQuotaPause(realFailure);
assert.equal(classified.state, "quota-paused");
assert.equal(classified.reason, "explicit-quota-exhausted");
assert.equal(classified.retryAfterMs, 13_849);

const resourceExhausted = classifyQuotaPause({
  code: "RESOURCE_EXHAUSTED",
  message: "daily quota exceeded",
});
assert.equal(resourceExhausted.state, "quota-paused");

const transient429 = classifyQuotaPause(
  new Error("HTTP 429: temporarily rate limited; please retry in 12s"),
);
assert.equal(transient429.state, "not-quota-paused");

const highDemandFailure = new Error(
  "TTS_STREAM_PROVIDER_ERROR: code=api_error; gemini-3.1-flash-tts-preview is currently experiencing high demand, spikes in demand are usually temporary. Please try again later.",
);
const transientProvider = classifyTransientProviderPause(highDemandFailure);
assert.equal(transientProvider.state, "transient-provider-paused");
assert.equal(transientProvider.reason, "transient-provider-high-demand");
assert.equal(transientProvider.retryAfterMs, null);

const controlledQuota = classifyControlledPause(realFailure);
assert.equal(controlledQuota.state, "quota-paused");
assert.equal(controlledQuota.pauseKind, "quota");

const controlledProvider = classifyControlledPause(highDemandFailure);
assert.equal(controlledProvider.state, "transient-provider-paused");
assert.equal(controlledProvider.pauseKind, "transient-provider");

const provider500 = classifyControlledPause(
  new Error("HTTP 500: upstream unavailable"),
);
assert.equal(provider500.state, "not-controlled-paused");

const authFailure = classifyControlledPause(
  new Error("HTTP 401: invalid API key"),
);
assert.equal(authFailure.state, "not-controlled-paused");

const manifest = createQuotaPausedManifest({
  batch: "batch-a-atomic",
  voice: "Sulafat",
  outputPath: "atomic-habits/female/chunks/02-segments/003.wav",
  error: realFailure,
  runId: 33511885553,
  sourceSha: "7082bc1c195a0ed39fba27de3cea2182f4e327e6",
  checkpointArtifactId: 9802012875,
});

assert.deepEqual(manifest, {
  schemaVersion: 1,
  state: "quota-paused",
  batch: "batch-a-atomic",
  voice: "Sulafat",
  outputPath: "atomic-habits/female/chunks/02-segments/003.wav",
  retryAfterMs: 13_849,
  reason: "explicit-quota-exhausted",
  runId: "33511885553",
  sourceSha: "7082bc1c195a0ed39fba27de3cea2182f4e327e6",
  checkpointArtifactId: "9802012875",
});

const transientManifest = createControlledPauseManifest({
  batch: "batch-a-atomic",
  voice: "Schedar",
  outputPath: "atomic-habits/male/chunks/02-segments/009.wav",
  error: highDemandFailure,
  runId: 33846178111,
  sourceSha: "f44f52cfd90983b159b9074a0d1e50a1cc65eb18",
  checkpointArtifactId: 9926797382,
});

assert.deepEqual(transientManifest, {
  schemaVersion: 1,
  state: "quota-paused",
  pauseKind: "transient-provider",
  batch: "batch-a-atomic",
  voice: "Schedar",
  outputPath: "atomic-habits/male/chunks/02-segments/009.wav",
  retryAfterMs: null,
  reason: "transient-provider-high-demand",
  runId: "33846178111",
  sourceSha: "f44f52cfd90983b159b9074a0d1e50a1cc65eb18",
  checkpointArtifactId: "9926797382",
});

console.log(
  "Dual-voice controlled-pause self-test PASS: quota exhaustion and known Gemini high-demand errors are resumable; generic 429/500/auth failures remain fail-closed.",
);
