import type { BrowserSection, IngestionMode, IngestionVoice } from "@/lib/browser-ingestion";
import { sha256 } from "@/lib/browser-ingestion";

interface SessionResponse {
  token: string;
  expiresAt: string;
  requestLimit: number;
}

interface CreateJobResponse {
  job: {
    jobId: string;
  };
}

export interface BrowserRuntimeResult {
  jobId: string;
  stage: string;
  sectionCount: number;
  characterCount: number;
  contentSha256: string;
}

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
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
  });
  const payload = await response.json().catch(() => ({})) as Record<string, unknown>;
  if (!response.ok) {
    throw new BrowserRuntimeError(String(payload.error ?? "runtime-request-failed"), response.status);
  }
  return payload as T;
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

  const sessionHeaders = {
    "content-type": "application/json",
    "x-zobdino-session": session.token,
  };
  const format = input.file.name.toLowerCase().endsWith(".md") ? "markdown" : "txt";
  const fileSha256 = await sha256(await input.file.arrayBuffer());

  const created = await requestJson<CreateJobResponse>(`${baseUrl}/v1/jobs`, {
    method: "POST",
    headers: sessionHeaders,
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
  const receipt = await requestJson<BrowserRuntimeResult>(
    `${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}/content`,
    {
      method: "POST",
      headers: sessionHeaders,
      body: JSON.stringify({
        contentSha256: input.contentSha256,
        sections: input.sections,
      }),
    },
  );

  const status = await requestJson<{ job?: { stage?: unknown } }>(
    `${baseUrl}/v1/jobs/${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: { "x-zobdino-session": session.token },
    },
  );

  return {
    ...receipt,
    jobId,
    stage: String(status.job?.stage ?? receipt.stage),
  };
}
