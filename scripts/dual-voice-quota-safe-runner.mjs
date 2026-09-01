import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  classifyQuotaPause,
  createQuotaPausedManifest,
} from "./dual-voice-quota-state.mjs";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const outDir = outIndex >= 0 && args[outIndex + 1]
  ? args[outIndex + 1]
  : ".dual-voice";
const batchIndex = args.indexOf("--batch");
const batch = batchIndex >= 0 && args[batchIndex + 1]
  ? args[batchIndex + 1]
  : "unknown";

const child = spawn(
  process.execPath,
  ["scripts/dual-voice-render.mjs", ...args],
  {
    stdio: ["inherit", "pipe", "pipe"],
    env: process.env,
  },
);

let stderr = "";

child.stdout.on("data", (chunk) => {
  process.stdout.write(chunk);
});

child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  stderr += text;
  process.stderr.write(chunk);
});

const exitCode = await new Promise((resolve, reject) => {
  child.once("error", reject);
  child.once("close", (code, signal) => {
    if (signal) {
      reject(new Error(`dual-voice-render-terminated:${signal}`));
      return;
    }
    resolve(code ?? 1);
  });
});

if (exitCode === 0) {
  process.exit(0);
}

const classification = classifyQuotaPause(stderr);
if (classification.state !== "quota-paused") {
  process.exit(exitCode);
}

await mkdir(outDir, { recursive: true });
const manifest = createQuotaPausedManifest({
  batch,
  voice: null,
  outputPath: null,
  error: stderr,
  runId: process.env.GITHUB_RUN_ID ?? null,
  sourceSha: process.env.GITHUB_SHA ?? null,
  checkpointArtifactId: null,
});

const manifestPath = path.join(outDir, "quota-paused.json");
await writeFile(
  manifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

console.log(
  `Dual-voice quota pause captured safely: ${manifestPath}; ` +
  `retryAfterMs=${manifest.retryAfterMs ?? "unknown"}.`,
);

// EX_TEMPFAIL: controlled pause; workflow handles this separately from code failure.
process.exit(75);
