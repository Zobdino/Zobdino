import assert from "node:assert/strict";

import {
  allowedBrowserOrigin,
  newBrowserSession,
  sessionUsable,
  sha256Hex,
} from "./browser-session.ts";
import { offlinePersianSummaryProvider } from "./summary-provider.ts";
import {
  runVerifiedSummaryAudioStage,
  runVerifiedSummaryStage,
} from "./summary-runtime.ts";

import {
  createUserFileJob,
  extractInlineText,
  MemoryUserFileJobStore,
  resolveExtractionStrategy,
} from "../../../packages/ai-pipeline/src/user-files/index.ts";
import type {
  AudioSegmentStore,
  UserFileJobManifest,
} from "../../../packages/ai-pipeline/src/user-files/index.ts";
import type {
  VoiceProvider,
  VoiceRequest,
  VoiceResult,
} from "../../../packages/ai-pipeline/src/voice/contracts.ts";

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

const summaryJob: UserFileJobManifest = {
  ...job,
  stage: "summarizing",
  assets: [
    {
      id: "summary-asset",
      kind: "summary",
      status: "planned",
    },
    {
      id: "summary-audio-asset",
      kind: "summary-audio",
      status: "planned",
    },
  ],
};

const summarized = await runVerifiedSummaryStage({
  job: summaryJob,
  sourceText: "این یک متن آزمایشی برای بررسی مسیر خلاصه‌سازی واقعی زبدینو است.",
  provider: offlinePersianSummaryProvider(),
});

assert.equal(summarized.stage, "summary-audio");
const summaryAsset = summarized.assets.find((asset) => asset.kind === "summary");
assert.equal(summaryAsset?.status, "verified");
assert.ok(summaryAsset?.text?.startsWith("خلاصهٔ آزمایشی زبدینو:"));
assert.equal(summaryAsset?.provenance?.provider, "offline-test");
assert.ok(summaryAsset?.sha256);

const offlineVoiceProvider: VoiceProvider = {
  id: "summary-self-test-voice",
  async synthesize(request: VoiceRequest): Promise<VoiceResult> {
    const audio = new TextEncoder().encode(`summary-audio:${request.text}`);
    return {
      audio,
      mimeType: "audio/wav",
      durationMs: 1000,
      sha256: await sha256Hex(new TextDecoder().decode(audio)),
      provenance: {
        provider: "offline-test",
        model: "summary-self-test-v1",
        providerVoice: request.voiceId,
        adapterVersion: "summary-self-test-v1",
      },
      retryCount: 0,
    };
  },
};

const offlineAudioStore: AudioSegmentStore = {
  async put(input) {
    return `internal://summary-self-test/${input.segmentId}`;
  },
};

const summaryAudioReady = await runVerifiedSummaryAudioStage({
  job: summarized,
  provider: offlineVoiceProvider,
  store: offlineAudioStore,
  maxSegmentCharacters: 400,
});

assert.equal(summaryAudioReady.stage, "quality-check");
const summaryAudioAsset = summaryAudioReady.assets.find((asset) => asset.kind === "summary-audio");
assert.equal(summaryAudioAsset?.status, "verified");
assert.ok((summaryAudioAsset?.audioSegments?.length ?? 0) > 0);

console.log(
  "Secure upload runtime foundation + verified summary audio: PASS",
);
