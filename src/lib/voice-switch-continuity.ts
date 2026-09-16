export interface VoiceSwitchContinuityInput {
  currentTime: number;
  isPlaying: boolean;
}

export interface VoiceSwitchContinuity {
  autoplay: boolean;
  startAt: number;
}

export function getVoiceSwitchContinuity({
  currentTime,
  isPlaying,
}: VoiceSwitchContinuityInput): VoiceSwitchContinuity {
  return {
    autoplay: isPlaying,
    startAt:
      Number.isFinite(currentTime) && currentTime > 0
        ? currentTime
        : 0,
  };
}
