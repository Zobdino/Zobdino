import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import {
  isQuotaExceededError,
  retryAfterSecondsFromError,
  writeQuotaPausedState,
} from "./quota-state.mjs";

function parseArgs(argv) {
  const values = {
    log: null,
    outputRoot: ".dual-voice",
    batch: null,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--log") values.log = argv[++index];
    else if (token === "--out") values.outputRoot = argv[++index];
    else if (token === "--batch") values.batch = argv[++index];
    else throw new Error(`Unknown argument: ${token}`);
  }

  if (!values.log) throw new Error("QUOTA_PAUSE_LOG_REQUIRED");
  if (!values.batch) throw new Error("QUOTA_PAUSE_BATCH_REQUIRED");
  return values;
}

function extractContext(text) {
  const lastTts = [...text.matchAll(/([a-z0-9-]+)\/(female|male)\/([A-Za-z0-9_-]+): TTS\s+(\d+)\/2/giu)].at(-1);
  const segment = [...text.matchAll(/Long-form segment\s+(\d+)\s+of\s+(\d+)/giu)].at(-1);
  return {
    book: lastTts?.[1] ?? null,
    role: lastTts?.[2] ?? null,
    voice: lastTts?.[3] ?? null,
    chunk: lastTts ? Number(lastTts[4]) - 1 : null,
    segment: segment ? Number(segment[1]) - 1 : null,
  };
}

const args = parseArgs(process.argv.slice(2));
const logPath = path.resolve(args.log);
const text = await readFile(logPath, "utf8");
const error = new Error(text);

if (!isQuotaExceededError(error)) {
  console.log("No quota exhaustion detected; no quota-paused state written.");
  process.exit(2);
}

const context = extractContext(text);
const state = await writeQuotaPausedState({
  outputRoot: path.resolve(args.outputRoot),
  batch: args.batch,
  book: context.book,
  voice: context.voice,
  segment: context.segment,
  retryAfterSeconds: retryAfterSecondsFromError(error),
  checkpointSha256: null,
  sourceRunId: Number(process.env.GITHUB_RUN_ID ?? 0) || null,
});

console.log(`Quota pause recorded: ${JSON.stringify({ ...state, role: context.role, chunk: context.chunk })}`);
