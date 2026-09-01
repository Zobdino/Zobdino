import type { BrowserSection, IngestionMode, IngestionVoice } from "@/lib/browser-ingestion";
import { sha256 } from "@/lib/browser-ingestion";

interface SessionResponse {
  token: string;
  expiresAt: string;
  requestLimit: number;
}

interface CreateJobResponse {
  job: { jobId: string };
  resumeToken: string;
}

export interface BrowserRuntimeAudioSegment {
  id?: string;
  index?: number;
  status?: string;
  startOffset?: number;
  endOffset?: number;
  durationMs?: number;
  mimeType?: string;
  playbackPath?: string;
}

export interface BrowserRuntimeAsset {
  id: string;
  kind: string;
  status: string;
  bytes?: number;
  text?: string;
  audioSegments?: BrowserRuntimeAudioSegment[];
}

export interface BrowserJobStatus {
  jobId: string;
  stage: string;
  mode?: string;
  privacy?: string;
  assets: BrowserRuntimeAsset[];
  quotaPause?: {
    provider?: string;
    operation?: string;
    retryAfterSeconds?: number;
    resetAt?: string;
    resumeStage?: string;
  } | null;
}

export interface BrowserRuntimeResult {
  jobId: string;
  stage: string;
  sectionCount: number;
  characterCount: number;
  contentSha256: string;
  sessionToken: string;
  resumeToken: string;
}

export interface PrivateLibraryItem {
  jobId: string;
  resumeToken: string;
  fileName: string;
  createdAt: string;
  lastOpenedAt: string;
}

const PRIVATE_LIBRARY_KEY = "zobdino.private-library.v1";

export class BrowserRuntimeError extends Error {
  constructor(public readonly code: string, public readonly status?: number) {
    super(code);
    this.name = "BrowserRuntimeError";
  }
}

function runtimeBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_ZOBDINO_INGESTION_RUNTIME_URL?.trim();
  if (!configured) throw new BrowserRuntimeError("runtime-not-configured");
  return configured.replace(/\/+$/, "");
}

async function requestJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new BrowserRuntimeError(String(payload.error ?? "runtime-request-failed"), response.status);
  }
  return payload as T;
}

function sessionHeaders(sessionToken: string) {
  return {
    "content-type": "application/json",
    "x-zobdino-session": sessionToken,
  };
}

function resumeHeaders(resumeToken: string) {
  return {
    "content-type": "application/json",
    "x-zobdino-resume": resumeToken,
  };
}

function browserStorageAvailable() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readPrivateLibrary(): PrivateLibraryItem[] {
  if (!browserStorageAvailable()) return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PRIVATE_LIBRARY_KEY) ?? "[]") as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PrivateLibraryItem => {
      const row = item as Partial<PrivateLibraryItem>;
      return Boolean(row.jobId && row.resumeToken && row.fileName && row.createdAt && row.lastOpenedAt);
    });
  } catch {
    return [];
  }
}

function persistPrivateLibrary(items: PrivateLibraryItem[]) {
  if (!browserStorageAvailable()) return;
  window.localStorage.setItem(PRIVATE_LIBRARY_KEY, JSON.stringify(items.slice(0, 50)));
}

export function rememberPrivateJob(input: {
  jobId: string;
  resumeToken: string;
  fileName: string;
}) {
  const now = new Date().toISOString();
  const existing = readPrivateLibrary().filter((item) => item.jobId !== input.jobId);
  persistPrivateLibrary([
    {
      jobId: input.jobId,
      resumeToken: input.resumeToken,
      fileName: input.fileName,
      createdAt: now,
      lastOpenedAt: now,
    },
    ...existing,
  ]);
}

export function forgetPrivateJob(jobId: string) {
  persistPrivateLibrary(readPrivateLibrary().filter((item) => item.jobId !== jobId));
}

function touchPrivateJob(jobId: string) {
  const now = new Date().toISOString();
  persistPrivateLibrary(
    readPrivateLibrary()
      .map((item) => item.jobId === jobId ? { ...item, lastOpenedAt: now } : item)
      .sort((a, b) => b.lastOpenedAt.localeCompare(a.lastOpenedAt)),
  );
}

async function getJobStatusWithHeaders(jobId: string, headers: HeadersInit): Promise<BrowserJobStatus> {
  const baseUrl = runtimeBaseUrl();
  const payload = await requestJson<{
    job?: {
      jobId?: unknown;
      stage?: unknown;
      mode?: unknown;
      privacy?: unknown;
      assets?: unknown;
      quotaPause?: BrowserJobStatus["quotaPause"];
    };
  }>(`${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}`, {
    method: "GET",
    headers,
  });

  return {
    jobId: String(payload.job?.jobId ?? jobId),
    stage: String(payload.job?.stage ?? "received"),
    mode: payload.job?.mode ? String(payload.job.mode) : undefined,
    privacy: payload.job?.privacy ? String(payload.job.privacy) : undefined,
    assets: Array.isArray(payload.job?.assets) ? payload.job.assets as BrowserRuntimeAsset[] : [],
    quotaPause: payload.job?.quotaPause ?? null,
  };
}

