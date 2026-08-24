import type { EpisodeAudioAsset } from "@/lib/episodes";
import {
  getVoiceProfileLabelFa,
  isApprovedVoiceProfile,
} from "@/lib/voices";

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, "");
}

function encodeObjectKey(objectKey: string): string {
  return objectKey
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export function resolveEpisodeAudioUrl(
  audio: EpisodeAudioAsset,
): string | null {
  if (audio.status === "ready") {
    if (audio.publicUrl) return audio.publicUrl;

    const baseUrl = normalizeBaseUrl(
      process.env.NEXT_PUBLIC_AUDIO_BASE_URL,
    );

    if (!baseUrl) return null;
    return `${baseUrl}/${encodeObjectKey(audio.objectKey)}`;
  }

  return audio.previewUrl ?? null;
}

export function isProductionAudio(
  audio: EpisodeAudioAsset,
): boolean {
  return audio.status === "ready" && isApprovedVoiceProfile(audio.voiceProfile);
}

export function getEpisodeVoiceLabelFa(audio: EpisodeAudioAsset): string {
  return getVoiceProfileLabelFa(audio.voiceProfile);
}
