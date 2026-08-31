import {
  createUserFileJob,
  orchestrateNormalizedUserFile,
  resolveExtractionStrategy,
  transitionJob,
} from "../../../packages/ai-pipeline/src/user-files/index.ts";

import type {
  UserFileFormat,
  UserFileMode,
  UserFileVoice,
} from "../../../packages/ai-pipeline/src/user-files/contracts.ts";

import { D1JobStore } from "./d1-store.ts";
import type { RuntimeEnv } from "./types.ts";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

function authorized(request: Request, env: RuntimeEnv) {
  return Boolean(
    env.ZOBDINO_UPLOAD_TOKEN &&
    request.headers.get("authorization") === `Bearer ${env.ZOBDINO_UPLOAD_TOKEN}`,
  );
}

function validFormat(value: unknown): value is UserFileFormat {
  return ["pdf", "epub", "txt", "markdown"].includes(String(value));
}

function validMode(value: unknown): value is UserFileMode {
  return ["full-audio", "summary-podcast", "both"].includes(String(value));
}

function validVoice(value: unknown): value is UserFileVoice {
  return ["sulafat", "schedar"].includes(String(value));
}

async function sha256Text(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function createJob(request: Request, env: RuntimeEnv) {
  const body = await request.json() as Record<string, unknown>;

  if (!validFormat(body.format) || !validMode(body.mode) || !validVoice(body.voice)) {
    return json({ error: "invalid-request" }, 400);
  }

  const ownerId = String(body.ownerId ?? "").trim();
  const fileName = String(body.fileName ?? "").trim();
  const sizeBytes = Number(body.sizeBytes ?? 0);
  const sha256 = String(body.sha256 ?? "").trim().toLowerCase();

  if (!ownerId || !fileName) {
    return json({ error: "missing-identity-or-filename" }, 400);
  }
  if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) {
    return json({ error: "invalid-file-size" }, 400);
  }
  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    return json({ error: "invalid-sha256" }, 400);
  }

  const job = createUserFileJob({
    ownerId,
    mode: body.mode,
    voice: body.voice,
    source: {
      fileName,
      format: body.format,
      mimeType: body.mimeType ? String(body.mimeType) : undefined,
      sizeBytes,
      sha256,
      rightsConfirmed: body.rightsConfirmed === true,
    },
  });

  const store = new D1JobStore(env.ZOBDINO_DB);
  await store.create(job);

  return json({
    job,
    ingestion: {
      method: "POST",
      path: `/v1/jobs/${job.jobId}/content`,
      model: "client-extracted-text",
    },
    extractionStrategy: resolveExtractionStrategy(job.source.format),
  }, 201);
}

async function ingestContent(request: Request, env: RuntimeEnv, jobId: string) {
  const store = new D1JobStore(env.ZOBDINO_DB);
  let job = await store.get(jobId);

  if (!job) return json({ error: "job-not-found" }, 404);
  if (job.stage !== "received") {
    return json({ error: "invalid-stage", stage: job.stage }, 409);
  }

  const body = await request.json() as { contentSha256?: unknown; sections?: unknown };
  if (!Array.isArray(body.sections)) return json({ error: "sections-required" }, 400);
  if (body.sections.length === 0 || body.sections.length > 128) {
    return json({ error: "invalid-section-count" }, 400);
  }

  const sections = body.sections.map((raw, index) => {
    const item = raw as Record<string, unknown>;
    return {
      sectionIndex: Number(item.sectionIndex ?? index),
      sourceRef: String(item.sourceRef ?? `section:${index + 1}`),
      text: String(item.text ?? "").trim(),
    };
  });

  if (sections.some((section) =>
    !Number.isSafeInteger(section.sectionIndex) ||
    section.sectionIndex < 0 ||
    !section.text ||
    section.text.length > 24000
  )) {
    return json({ error: "invalid-section" }, 400);
  }

  const characterCount = sections.reduce((sum, section) => sum + section.text.length, 0);
  if (characterCount <= 0 || characterCount > 1000000) {
    return json({ error: "content-size-limit" }, 413);
  }

  const canonicalText = sections
    .sort((a, b) => a.sectionIndex - b.sectionIndex)
    .map((section) => `${section.sectionIndex}:${section.sourceRef}\n${section.text}`)
    .join("\n\n");
  const actualSha256 = await sha256Text(canonicalText);
  const expectedSha256 = String(body.contentSha256 ?? "").trim().toLowerCase();

  if (expectedSha256 && expectedSha256 !== actualSha256) {
    return json({ error: "content-sha256-mismatch" }, 400);
  }

  job = transitionJob(job, "validating");
  await store.save(job);
  job = transitionJob(job, "extracting");
  await store.save(job);
  await store.replaceContent(job.jobId, sections, actualSha256);
  job = transitionJob(job, "normalizing");
  await store.save(job);

  return json({
    jobId: job.jobId,
    stage: job.stage,
    storage: "d1-text-content",
    sectionCount: sections.length,
    characterCount,
    contentSha256: actualSha256,
  });
}

async function advanceJob(env: RuntimeEnv, jobId: string) {
  const store = new D1JobStore(env.ZOBDINO_DB);
  const job = await store.get(jobId);
  if (!job) return json({ error: "job-not-found" }, 404);

  if (job.stage !== "normalizing") {
    const alreadyPlanned = job.checkpoints.some(
      (checkpoint) => checkpoint.stage === "planning" && checkpoint.digest === "user-file-output-plan:v1",
    );
    if (!alreadyPlanned) {
      return json({ error: "invalid-stage", stage: job.stage }, 409);
    }
  }

  const advanced = orchestrateNormalizedUserFile(job);
  await store.save(advanced);
  return json({
    job: advanced,
    orchestration: {
      externalProviderCalls: false,
      nextStage: advanced.stage,
      plannedAssetCount: advanced.assets.length,
    },
  });
}

const worker = {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({
        ok: true,
        service: "zobdino-user-file-runtime",
        storage: "d1-only",
        r2: false,
      });
    }

    if (!authorized(request, env)) return json({ error: "unauthorized" }, 401);

    if (request.method === "POST" && url.pathname === "/v1/jobs") {
      return createJob(request, env);
    }

    const contentMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)\/content$/);
    if (request.method === "POST" && contentMatch?.[1]) {
      return ingestContent(request, env, contentMatch[1]);
    }

    const advanceMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)\/advance$/);
    if (request.method === "POST" && advanceMatch?.[1]) {
      return advanceJob(env, advanceMatch[1]);
    }

    const jobMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)$/);
    if (request.method === "GET" && jobMatch?.[1]) {
      const store = new D1JobStore(env.ZOBDINO_DB);
      const job = await store.get(jobMatch[1]);
      if (!job) return json({ error: "job-not-found" }, 404);
      const content = await store.contentSummary(job.jobId);
      return json({ job, content });
    }

    return json({ error: "not-found" }, 404);
  },
};

export default worker;
