import {
  createUserFileJob,
  extractInlineText,
  resolveExtractionStrategy,
  transitionJob,
} from "../../../packages/ai-pipeline/src/user-files/index.ts";

import type {
  UserFileFormat,
  UserFileMode,
  UserFileVoice,
} from "../../../packages/ai-pipeline/src/user-files/contracts.ts";

import {
  D1JobStore,
} from "./d1-store.ts";

import type {
  RuntimeEnv,
} from "./types.ts";

function json(
  data: unknown,
  status = 200,
) {
  return new Response(
    JSON.stringify(data),
    {
      status,
      headers: {
        "content-type":
          "application/json; charset=utf-8",
        "cache-control":
          "no-store",
      },
    },
  );
}

function authorized(
  request: Request,
  env: RuntimeEnv,
) {
  return Boolean(
    env.ZOBDINO_UPLOAD_TOKEN &&
    request.headers.get("authorization") ===
      `Bearer ${env.ZOBDINO_UPLOAD_TOKEN}`,
  );
}

function validFormat(
  value: unknown,
): value is UserFileFormat {
  return [
    "pdf",
    "epub",
    "txt",
    "markdown",
  ].includes(String(value));
}

function validMode(
  value: unknown,
): value is UserFileMode {
  return [
    "full-audio",
    "summary-podcast",
    "both",
  ].includes(String(value));
}

function validVoice(
  value: unknown,
): value is UserFileVoice {
  return [
    "sulafat",
    "schedar",
  ].includes(String(value));
}

async function sha256Hex(
  bytes: ArrayBuffer,
) {
  const digest =
    await crypto.subtle.digest(
      "SHA-256",
      bytes,
    );

  return Array.from(
    new Uint8Array(digest),
  )
    .map((byte) =>
      byte.toString(16).padStart(2, "0"),
    )
    .join("");
}

async function createJob(
  request: Request,
  env: RuntimeEnv,
) {
  const body =
    await request.json() as Record<string, unknown>;

  if (
    !validFormat(body.format) ||
    !validMode(body.mode) ||
    !validVoice(body.voice)
  ) {
    return json(
      { error: "invalid-request" },
      400,
    );
  }

  const ownerId =
    String(body.ownerId ?? "").trim();

  const fileName =
    String(body.fileName ?? "").trim();

  const sizeBytes =
    Number(body.sizeBytes ?? 0);

  const sha256 =
    String(body.sha256 ?? "")
      .trim()
      .toLowerCase();

  if (!ownerId || !fileName) {
    return json(
      { error: "missing-identity-or-filename" },
      400,
    );
  }

  if (
    !Number.isSafeInteger(sizeBytes) ||
    sizeBytes <= 0 ||
    sizeBytes > 100 * 1024 * 1024
  ) {
    return json(
      { error: "invalid-file-size" },
      400,
    );
  }

  if (!/^[a-f0-9]{64}$/.test(sha256)) {
    return json(
      { error: "invalid-sha256" },
      400,
    );
  }

  const job = createUserFileJob({
    ownerId,
    mode: body.mode,
    voice: body.voice,
    source: {
      fileName,
      format: body.format,
      mimeType:
        body.mimeType
          ? String(body.mimeType)
          : undefined,
      sizeBytes,
      sha256,
      rightsConfirmed:
        body.rightsConfirmed === true,
    },
  });

  const store =
    new D1JobStore(env.ZOBDINO_DB);

  await store.create(job);

  return json(
    {
      job,
      extractionStrategy:
        resolveExtractionStrategy(
          job.source.format,
        ),
      upload: {
        method: "PUT",
        path:
          `/v1/jobs/${job.jobId}/source`,
      },
    },
    201,
  );
}

