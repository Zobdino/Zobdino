import assert from "node:assert/strict";

import {
  allowedBrowserOrigin,
  newBrowserSession,
  sessionUsable,
  sha256Hex,
} from "./browser-session.ts";

import {
  createUserFileJob,
  extractInlineText,
  MemoryUserFileJobStore,
  resolveExtractionStrategy,
} from "../../../packages/ai-pipeline/src/user-files/index.ts";

const bytes =
  new TextEncoder().encode(
    "# عنوان\n\nمتن آزمایشی زبدینو\n\nبخش دوم",
  );

const source = {
  fileName: "sample.md",
  format: "markdown" as const,
  mimeType: "text/markdown",
  sizeBytes: bytes.byteLength,
  sha256: "a".repeat(64),
  rightsConfirmed: true,
};

const job =
  createUserFileJob({
    ownerId: "test-user",
    source,
    mode: "both",
    voice: "sulafat",
    jobId: "runtime-test-job",
    now: "2026-08-27T00:00:00.000Z",
  });

const store =
  new MemoryUserFileJobStore();

await store.create(job);

assert.equal(
  (await store.get(job.jobId))?.privacy,
  "private",
);

const extraction =
  extractInlineText(
    source,
    bytes,
  );

assert.equal(
  extraction.strategy,
  "inline-text",
);

assert.equal(
  extraction.sections.length,
  3,
);

assert.equal(
  resolveExtractionStrategy("pdf"),
  "existing-pdf-extractor",
);

assert.equal(
  resolveExtractionStrategy("epub"),
  "existing-epub-extractor",
);

const origin = "https://zobdino.ir";
assert.equal(allowedBrowserOrigin(origin, "https://zobdino.ir,https://www.zobdino.ir"), true);
assert.equal(allowedBrowserOrigin("https://evil.example", "https://zobdino.ir"), false);

const tokenHash = await sha256Hex("test-session-token");
const now = new Date("2026-08-30T00:00:00.000Z");
const session = newBrowserSession(origin, tokenHash, now);
assert.equal(session.tokenSha256, tokenHash);
assert.equal(sessionUsable(session, origin, now), true);
assert.equal(sessionUsable(session, "https://evil.example", now), false);
assert.equal(sessionUsable(session, origin, new Date("2026-08-30T00:16:00.000Z")), false);

console.log(
  "Secure upload runtime foundation: PASS",
);
