const QUOTA_CODE_PATTERN = /\b(?:quota_exceeded|resource_exhausted)\b/iu;
const QUOTA_MESSAGE_PATTERN = /(?:exceeded\s+your\s+current\s+quota|quota\s+exceeded|free[_ -]?tier|requests?\s+per\s+day|daily\s+quota|rate[- ]?limit[^\n]*quota)/iu;
const RETRY_AFTER_PATTERN = /(?:please\s+retry\s+in|retry[- ]?after)\s*[:=]?\s*([0-9]+(?:\.[0-9]+)?)\s*(ms|milliseconds?|s|sec(?:onds?)?|m|min(?:utes?)?)/iu;
const TRANSIENT_PROVIDER_CODE_PATTERN = /\bapi_error\b/iu;
const TRANSIENT_PROVIDER_MESSAGE_PATTERN = /(?:currently\s+experiencing\s+high\s+demand|spikes\s+in\s+demand\s+are\s+usually\s+temporary)/iu;

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

export function classifyTransientProviderPause(error) {
  const text = normalizeErrorText(error);
  const hasApiError = TRANSIENT_PROVIDER_CODE_PATTERN.test(text);
  const hasTemporaryDemandSignal = TRANSIENT_PROVIDER_MESSAGE_PATTERN.test(text);

  if (!hasApiError || !hasTemporaryDemandSignal) {
    return {
      state: "not-transient-provider-paused",
      retryAfterMs: null,
      reason: null,
    };
  }

  return {
    state: "transient-provider-paused",
    retryAfterMs: retryAfterMsFromText(text),
    reason: "transient-provider-high-demand",
  };
}

export function classifyControlledPause(error) {
  const quota = classifyQuotaPause(error);
  if (quota.state === "quota-paused") {
    return {
      ...quota,
      pauseKind: "quota",
    };
  }

  const transientProvider = classifyTransientProviderPause(error);
  if (transientProvider.state === "transient-provider-paused") {
    return {
      ...transientProvider,
      pauseKind: "transient-provider",
    };
  }

  return {
    state: "not-controlled-paused",
    retryAfterMs: null,
    reason: null,
    pauseKind: null,
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

export function createControlledPauseManifest({
  batch,
  voice,
  outputPath,
  error,
  runId = null,
  sourceSha = null,
  checkpointArtifactId = null,
}) {
  const classification = classifyControlledPause(error);
  if (classification.state === "not-controlled-paused") {
    throw new Error("controlled-pause-manifest-requires-retryable-error");
  }

  // Keep the established state/file contract so existing workflow restore and
  // verification remain backward-compatible; reason + pauseKind carry semantics.
  return {
    schemaVersion: 1,
    state: "quota-paused",
    pauseKind: classification.pauseKind,
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
