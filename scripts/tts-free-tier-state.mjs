import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

const VERSION = 1;

export function sha256(value) {
  return createHash("sha256").update(String(value)).digest("hex");
}

export function classifyQuotaError(error) {
  const text = [error?.message, error?.body, error?.responseText]
    .filter(Boolean)
    .join("\n");
  const quota = /(?:429|RESOURCE_EXHAUSTED|quota[_ -]?exceeded|rate[_ -]?limit)/iu.test(text);
  if (!quota) return null;
  const retry = text.match(/retry(?:Delay| after)?[^0-9]*([0-9]+(?:\.[0-9]+)?)\s*s/iu);
  return {
    state: "quota-paused",
    retryAfterSeconds: retry ? Number(retry[1]) : null,
    observedAt: new Date().toISOString(),
  };
}

export function checkpointKey({ bookSlug, role, voice, text }) {
  return `${bookSlug}:${role}:${voice}:${sha256(text)}`;
}

export async function loadCheckpoint(file) {
  try {
    const parsed = JSON.parse(await readFile(file, "utf8"));
    if (parsed.version !== VERSION || typeof parsed.entries !== "object") {
      throw new Error("TTS_CHECKPOINT_VERSION_INVALID");
    }
    return parsed;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return { version: VERSION, state: "running", entries: {}, updatedAt: null };
  }
}

export async function saveCheckpoint(file, checkpoint) {
  await mkdir(path.dirname(file), { recursive: true });
  const next = { ...checkpoint, version: VERSION, updatedAt: new Date().toISOString() };
  const temporary = `${file}.tmp`;
  await writeFile(temporary, `${JSON.stringify(next, null, 2)}\n`, "utf8");
  await rename(temporary, file);
  return next;
}

export async function recordCompletedSegment(file, segment) {
  const checkpoint = await loadCheckpoint(file);
  const key = checkpointKey(segment);
  checkpoint.entries[key] = {
    bookSlug: segment.bookSlug,
    role: segment.role,
    voice: segment.voice,
    textHash: sha256(segment.text),
    outputPath: segment.outputPath,
    outputSha256: segment.outputSha256,
    completedAt: new Date().toISOString(),
  };
  checkpoint.state = "running";
  checkpoint.pause = null;
  return saveCheckpoint(file, checkpoint);
}

export async function recordQuotaPause(file, pause) {
  const checkpoint = await loadCheckpoint(file);
  checkpoint.state = "quota-paused";
  checkpoint.pause = pause;
  return saveCheckpoint(file, checkpoint);
}

export function canReuseSegment(checkpoint, segment) {
  const entry = checkpoint.entries?.[checkpointKey(segment)];
  return Boolean(entry && entry.textHash === sha256(segment.text) && entry.outputPath);
}
