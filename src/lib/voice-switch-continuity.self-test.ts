import assert from "node:assert/strict";

import { getVoiceSwitchContinuity } from "./voice-switch-continuity.ts";

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

console.log(
  "Voice switch continuity OK: timestamp and playback state are preserved.",
);
