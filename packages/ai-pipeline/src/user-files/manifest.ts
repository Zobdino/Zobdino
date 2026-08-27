import { randomUUID } from "node:crypto";

import type {
  UserFileJobManifest,
  UserFileMode,
  UserFileSource,
  UserFileVoice,
} from "./contracts.ts";

interface CreateUserFileJobInput {
  ownerId: string;
  source: UserFileSource;
  mode?: UserFileMode;
  voice?: UserFileVoice;
  now?: string;
  jobId?: string;
}

export function createUserFileJob(
  input: CreateUserFileJobInput,
): UserFileJobManifest {
  if (!input.source.rightsConfirmed) {
    throw new Error(
      "User must confirm rights or authorization before processing.",
    );
  }

  if (input.source.sizeBytes <= 0) {
    throw new Error("Source file must not be empty.");
  }

  if (!input.source.sha256) {
    throw new Error("Source SHA-256 is required.");
  }

  const now =
    input.now ?? new Date().toISOString();

  return {
    schemaVersion: "1.0",
    jobId: input.jobId ?? randomUUID(),
    ownerId: input.ownerId,

    // User uploads are never public by default.
    privacy: "private",

    // Zobdino's differentiated default:
    // produce both outputs unless user chooses otherwise.
    mode: input.mode ?? "both",

    voice: input.voice ?? "sulafat",

    source: input.source,
    stage: "received",

    createdAt: now,
    updatedAt: now,

    checkpoints: [],
    provenance: [],
    assets: [],
  };
}
