import type { EpisodeAudioAsset } from "@/lib/episodes";

/**
 * Immutable, QA-passed Atomic Habits media released as media-v0.2.0-rc.1.
 * These URLs are intentionally pinned to the GitHub Release tag and asset names.
 */
export const ATOMIC_HABITS_CANONICAL_AUDIO = {
  "sulafat-v1": {
    status: "ready",
    objectKey: "media-v0.2.0-rc.1/atomic-habits-sulafat-v1.mp3",
    publicUrl:
      "https://github.com/Zobdino/Zobdino/releases/download/media-v0.2.0-rc.1/atomic-habits-sulafat-v1.mp3",
    mimeType: "audio/mpeg",
    durationSeconds: 1039.804082,
    downloadable: false,
    sha256:
      "75c4bcd61fdef7ddceec20fd3a5185e7a9b221371724fb6b9468c45ceadf2f09",
    bytes: 16637327,
    voiceProfile: "sulafat-v1",
  } satisfies EpisodeAudioAsset,
  "schedar-v1": {
    status: "ready",
    objectKey: "media-v0.2.0-rc.1/atomic-habits-schedar-v1.mp3",
    publicUrl:
      "https://github.com/Zobdino/Zobdino/releases/download/media-v0.2.0-rc.1/atomic-habits-schedar-v1.mp3",
    mimeType: "audio/mpeg",
    durationSeconds: 871.732245,
    downloadable: false,
    sha256:
      "32148476c32b6499820d72f6e664e2df5822a6b02833d7720ec7668fd4e12989",
    bytes: 13948177,
    voiceProfile: "schedar-v1",
  } satisfies EpisodeAudioAsset,
} as const;
