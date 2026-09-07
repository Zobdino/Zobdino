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

/**
 * Immutable, QA-passed Deep Work media released as media-dual-v0.2.0-beta.6.
 * Source generation run: 34098964897 at 5750ab376653f742308de1343f4d39196fb8836d.
 */
export const DEEP_WORK_CANONICAL_AUDIO = {
  "sulafat-v1": {
    status: "ready",
    objectKey: "media-dual-v0.2.0-beta.6/deep-work-sulafat-v1.mp3",
    publicUrl:
      "https://github.com/Zobdino/Zobdino/releases/download/media-dual-v0.2.0-beta.6/deep-work-sulafat-v1.mp3",
    mimeType: "audio/mpeg",
    durationSeconds: 1070.89,
    downloadable: false,
    sha256:
      "227a7e9bcfaf23819ad99e9947ef0a02da6dd501f5762cd7c7a2650a6d3beb50",
    bytes: 17134698,
    voiceProfile: "sulafat-v1",
  } satisfies EpisodeAudioAsset,
  "schedar-v1": {
    status: "ready",
    objectKey: "media-dual-v0.2.0-beta.6/deep-work-schedar-v1.mp3",
    publicUrl:
      "https://github.com/Zobdino/Zobdino/releases/download/media-dual-v0.2.0-beta.6/deep-work-schedar-v1.mp3",
    mimeType: "audio/mpeg",
    durationSeconds: 851.461,
    downloadable: false,
    sha256:
      "6de83a26fd9761e769ce367c2ddc1f863d754bea86309dfb1f986ffead075559",
    bytes: 13623841,
    voiceProfile: "schedar-v1",
  } satisfies EpisodeAudioAsset,
} as const;
