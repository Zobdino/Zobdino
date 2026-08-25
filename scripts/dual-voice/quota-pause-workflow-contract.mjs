import { classifyQuotaFailure } from "./quota-pause-from-log.mjs";

/**
 * Integration boundary for production render workflow.
 * Keeps quota persistence separate from audio generation so failed
 * checkpoints remain resumable without touching published media.
 */
export function buildQuotaPauseEvent({ log, batch, runId }) {
  const classification = classifyQuotaFailure(log);

  if (!classification.paused) {
    return null;
  }

  return {
    status: "quota-paused",
    schemaVersion: 1,
    batch,
    runId,
    reason: classification.reason,
    retryAfterSeconds: classification.retryAfterSeconds ?? null,
  };
}
