import {
  createUserFileJob,
  resolveExtractionStrategy,
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
        "cache-control": "no-store",
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

export default {
  async fetch(
    request: Request,
    env: RuntimeEnv,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (
      request.method === "GET" &&
      url.pathname === "/health"
    ) {
      return json({
        ok: true,
        service: "zobdino-user-file-runtime",
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

      const sha256 =
        String(body.sha256 ?? "");

      if (!/^[a-f0-9]{64}$/i.test(sha256)) {
        return json(
          { error: "invalid-sha256" },
          400,
        );
      }

      const job = createUserFileJob({
        ownerId: String(body.ownerId ?? ""),
        mode: body.mode,
        voice: body.voice,
        source: {
          fileName: String(body.fileName ?? ""),
          format: body.format,
          mimeType:
            body.mimeType
              ? String(body.mimeType)
              : undefined,
          sizeBytes:
            Number(body.sizeBytes ?? 0),
          sha256:
            sha256.toLowerCase(),
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
          uploadPath:
            `/v1/jobs/${job.jobId}/source`,
        },
        201,
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
        new D1JobStore(env.ZOBDINO_DB);

      const job =
        await store.get(jobMatch[1]);

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
