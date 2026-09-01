const QUOTA_CODE_PATTERN = /\b(?:quota_exceeded|resource_exhausted)\b/iu;
const QUOTA_MESSAGE_PATTERN = /(?:exceeded\s+your\s+current\s+quota|quota\s+exceeded|free[_ -]?tier|requests?\s+per\s+day|daily\s+quota|rate[- ]?limit[^\n]*quota)/iu;
const RETRY_AFTER_PATTERN = /(?:please\s+retry\s+in|retry[- ]?after)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*(ms|milliseconds?|s|sec(?:onds?)?|m|min(?:utes?)?)/iu;

function normalizeErrorText(error) {
  if (error == null) return "";

  if (typeof error === "string") return error;

  const parts = [
    error?.code,
    error?.status,
    error?.name,
    error?.message,
    error?.cause?.code,
    error?.cause?.message,
  ];

  return parts
    .filter((value) => value != null && String(value).trim())
    .map((value) => String(value).trim())
    .join(" | ");
}

function retryAfterMsFromText(text) {
  const match = String(text ?? "").match(RETRY_AFTER_PATTERN);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value) || value < 0) return null;

  const unit = match[2].toLowerCase();
  if (unit.startsWith("m") && !unit.startsWith("ms") && !unit.startsWith("mill")) {
    return Math.ceil(value * 60_000);
  }
  if (unit.startsWith("ms") || unit.startsWith("mill")) {
    return Math.ceil(value);
  }
  return Math.ceil(value * 1_000);
}

export function classifyQuotaPause(error) {
  const text = normalizeErrorText(error);
  const normalized = text.toLowerCase();
  const has429 = /(?:^|\D)429(?:\D|$)/u.test(normalized);
  const hasExplicitQuotaCode = QUOTA_CODE_PATTERN.test(normalized);
  const hasQuotaMessage = QUOTA_MESSAGE_PATTERN.test(normalized);
  const isQuotaPause = hasExplicitQuotaCode || (has429 && hasQuotaMessage);

  if (!isQuotaPause) {
    return {
      state: "not-quota-paused",
      retryAfterMs: null,
      reason: null,
    };
  }

  return {
    state: "quota-paused",
    retryAfterMs: retryAfterMsFromText(text),
    reason: hasExplicitQuotaCode ? "explicit-quota-exhausted" : "429-quota-exhausted",
  };
}

export function createQuotaPausedManifest({
  batch,
  voice,
  outputPath,
  error,
  runId = null,
  sourceSha = null,
  checkpointArtifactId = null,
}) {
  const classification = classifyQuotaPause(error);
  if (classification.state !== "quota-paused") {
    throw new Error("quota-paused-manifest-requires-quota-error");
  }

  return {
    schemaVersion: 1,
    state: "quota-paused",
    batch: String(batch ?? ""),
    voice: voice == null ? null : String(voice),
    outputPath: outputPath == null ? null : String(outputPath),
    retryAfterMs: classification.retryAfterMs,
    reason: classification.reason,
    runId: runId == null ? null : String(runId),
    sourceSha: sourceSha == null ? null : String(sourceSha),
    checkpointArtifactId:
      checkpointArtifactId == null ? null : String(checkpointArtifactId),
  };
}