export async function getBrowserJobStatus(jobId: string, sessionToken: string): Promise<BrowserJobStatus> {
  return getJobStatusWithHeaders(jobId, { "x-zobdino-session": sessionToken });
}

export async function reopenPrivateJob(jobId: string, resumeToken: string): Promise<BrowserJobStatus> {
  const status = await getJobStatusWithHeaders(jobId, { "x-zobdino-resume": resumeToken });
  touchPrivateJob(jobId);
  return status;
}

async function fetchAudioWithHeaders(playbackPath: string, headers: HeadersInit): Promise<Blob> {
  const baseUrl = runtimeBaseUrl();
  const normalizedPath = playbackPath.startsWith("/") ? playbackPath : `/${playbackPath}`;
  const response = await fetch(`${baseUrl}${normalizedPath}`, {
    method: "GET",
    headers,
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
    throw new BrowserRuntimeError(String(payload.error ?? "audio-playback-failed"), response.status);
  }
  return response.blob();
}

export async function fetchBrowserAudioSegment(
  playbackPath: string,
  sessionToken: string,
): Promise<Blob> {
  return fetchAudioWithHeaders(playbackPath, { "x-zobdino-session": sessionToken });
}

export async function fetchResumedAudioSegment(
  playbackPath: string,
  resumeToken: string,
): Promise<Blob> {
  return fetchAudioWithHeaders(playbackPath, { "x-zobdino-resume": resumeToken });
}

async function postJobAction(jobId: string, sessionToken: string, action: "advance" | "generate" | "finalize") {
  const baseUrl = runtimeBaseUrl();
  return requestJson<Record<string, unknown>>(
    `${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}/${action}`,
    {
      method: "POST",
      headers: sessionHeaders(sessionToken),
      body: "{}",
    },
  );
}

export async function driveBrowserJobToTerminal(
  jobId: string,
  sessionToken: string,
  maxTransitions = 12,
): Promise<BrowserJobStatus> {
  for (let transition = 0; transition < maxTransitions; transition += 1) {
    const status = await getBrowserJobStatus(jobId, sessionToken);

    if (["ready", "failed", "quota-paused"].includes(status.stage)) return status;

    if (["normalizing", "planning"].includes(status.stage)) {
      await postJobAction(jobId, sessionToken, "advance");
      continue;
    }

    if (["full-audio", "summarizing", "summary-audio"].includes(status.stage)) {
      await postJobAction(jobId, sessionToken, "generate");
      continue;
    }

    if (status.stage === "quality-check") {
      await postJobAction(jobId, sessionToken, "finalize");
      continue;
    }

    return status;
  }

  return getBrowserJobStatus(jobId, sessionToken);
}

export async function runBrowserIngestion(input: {
  file: File;
  sections: BrowserSection[];
  contentSha256: string;
  mode: IngestionMode;
  voice: IngestionVoice;
  rightsConfirmed: boolean;
}): Promise<BrowserRuntimeResult> {
  const baseUrl = runtimeBaseUrl();
  const session = await requestJson<SessionResponse>(`${baseUrl}/v1/browser-sessions`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{}",
  });

  const headers = sessionHeaders(session.token);
  const lowerName = input.file.name.toLowerCase();
  const format = lowerName.endsWith(".md") ? "markdown" : "txt";
  const fileSha256 = await sha256(await input.file.arrayBuffer());

  const created = await requestJson<CreateJobResponse>(`${baseUrl}/v1/jobs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      fileName: input.file.name,
      format,
      mimeType: input.file.type || undefined,
      sizeBytes: input.file.size,
      sha256: fileSha256,
      mode: input.mode,
      voice: input.voice,
      rightsConfirmed: input.rightsConfirmed,
    }),
  });

  const jobId = created.job.jobId;
  rememberPrivateJob({ jobId, resumeToken: created.resumeToken, fileName: input.file.name });

  const receipt = await requestJson<Omit<BrowserRuntimeResult, "sessionToken" | "resumeToken">>(
    `${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}/content`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({ contentSha256: input.contentSha256, sections: input.sections }),
    },
  );

  const status = await driveBrowserJobToTerminal(jobId, session.token);
  return {
    ...receipt,
    jobId,
    stage: status.stage,
    sessionToken: session.token,
    resumeToken: created.resumeToken,
  };
}
