import type { GeneratedAsset, UserFileJobManifest } from "./contracts.ts";
import { checkpointJob, transitionJob } from "./state-machine.ts";

function requiredKinds(job: UserFileJobManifest): GeneratedAsset["kind"][] {
  if (job.mode === "full-audio") return ["full-audio"];
  if (job.mode === "summary-podcast") return ["summary", "summary-audio"];
  return ["full-audio", "summary", "summary-audio"];
}

export function missingVerifiedAssetKinds(job: UserFileJobManifest) {
  return requiredKinds(job).filter((kind) =>
    !job.assets.some((asset) => asset.kind === kind && asset.status === "verified")
  );
}

export function finalizeUserFileJob(
  input: UserFileJobManifest,
  now = new Date().toISOString(),
): UserFileJobManifest {
  if (input.stage === "ready") return input;
  if (input.stage !== "quality-check") {
    throw new Error(`Finalization requires quality-check stage, received ${input.stage}.`);
  }
  if (input.privacy !== "private") {
    throw new Error("User-file finalization only supports private library output in this slice.");
  }

  const missing = missingVerifiedAssetKinds(input);
  if (missing.length > 0) {
    throw new Error(`Quality gate blocked: missing verified assets: ${missing.join(", ")}.`);
  }

  const digest = `private-library-ready:v1:${requiredKinds(input).join("+")}`;
  let job = input;
  if (!job.checkpoints.some((checkpoint) => checkpoint.digest === digest)) {
    job = checkpointJob(job, digest, now);
  }
  return transitionJob(job, "ready", now);
}