async function uploadSource(
  request: Request,
  env: RuntimeEnv,
  jobId: string,
) {
  const store =
    new D1JobStore(env.ZOBDINO_DB);

  let job =
    await store.get(jobId);

  if (!job) {
    return json(
      { error: "job-not-found" },
      404,
    );
  }

  if (job.stage !== "received") {
    return json(
      {
        error: "invalid-stage",
        stage: job.stage,
      },
      409,
    );
  }

  const payload =
    await request.arrayBuffer();

  if (
    payload.byteLength !==
    job.source.sizeBytes
  ) {
    return json(
      {
        error: "size-mismatch",
        expected: job.source.sizeBytes,
        actual: payload.byteLength,
      },
      400,
    );
  }

  const digest =
    await sha256Hex(payload);

  if (digest !== job.source.sha256) {
    return json(
      {
        error: "sha256-mismatch",
      },
      400,
    );
  }

  const sourceKey =
    `private/${job.ownerId}/${job.jobId}/source`;

  await env.ZOBDINO_UPLOADS.put(
    sourceKey,
    payload,
    {
      httpMetadata: {
        contentType:
          job.source.mimeType ??
          "application/octet-stream",
      },
      customMetadata: {
        ownerId: job.ownerId,
        jobId: job.jobId,
        sha256: digest,
      },
    },
  );

  await store.setSourceKey(
    job.jobId,
    sourceKey,
  );

  job = transitionJob(
    job,
    "validating",
  );

  await store.save(job);

  return json({
    jobId: job.jobId,
    stage: job.stage,
    sourceStored: true,
  });
}

async function extractSource(
  env: RuntimeEnv,
  jobId: string,
) {
  const store =
    new D1JobStore(env.ZOBDINO_DB);

  let job =
    await store.get(jobId);

  if (!job) {
    return json(
      { error: "job-not-found" },
      404,
    );
  }

  if (job.stage !== "validating") {
    return json(
      {
        error: "invalid-stage",
        stage: job.stage,
      },
      409,
    );
  }

  const strategy =
    resolveExtractionStrategy(
      job.source.format,
    );

  if (strategy !== "inline-text") {
    return json(
      {
        error:
          "dedicated-extractor-required",
        strategy,
      },
      409,
    );
  }

  const sourceKey =
    `private/${job.ownerId}/${job.jobId}/source`;

  const object =
    await env.ZOBDINO_UPLOADS.get(
      sourceKey,
    );

  if (!object) {
    return json(
      { error: "source-not-found" },
      404,
    );
  }

  job = transitionJob(
    job,
    "extracting",
  );

  await store.save(job);

  const bytes =
    new Uint8Array(
      await object.arrayBuffer(),
    );

  const extraction =
    extractInlineText(
      job.source,
      bytes,
    );

  const extractionKey =
    `private/${job.ownerId}/${job.jobId}/extraction.json`;

  await env.ZOBDINO_UPLOADS.put(
    extractionKey,
    new TextEncoder().encode(
      JSON.stringify(extraction),
    ),
    {
      httpMetadata: {
        contentType:
          "application/json; charset=utf-8",
      },
      customMetadata: {
        ownerId: job.ownerId,
        jobId: job.jobId,
      },
    },
  );

  job = transitionJob(
    job,
    "normalizing",
  );

  await store.save(job);

  return json({
    jobId: job.jobId,
    stage: job.stage,
    strategy,
    extraction: {
      sections:
        extraction.sections.length,
      characterCount:
        extraction.characterCount,
    },
  });
}

const worker = {
  async fetch(
    request: Request,
    env: RuntimeEnv,
  ): Promise<Response> {
    const url =
      new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname === "/health"
    ) {
      return json({
        ok: true,
        service:
          "zobdino-user-file-runtime",
      });
    }

    if (!authorized(request, env)) {
      return json(
        { error: "unauthorized" },
        401,
      );
    }

    if (
      request.method === "POST" &&
      url.pathname === "/v1/jobs"
    ) {
      return createJob(
        request,
        env,
      );
    }

    const sourceMatch =
      url.pathname.match(
        /^\/v1\/jobs\/([^/]+)\/source$/,
      );

    if (
      request.method === "PUT" &&
      sourceMatch?.[1]
    ) {
      return uploadSource(
        request,
        env,
        sourceMatch[1],
      );
    }

    const extractMatch =
      url.pathname.match(
        /^\/v1\/jobs\/([^/]+)\/extract$/,
      );

    if (
      request.method === "POST" &&
      extractMatch?.[1]
    ) {
      return extractSource(
        env,
        extractMatch[1],
      );
    }

    const jobMatch =
      url.pathname.match(
        /^\/v1\/jobs\/([^/]+)$/,
      );

    if (
      request.method === "GET" &&
      jobMatch?.[1]
    ) {
      const store =
        new D1JobStore(
          env.ZOBDINO_DB,
        );

      const job =
        await store.get(
          jobMatch[1],
        );

      if (!job) {
        return json(
          { error: "job-not-found" },
          404,
        );
      }

      return json({ job });
    }

    return json(
      { error: "not-found" },
      404,
    );
  },
};

export default worker;
