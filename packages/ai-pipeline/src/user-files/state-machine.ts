import type {
  UserFileJobManifest,
  UserFileStage,
} from "./contracts.ts";

const transitions: Record<
  UserFileStage,
  readonly UserFileStage[]
> = {
  received: ["validating", "failed"],
  validating: ["extracting", "failed"],
  extracting: ["normalizing", "failed"],
  normalizing: ["indexing", "failed"],
  indexing: ["planning", "failed"],
  planning: [
    "full-audio",
    "summarizing",
    "failed",
  ],
  "full-audio": [
    "summarizing",
    "summary-audio",
    "quality-check",
    "quota-paused",
    "failed",
  ],
  summarizing: [
    "summary-audio",
    "quality-check",
    "quota-paused",
    "failed",
  ],
  "summary-audio": [
    "quality-check",
    "quota-paused",
    "failed",
  ],
  "quality-check": [
    "ready",
    "quota-paused",
    "failed",
  ],
  "quota-paused": [
    "full-audio",
    "summarizing",
    "summary-audio",
    "quality-check",
    "failed",
  ],
  ready: [],
  failed: [],
};

export function canTransition(
  current: UserFileStage,
  next: UserFileStage,
) {
  return transitions[current].includes(next);
}

export function transitionJob(
  job: UserFileJobManifest,
  next: UserFileStage,
  now = new Date().toISOString(),
): UserFileJobManifest {
  if (!canTransition(job.stage, next)) {
    throw new Error(
      `Invalid user-file transition: ${job.stage} -> ${next}`,
    );
  }

  return {
    ...job,
    stage: next,
    updatedAt: now,
  };
}

export function checkpointJob(
  job: UserFileJobManifest,
  digest?: string,
  now = new Date().toISOString(),
): UserFileJobManifest {
  return {
    ...job,
    updatedAt: now,
    checkpoints: [
      ...job.checkpoints,
      {
        stage: job.stage,
        completedAt: now,
        digest,
      },
    ],
  };
}
