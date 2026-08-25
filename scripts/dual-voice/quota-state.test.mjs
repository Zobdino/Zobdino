import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  isQuotaExceededError,
  retryAfterSecondsFromError,
  writeQuotaPausedState,
} from "./quota-state.mjs";

assert.equal(
  isQuotaExceededError(new Error("TTS_FREE_TIER_REQUEST_WINDOW_EXHAUSTED: retryAfterMs=57838")),
  true,
);
assert.equal(
  isQuotaExceededError(new Error("DAILY_TTS_QUOTA_EXHAUSTED: wait for reset")),
  true,
);
assert.equal(
  isQuotaExceededError(new Error("Gemini TTS generation POST HTTP 500")),
  false,
);
assert.equal(
  retryAfterSecondsFromError(new Error("retryAfterMs=57838")),
  58,
);

const root = await mkdtemp(path.join(os.tmpdir(), "zobdino-quota-state-"));
const state = await writeQuotaPausedState({
  outputRoot: root,
  batch: "batch-a-atomic",
  book: "atomic-habits",
  voice: "Sulafat",
  segment: 2,
  retryAfterSeconds: 58,
  checkpointSha256: "a".repeat(64),
  sourceRunId: 123,
});

assert.equal(state.schemaVersion, 1);
assert.equal(state.status, "quota-paused");
assert.equal(state.segment, 2);

const persisted = JSON.parse(
  await readFile(path.join(root, "quota-paused.json"), "utf8"),
);
assert.equal(persisted.batch, "batch-a-atomic");
assert.equal(persisted.book, "atomic-habits");
assert.equal(persisted.voice, "Sulafat");
assert.equal(persisted.retryAfterSeconds, 58);
assert.equal(persisted.sourceRunId, 123);

console.log("Quota-paused state contract PASS");
