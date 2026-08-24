import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import {
  canReuseSegment,
  classifyQuotaError,
  loadCheckpoint,
  recordCompletedSegment,
  recordQuotaPause,
  sha256,
  verifyReusableSegment,
} from "./tts-free-tier-state.mjs";

const root = await mkdtemp(path.join(os.tmpdir(), "zobdino-tts-state-"));
const file = path.join(root, "checkpoint.json");
const audioRelative = "atomic-habits/female/segment-001.wav";
const audioFile = path.join(root, audioRelative);
await writeFile(audioFile, "verified-audio-bytes", "utf8");
const audioBytes = await readFile(audioFile);
const segment = {
  bookSlug: "atomic-habits",
  role: "female",
  voice: "Sulafat",
  text: "نمونه متن فارسی برای آزمون checkpoint",
  outputPath: audioRelative,
  outputSha256: sha256(audioBytes),
};

let state = await loadCheckpoint(file);
assert.equal(state.state, "running");
assert.equal(canReuseSegment(state, segment), false);

state = await recordCompletedSegment(file, segment);
assert.equal(canReuseSegment(state, segment), true);
assert.equal(canReuseSegment(state, { ...segment, text: `${segment.text} تغییر` }), false);

let verified = await verifyReusableSegment(state, segment, root);
assert.equal(verified.reusable, true);
assert.equal(verified.reason, "verified");
assert.equal(verified.outputSha256, segment.outputSha256);

await writeFile(audioFile, "tampered-audio-bytes", "utf8");
verified = await verifyReusableSegment(state, segment, root);
assert.equal(verified.reusable, false);
assert.equal(verified.reason, "output-digest-mismatch");

await writeFile(audioFile, "verified-audio-bytes", "utf8");
const escaped = {
  ...segment,
  outputPath: "../outside.wav",
};
let escapedState = await loadCheckpoint(path.join(root, "escaped.json"));
escapedState = await recordCompletedSegment(path.join(root, "escaped.json"), escaped);
verified = await verifyReusableSegment(escapedState, escaped, root);
assert.equal(verified.reusable, false);
assert.equal(verified.reason, "output-path-escape");

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
