import {
  runCanonicalAudioStage,
  runUserFileGeneration,
} from "../../../packages/ai-pipeline/src/user-files/index.ts";

import type {
  AudioSegmentStore,
  UserFileJobManifest,
} from "../../../packages/ai-pipeline/src/user-files/index.ts";
import type { VoiceProvider } from "../../../packages/ai-pipeline/src/voice/contracts.ts";

import type { SummaryProvider } from "./summary-provider.ts";

async function sha256Text(value: string) {
  const bytes = new TextEncoder().encode(value);
  const normalized = Uint8Array.from(bytes);
  const digest = await crypto.subtle.digest("SHA-256", normalized.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function runVerifiedSummaryStage(input: {
  job: UserFileJobManifest;
  sourceText: string;
  provider: SummaryProvider;
  onCheckpoint?: (job: UserFileJobManifest) => Promise<void>;
}) {
  if (input.job.stage !== "summarizing") {
    throw new Error(`Summary runtime requires summarizing stage, received ${input.job.stage}.`);
  }

  const generated = await runUserFileGeneration(input.job, {
    async run(unit) {
      try {
        const result = await input.provider.summarize(input.sourceText);
        const text = result.text.trim();
        if (!text) throw new Error("summary-provider-empty-response");
        const sha256 = await sha256Text(text);
        return {
          status: "verified" as const,
          sha256,
          uri: `private-summary://${encodeURIComponent(input.job.jobId)}/${encodeURIComponent(unit.assetId)}`,
          bytes: new TextEncoder().encode(text).byteLength,
          text,
          provenance: {
            provider: result.provider,
            model: result.model,
          },
        };
      } catch (error) {
        const status = Number((error as { status?: unknown })?.status ?? 0);
        if (status === 429 || (error instanceof Error && error.message === "summary-provider-quota-exhausted")) {
          return {
            status: "quota-paused" as const,
            provider: "gemini",
            operation: "summary-text",
          };
        }
        throw error;
      }
    },
  });

  await input.onCheckpoint?.(generated);
  return generated;
}

export async function runVerifiedSummaryAudioStage(input: {
  job: UserFileJobManifest;
  provider: VoiceProvider;
  store: AudioSegmentStore;
  maxSegmentCharacters?: number;
  onCheckpoint?: (job: UserFileJobManifest) => Promise<void>;
}) {
  if (input.job.stage !== "summary-audio") {
    throw new Error(`Summary audio runtime requires summary-audio stage, received ${input.job.stage}.`);
  }

  const summary = input.job.assets.find((asset) => asset.kind === "summary");
  if (!summary || summary.status !== "verified" || !summary.text?.trim()) {
    throw new Error("verified-summary-text-missing");
  }

  return runCanonicalAudioStage(input.job, {
    text: summary.text,
    provider: input.provider,
    store: input.store,
    maxSegmentCharacters: input.maxSegmentCharacters,
    onCheckpoint: input.onCheckpoint,
  });
}
