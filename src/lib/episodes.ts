import rawEpisodes from "@/content/episodes.json";

import {
  ATOMIC_HABITS_CANONICAL_AUDIO,
  DEEP_WORK_CANONICAL_AUDIO,
} from "@/lib/canonical-audio";
import type { VoiceProfileId } from "@/lib/voices";

export type EpisodeFormat = "standard";
export type AudioAssetStatus = "placeholder" | "ready";

export interface EpisodeAudioAsset {
  status: AudioAssetStatus;
  objectKey: string;
  previewUrl?: string;
  publicUrl?: string;
  mimeType: "audio/mpeg";
  durationSeconds: number;
  downloadable: boolean;
  sha256?: string;
  bytes?: number;
  voiceProfile?: VoiceProfileId;
}

export interface TranscriptCue {
  startSeconds: number;
  endSeconds: number;
  text: string;
}

export interface Episode {
  id: string;
  bookSlug: string;
  title: string;
  description: string;
  audio: EpisodeAudioAsset;
  transcript: string;
  transcriptCues?: readonly TranscriptCue[];
  keyIdeas: readonly string[];
  format: EpisodeFormat;
}

const baseEpisodes = rawEpisodes as readonly Episode[];
const atomicHabitsBase = baseEpisodes.find(
  (episode) => episode.bookSlug === "atomic-habits",
);
const deepWorkBase = baseEpisodes.find((episode) => episode.bookSlug === "deep-work");

function canonicalizeZobdinoTranscript(transcript: string) {
  return transcript
    .replaceAll("کتاب‌کست", "زبدینو")
    .replaceAll("کتاب کست", "زبدینو")
    .replaceAll("KetabCast", "Zobdino");
}

function buildCanonicalVoiceEpisodes(
  base: Episode | undefined,
  audioByVoice: Record<string, EpisodeAudioAsset>,
  slug: string,
): readonly Episode[] {
  return base
    ? (Object.entries(audioByVoice).map(([voiceProfile, audio]) => ({
        ...base,
        id: `${slug}-${voiceProfile}`,
        title: `${base.title} · ${voiceProfile === "sulafat-v1" ? "صدای زن" : "صدای مرد"}`,
        transcript: canonicalizeZobdinoTranscript(base.transcript),
        audio,
      })) as readonly Episode[])
    : [];
}

const canonicalAtomicHabitsEpisodes = buildCanonicalVoiceEpisodes(
  atomicHabitsBase,
  ATOMIC_HABITS_CANONICAL_AUDIO,
  "atomic-habits",
);
const canonicalDeepWorkEpisodes = buildCanonicalVoiceEpisodes(
  deepWorkBase,
  DEEP_WORK_CANONICAL_AUDIO,
  "deep-work",
);

/**
 * Keeps the legacy catalog intact while overlaying verified canonical variants.
 * The public player prefers approved canonical variants.
 */
export const episodes = [
  ...baseEpisodes,
  ...canonicalAtomicHabitsEpisodes,
  ...canonicalDeepWorkEpisodes,
] as readonly Episode[];
