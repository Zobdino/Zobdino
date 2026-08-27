import type {
  QuotaPause,
  UserFileJobManifest,
} from "./contracts.ts";

export function pauseForQuota(
  job: UserFileJobManifest,
  pause: Omit<QuotaPause, "pausedAt"> & {
    pausedAt?: string;
  },
): UserFileJobManifest {
  const pausedAt =
    pause.pausedAt ?? new Date().toISOString();

  return {
    ...job,
    stage: "quota-paused",
    updatedAt: pausedAt,
    quotaPause: {
      ...pause,
      pausedAt,
    },
  };
}

export function resumeFromQuota(
  job: UserFileJobManifest,
  now = new Date().toISOString(),
): UserFileJobManifest {
  if (
    job.stage !== "quota-paused" ||
    !job.quotaPause
  ) {
    throw new Error(
      "Job is not in a resumable quota-paused state.",
    );
  }

  return {
    ...job,
    stage: job.quotaPause.resumeStage,
    updatedAt: now,
    quotaPause: undefined,
  };
}
