import rawEpisodes from "@/content/episodes.json";

import { ATOMIC_HABITS_CANONICAL_AUDIO } from "@/lib/canonical-audio";
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

const canonicalAtomicHabitsEpisodes: readonly Episode[] = atomicHabitsBase
  ? (Object.entries(ATOMIC_HABITS_CANONICAL_AUDIO).map(
      ([voiceProfile, audio]) => ({
        ...atomicHabitsBase,
        id: `atomic-habits-${voiceProfile}`,
        title: `${atomicHabitsBase.title} · ${voiceProfile === "sulafat-v1" ? "صدای زن" : "صدای مرد"}`,
        audio,
      }),
    ) as readonly Episode[])
  : [];

/**
 * Keeps the legacy catalog intact while overlaying verified canonical variants
 * for Atomic Habits. The public player prefers approved canonical variants.
 */
export const episodes = [
  ...baseEpisodes,
  ...canonicalAtomicHabitsEpisodes,
] as readonly Episode[];
