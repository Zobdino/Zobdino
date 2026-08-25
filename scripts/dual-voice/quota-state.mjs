import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const QUOTA_MARKERS = [
  "resource_exhausted",
  "quota_exceeded",
  "daily_tts_quota_exhausted",
  "tts_free_tier_request_window_exhausted",
  "http 429",
];

export function isQuotaExceededError(error) {
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return QUOTA_MARKERS.some((marker) => message.includes(marker));
}

export function retryAfterSecondsFromError(error) {
  const message = String(error?.message ?? error ?? "");
  const milliseconds = message.match(/retryAfterMs=([0-9]+)/iu);
  if (milliseconds) {
    return Math.max(1, Math.ceil(Number(milliseconds[1]) / 1000));
  }

  const seconds = message.match(/retry(?:\s+after|AfterSeconds=|\s+in)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)s?/iu);
  if (seconds) {
    return Math.max(1, Math.ceil(Number(seconds[1])));
  }

  return null;
}

function normalizeSegment(segment) {
  const value = Number(segment);
  return Number.isInteger(value) && value >= 0 ? value : null;
}

export async function writeQuotaPausedState({
  outputRoot,
  batch,
  book,
  voice,
  segment,
  retryAfterSeconds,
  checkpointSha256,
  sourceRunId,
}) {
  if (!outputRoot) {
    throw new Error("QUOTA_PAUSED_OUTPUT_ROOT_REQUIRED");
  }

  const state = {
    schemaVersion: 1,
    status: "quota-paused",
    reason: "gemini_free_tier_limit",
    batch: batch ?? null,
    book: book ?? null,
    voice: voice ?? null,
    segment: normalizeSegment(segment),
    retryAfterSeconds: retryAfterSeconds ?? null,
    checkpointSha256: checkpointSha256 ?? null,
    sourceRunId: sourceRunId ?? null,
    createdAt: new Date().toISOString(),
  };

  await mkdir(outputRoot, { recursive: true });
  const file = path.join(outputRoot, "quota-paused.json");
  const temp = `${file}.tmp-${process.pid}-${Date.now()}`;

  await writeFile(temp, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  await import("node:fs/promises").then(({ rename }) => rename(temp, file));

  return state;
}
