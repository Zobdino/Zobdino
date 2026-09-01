import assert from "node:assert/strict";
import {
  classifyQuotaPause,
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

const provider500 = classifyQuotaPause(
  new Error("HTTP 500: upstream unavailable"),
);
assert.equal(provider500.state, "not-quota-paused");

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

console.log(
  "Dual-voice quota-paused self-test PASS: explicit free-tier quota pauses deterministically; generic transient 429 remains retryable.",
);
