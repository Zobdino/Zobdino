import type {
  GeneratedAsset,
  UserFileJobManifest,
  UserFileStage,
} from "./contracts.ts";
import { pauseForQuota } from "./quota.ts";
import { checkpointJob, transitionJob } from "./state-machine.ts";

export interface GenerationUnit {
  id: string;
  assetId: string;
  stage: Extract<UserFileStage, "full-audio" | "summarizing" | "summary-audio">;
}

export type GenerationResult =
  | {
      status: "verified";
      sha256?: string;
      uri?: string;
      bytes?: number;
      text?: string;
      provenance?: { provider: string; model: string };
    }
  | {
      status: "quota-paused";
      provider: string;
      operation: string;
      retryAfterSeconds?: number;
      resetAt?: string;
    };

export interface GenerationAdapter {
  run(unit: GenerationUnit, job: UserFileJobManifest): Promise<GenerationResult>;
}

function updateAsset(
  assets: GeneratedAsset[],
  assetId: string,
  result: Extract<GenerationResult, { status: "verified" }>,
) {
  return assets.map((asset) =>
    asset.id === assetId
      ? {
          ...asset,
          status: "verified" as const,
          sha256: result.sha256 ?? asset.sha256,
          uri: result.uri ?? asset.uri,
          bytes: result.bytes ?? asset.bytes,
          text: result.text ?? asset.text,
          provenance: result.provenance ?? asset.provenance,
        }
      : asset,
  );
}

function unitsFor(job: UserFileJobManifest): GenerationUnit[] {
  const target = job.stage === "full-audio"
    ? job.assets.find((item) => item.kind === "full-audio")
    : job.stage === "summarizing"
      ? job.assets.find((item) => item.kind === "summary")
      : job.stage === "summary-audio"
        ? job.assets.find((item) => item.kind === "summary-audio")
        : undefined;
  return target
    ? [{ id: `${job.jobId}:${job.stage}:v1`, assetId: target.id, stage: job.stage as GenerationUnit["stage"] }]
    : [];
}

function alreadyCompleted(job: UserFileJobManifest, unit: GenerationUnit) {
  return job.checkpoints.some((checkpoint) => checkpoint.digest === `generation:${unit.id}:verified`);
}

function nextStage(job: UserFileJobManifest): UserFileStage {
  if (job.stage === "full-audio") {
    return job.mode === "full-audio" ? "quality-check" : "summarizing";
  }
  if (job.stage === "summarizing") return "summary-audio";
  return "quality-check";
}

export async function runUserFileGeneration(
  input: UserFileJobManifest,
  adapter: GenerationAdapter,
  now = new Date().toISOString(),
): Promise<UserFileJobManifest> {
  if (!["full-audio", "summarizing", "summary-audio"].includes(input.stage)) {
    throw new Error(`Generation runner does not support stage ${input.stage}.`);
  }

  let job = input;
  for (const unit of unitsFor(job)) {
    if (alreadyCompleted(job, unit)) continue;

    const result = await adapter.run(unit, job);
    if (result.status === "quota-paused") {
      return pauseForQuota(job, {
        provider: result.provider,
        operation: result.operation,
        retryAfterSeconds: result.retryAfterSeconds,
        resetAt: result.resetAt,
        resumeStage: unit.stage,
        pausedAt: now,
      });
    }

    job = {
      ...job,
      assets: updateAsset(job.assets, unit.assetId, result),
    };
    job = checkpointJob(job, `generation:${unit.id}:verified`, now);
  }

  return transitionJob(job, nextStage(job), now);
}
