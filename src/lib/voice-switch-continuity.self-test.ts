import assert from "node:assert/strict";

import {
  createPendingAudioTransition,
  getVoiceSwitchContinuity,
  isPendingAudioTransitionMatch,
} from "./voice-switch-continuity.ts";

assert.deepEqual(
  getVoiceSwitchContinuity({
    currentTime: 30.75,
    isPlaying: true,
  }),
  {
    autoplay: true,
    startAt: 30.75,
  },
  "playing voice switch must continue playback from the same timestamp",
);

assert.deepEqual(
  getVoiceSwitchContinuity({
    currentTime: 30.75,
    isPlaying: false,
  }),
  {
    autoplay: false,
    startAt: 30.75,
  },
  "paused voice switch must remain paused at the same timestamp",
);

assert.deepEqual(
  getVoiceSwitchContinuity({
    currentTime: 0,
    isPlaying: true,
  }),
  {
    autoplay: true,
    startAt: 0,
  },
  "voice switch at the beginning must remain playable from zero",
);

assert.deepEqual(
  getVoiceSwitchContinuity({
    currentTime: Number.NaN,
    isPlaying: false,
  }),
  {
    autoplay: false,
    startAt: 0,
  },
  "invalid timestamps must safely fall back to zero",
);

const transition = createPendingAudioTransition({
  episodeId: "atomic-habits-schedar",
  sourceUrl: "https://example.test/schedar.mp3",
  startAt: 30.75,
  autoplay: true,
});

assert.deepEqual(
  transition,
  {
    episodeId: "atomic-habits-schedar",
    sourceUrl: "https://example.test/schedar.mp3",
    startAt: 30.75,
    autoplay: true,
  },
  "pending transition must retain its target identity and continuity state",
);

assert.equal(
  isPendingAudioTransitionMatch({
    transition,
    episodeId: "atomic-habits-schedar",
    sourceUrl: "https://example.test/schedar.mp3",
  }),
  true,
  "matching target metadata must consume the pending transition",
);

assert.equal(
  isPendingAudioTransitionMatch({
    transition,
    episodeId: "atomic-habits-sulafat",
    sourceUrl: "https://example.test/sulafat.mp3",
  }),
  false,
  "stale metadata from the previous voice must not consume the transition",
);

assert.equal(
  isPendingAudioTransitionMatch({
    transition,
    episodeId: "atomic-habits-schedar",
    sourceUrl: "https://example.test/sulafat.mp3",
  }),
  false,
  "wrong source metadata must not consume the transition",
);

assert.equal(
  isPendingAudioTransitionMatch({
    transition: null,
    episodeId: "atomic-habits-schedar",
    sourceUrl: "https://example.test/schedar.mp3",
  }),
  false,
  "missing transition must never match",
);

const invalidStart = createPendingAudioTransition({
  episodeId: "zero-to-one-schedar",
  sourceUrl: "https://example.test/zero.mp3",
  startAt: Number.NaN,
  autoplay: false,
});

assert.equal(
  invalidStart.startAt,
  0,
  "invalid transition timestamp must safely fall back to zero",
);

console.log(
  "Voice switch continuity OK: target identity, timestamp and playback state are preserved.",
);