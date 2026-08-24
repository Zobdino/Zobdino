import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  canReuseSegment,
  classifyQuotaError,
  loadCheckpoint,
  recordCompletedSegment,
  recordQuotaPause,
} from "./tts-free-tier-state.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "zobdino-tts-state-"));
const file = path.join(root, "checkpoint.json");
const segment = {
  bookSlug: "atomic-habits",
  role: "female",
  voice: "Sulafat",
  text: "نمونه متن فارسی برای آزمون checkpoint",
  outputPath: "atomic-habits/female/segment-001.wav",
  outputSha256: "a".repeat(64),
};

let state = await loadCheckpoint(file);
assert.equal(state.state, "running");
assert.equal(canReuseSegment(state, segment), false);

state = await recordCompletedSegment(file, segment);
assert.equal(canReuseSegment(state, segment), true);
assert.equal(canReuseSegment(state, { ...segment, text: `${segment.text} تغییر` }), false);

const pause = classifyQuotaError(new Error("429 RESOURCE_EXHAUSTED quota_exceeded retry after 49s"));
assert.equal(pause.state, "quota-paused");
assert.equal(pause.retryAfterSeconds, 49);
state = await recordQuotaPause(file, pause);
assert.equal(state.state, "quota-paused");
assert.equal(state.pause.retryAfterSeconds, 49);

const persisted = JSON.parse(await readFile(file, "utf8"));
assert.equal(Object.keys(persisted.entries).length, 1);
assert.equal(persisted.state, "quota-paused");
console.log("Free-tier TTS checkpoint state PASS");
