export interface VoiceSwitchContinuityInput {
  currentTime: number;
  isPlaying: boolean;
}

export interface VoiceSwitchContinuity {
  autoplay: boolean;
  startAt: number;
}

export interface PendingAudioTransition {
  episodeId: string;
  sourceUrl: string;
  startAt: number;
  autoplay: boolean;
}

export interface AudioTransitionMatchInput {
  transition: PendingAudioTransition | null;
  episodeId: string | null;
  sourceUrl: string | null;
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

export function createPendingAudioTransition({
  episodeId,
  sourceUrl,
  startAt,
  autoplay,
}: PendingAudioTransition): PendingAudioTransition {
  return {
    episodeId,
    sourceUrl,
    startAt:
      Number.isFinite(startAt) && startAt > 0
        ? startAt
        : 0,
    autoplay,
  };
}

export function isPendingAudioTransitionMatch({
  transition,
  episodeId,
  sourceUrl,
}: AudioTransitionMatchInput): boolean {
  if (!transition || !episodeId || !sourceUrl) {
    return false;
  }

  return (
    transition.episodeId === episodeId &&
    transition.sourceUrl === sourceUrl
  );
}