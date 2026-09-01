import { createHash } from "node:crypto";

import type { VoiceProvider } from "../voice/contracts.ts";
import { VoiceProviderError } from "../voice/contracts.ts";
import { VoiceService } from "../voice/service.ts";
import type {
  AudioSegmentReceipt,
  GeneratedAsset,
  UserFileJobManifest,
  UserFileStage,
  UserFileVoice,
} from "./contracts.ts";
import { pauseForQuota } from "./quota.ts";
import { checkpointJob, transitionJob } from "./state-machine.ts";

export interface NarrationSegment {
  id: string;
  index: number;
  startOffset: number;
  endOffset: number;
  text: string;
}

export interface AudioSegmentStore {
  put(input: {
    jobId: string;
    assetId: string;
    segmentId: string;
    audio: Uint8Array;
    mimeType: "audio/mpeg" | "audio/wav";
    sha256: string;
  }): Promise<string>;
}

export interface RunAudioStageOptions {
  text: string;
  provider: VoiceProvider;
  store: AudioSegmentStore;
  maxSegmentCharacters?: number;
  now?: string;
  onCheckpoint?: (job: UserFileJobManifest) => Promise<void> | void;
}

const MIN_BREAK_RATIO = 0.55;

export function canonicalVoiceId(voice: UserFileVoice): UserFileVoice {
  return voice;
}

export function planNarrationSegments(
  text: string,
  maxCharacters = 1800,
  idPrefix = "segment",
): NarrationSegment[] {
  if (!Number.isInteger(maxCharacters) || maxCharacters < 200 || maxCharacters > 5000) {
    throw new Error("audio-segment-size-invalid");
  }
  if (!text.trim()) throw new Error("audio-source-text-empty");

  const segments: NarrationSegment[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    while (cursor < text.length && /\s/u.test(text[cursor]!)) cursor += 1;
    if (cursor >= text.length) break;

    const hardEnd = Math.min(cursor + maxCharacters, text.length);
    let end = hardEnd;

    if (hardEnd < text.length) {
      const slice = text.slice(cursor, hardEnd);
      const minimum = Math.floor(maxCharacters * MIN_BREAK_RATIO);
      const candidates = [
        slice.lastIndexOf("\n\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf("؟ "),
        slice.lastIndexOf("! "),
        slice.lastIndexOf("؛ "),
      ].filter((value) => value >= minimum);
      if (candidates.length > 0) end = cursor + Math.max(...candidates) + 1;
    }

    while (end > cursor && /\s/u.test(text[end - 1]!)) end -= 1;
    if (end <= cursor) end = hardEnd;

    const index = segments.length;
    segments.push({
      id: `${idPrefix}:${String(index).padStart(4, "0")}`,
      index,
      startOffset: cursor,
      endOffset: end,
      text: text.slice(cursor, end),
    });
    cursor = end;
  }

  return segments;
}

function audioStage(input: UserFileJobManifest): Extract<UserFileStage, "full-audio" | "summary-audio"> {
  if (input.stage !== "full-audio" && input.stage !== "summary-audio") {
    throw new Error(`Audio segment runner does not support stage ${input.stage}.`);
  }
  return input.stage;
}

function targetAsset(job: UserFileJobManifest, stage: "full-audio" | "summary-audio") {
  const kind = stage === "full-audio" ? "full-audio" : "summary-audio";
  const asset = job.assets.find((candidate) => candidate.kind === kind);
  if (!asset) throw new Error(`audio-target-asset-missing:${kind}`);
  return asset;
}

function replaceAsset(job: UserFileJobManifest, replacement: GeneratedAsset): UserFileJobManifest {
  return {
    ...job,
    assets: job.assets.map((asset) => asset.id === replacement.id ? replacement : asset),
  };
}

function aggregateDigest(receipts: AudioSegmentReceipt[]) {
  const hash = createHash("sha256");
  for (const receipt of receipts) {
    hash.update(`${receipt.index}:${receipt.sha256}:${receipt.durationMs}:${receipt.bytes}\n`);
  }
  return hash.digest("hex");
}

function nextStage(job: UserFileJobManifest, stage: "full-audio" | "summary-audio"): UserFileStage {
  if (stage === "summary-audio") return "quality-check";
  return job.mode === "full-audio" ? "quality-check" : "summarizing";
}

export async function runCanonicalAudioStage(
  input: UserFileJobManifest,
  options: RunAudioStageOptions,
): Promise<UserFileJobManifest> {
  const stage = audioStage(input);
  const originalAsset = targetAsset(input, stage);
  const segmentPlan = planNarrationSegments(
    options.text,
    options.maxSegmentCharacters ?? 1800,
    `${originalAsset.id}:tts`,
  );
  const service = new VoiceService(options.provider, { maxAttempts: 1 });
  const now = options.now ?? new Date().toISOString();
  let job = input;

  for (const segment of segmentPlan) {
    const currentAsset = targetAsset(job, stage);
    const existing = currentAsset.audioSegments?.find(
      (receipt) => receipt.id === segment.id && receipt.status === "verified",
    );
    if (existing) continue;

    try {
      const result = await service.narrate({
        text: segment.text,
        voiceId: canonicalVoiceId(job.voice),
        mode: stage === "full-audio" ? "full" : "summary",
        chapterId: segment.id,
        language: "fa-IR",
      });
      const uri = await options.store.put({
        jobId: job.jobId,
        assetId: currentAsset.id,
        segmentId: segment.id,
        audio: result.audio,
        mimeType: result.mimeType,
        sha256: result.sha256,
      });
      const receipt: AudioSegmentReceipt = {
        id: segment.id,
        index: segment.index,
        startOffset: segment.startOffset,
        endOffset: segment.endOffset,
        status: "verified",
        uri,
        sha256: result.sha256,
        bytes: result.audio.byteLength,
        durationMs: result.durationMs,
        mimeType: result.mimeType,
        provenance: result.provenance,
      };
      const receipts = [...(currentAsset.audioSegments ?? []), receipt]
        .sort((a, b) => a.index - b.index);
      job = replaceAsset(job, {
        ...currentAsset,
        status: "processing",
        audioSegments: receipts,
      });
      job = checkpointJob(job, `tts-segment:${segment.id}:${result.sha256}`, now);
      await options.onCheckpoint?.(job);
    } catch (error) {
      if (error instanceof VoiceProviderError && error.status === 429) {
        job = pauseForQuota(job, {
          provider: options.provider.id,
          operation: `tts:${stage}:${segment.id}`,
          resumeStage: stage,
          pausedAt: now,
        });
        await options.onCheckpoint?.(job);
        return job;
      }
      throw error;
    }
  }

  const completedAsset = targetAsset(job, stage);
  const receipts = completedAsset.audioSegments ?? [];
  if (receipts.length !== segmentPlan.length) throw new Error("audio-segment-coverage-incomplete");
  const digest = aggregateDigest(receipts);
  const bytes = receipts.reduce((sum, receipt) => sum + receipt.bytes, 0);
  job = replaceAsset(job, {
    ...completedAsset,
    status: "verified",
    uri: `segments://${job.jobId}/${completedAsset.id}`,
    sha256: digest,
    bytes,
    audioSegments: receipts,
  });
  job = checkpointJob(job, `tts-asset:${completedAsset.id}:${digest}`, now);
  await options.onCheckpoint?.(job);
  return transitionJob(job, nextStage(job, stage), now);
}
