import type {
  GeneratedAsset,
  UserFileJobManifest,
  UserFileMode,
  UserFileStage,
} from "./contracts.ts";
import {
  checkpointJob,
  transitionJob,
} from "./state-machine.ts";

const PLANNING_CHECKPOINT_DIGEST = "user-file-output-plan:v1";

function plannedAsset(id: string, kind: GeneratedAsset["kind"]): GeneratedAsset {
  return {
    id,
    kind,
    status: "planned",
  };
}

export function plannedAssetsForMode(
  mode: UserFileMode,
  jobId: string,
): GeneratedAsset[] {
  const assets: GeneratedAsset[] = [
    plannedAsset(`${jobId}:transcript`, "transcript"),
    plannedAsset(`${jobId}:chapter-map`, "chapter-map"),
  ];

  if (mode === "full-audio" || mode === "both") {
    assets.push(plannedAsset(`${jobId}:full-audio`, "full-audio"));
  }

  if (mode === "summary-podcast" || mode === "both") {
    assets.push(
      plannedAsset(`${jobId}:summary`, "summary"),
      plannedAsset(`${jobId}:summary-audio`, "summary-audio"),
    );
  }

  return assets;
}

export function nextGenerationStage(mode: UserFileMode): UserFileStage {
  return mode === "summary-podcast" ? "summarizing" : "full-audio";
}

function hasPlanningCheckpoint(job: UserFileJobManifest) {
  return job.checkpoints.some(
    (checkpoint) => checkpoint.stage === "planning" && checkpoint.digest === PLANNING_CHECKPOINT_DIGEST,
  );
}

function mergePlannedAssets(
  current: GeneratedAsset[],
  planned: GeneratedAsset[],
) {
  const byId = new Map(current.map((asset) => [asset.id, asset]));
  for (const asset of planned) {
    if (!byId.has(asset.id)) byId.set(asset.id, asset);
  }
  return Array.from(byId.values());
}

export function orchestrateNormalizedUserFile(
  input: UserFileJobManifest,
  now = new Date().toISOString(),
): UserFileJobManifest {
  if (hasPlanningCheckpoint(input)) {
    return input;
  }

  if (input.stage !== "normalizing") {
    throw new Error(
      `User-file orchestration requires normalizing stage, received ${input.stage}.`,
    );
  }

  let job = checkpointJob(
    input,
    "normalized-content:v1",
    now,
  );

  job = transitionJob(job, "indexing", now);
  job = checkpointJob(job, "source-index:v1", now);

  job = transitionJob(job, "planning", now);
  job = {
    ...job,
    assets: mergePlannedAssets(
      job.assets,
      plannedAssetsForMode(job.mode, job.jobId),
    ),
  };
  job = checkpointJob(job, PLANNING_CHECKPOINT_DIGEST, now);

  return transitionJob(
    job,
    nextGenerationStage(job.mode),
    now,
  );
}
