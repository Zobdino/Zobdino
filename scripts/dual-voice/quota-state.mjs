import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export function isQuotaExceededError(error) {
  const message = String(error?.message ?? error ?? "").toLowerCase();
  return (
    message.includes("resource_exhausted") ||
    message.includes("quota_exceeded") ||
    message.includes("429")
  );
}

export async function writeQuotaPausedState({
  outputRoot,
  batch,
  book,
  voice,
  segment,
  retryAfterSeconds,
  checkpointSha256,
}) {
  const state = {
    status: "quota-paused",
    reason: "gemini_free_tier_limit",
    batch,
    book,
    voice,
    segment,
    retryAfterSeconds: retryAfterSeconds ?? null,
    checkpointSha256: checkpointSha256 ?? null,
    createdAt: new Date().toISOString(),
  };

  const directory = path.join(outputRoot, ".dual-voice");
  await mkdir(directory, { recursive: true });
  await writeFile(
    path.join(directory, "quota-paused.json"),
    JSON.stringify(state, null, 2),
    "utf8",
  );

  return state;
}
