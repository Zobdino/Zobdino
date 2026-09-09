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

  const retryAfterSeconds = job.quotaPause.retryAfterSeconds;
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    const pausedAtMs = Date.parse(job.quotaPause.pausedAt);
    const nowMs = Date.parse(now);
    const resumeAtMs = pausedAtMs + retryAfterSeconds * 1000;
    if (Number.isFinite(pausedAtMs) && Number.isFinite(nowMs) && nowMs < resumeAtMs) {
      throw new Error(`quota-resume-not-ready:${new Date(resumeAtMs).toISOString()}`);
    }
  }

  return {
    ...job,
    stage: job.quotaPause.resumeStage,
    updatedAt: now,
    quotaPause: undefined,
  };
}
