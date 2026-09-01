import type { AudioSegmentStore } from "../../../packages/ai-pipeline/src/user-files/index.ts";
import type {
  VoiceProvider,
  VoiceRequest,
  VoiceResult,
} from "../../../packages/ai-pipeline/src/voice/contracts.ts";
import { GeminiVoiceProvider } from "../../../packages/ai-pipeline/src/voice/gemini.ts";

import {
  allowedBrowserOrigin,
  newBrowserSession,
  randomSessionToken,
  SESSION_REQUEST_LIMIT,
  sha256Hex,
} from "./browser-session.ts";
import { BrowserSessionStore } from "./browser-session-store.ts";
import { D1JobStore } from "./d1-store.ts";
import {
  geminiPersianSummaryProvider,
  offlinePersianSummaryProvider,
} from "./summary-provider.ts";
import {
  runVerifiedSummaryAudioStage,
  runVerifiedSummaryStage,
} from "./summary-runtime.ts";
import trustedWorker from "./trusted-worker.ts";
import type { RuntimeEnv } from "./types.ts";

const SESSION_ISSUANCE_WINDOW_MS = 5 * 60 * 1000;
const SESSION_ISSUANCE_LIMIT = 8;

function corsHeaders(origin: string) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type,x-zobdino-session",
    "access-control-max-age": "600",
    "vary": "Origin",
  };
}

function json(data: unknown, status: number, origin?: string) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...(origin ? corsHeaders(origin) : {}),
    },
  });
}

function withCors(response: Response, origin: string) {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeaders(origin))) headers.set(key, value);
  headers.set("cache-control", "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function trustedRequest(request: Request, env: RuntimeEnv, body?: string) {
  const headers = new Headers(request.headers);
  headers.set("authorization", "Bearer " + env.ZOBDINO_UPLOAD_TOKEN);
  headers.delete("x-zobdino-session");
  return new Request(request.url, { method: request.method, headers, body });
}

async function trustedFetch(request: Request, env: RuntimeEnv, body?: string) {
  return trustedWorker.fetch(trustedRequest(request, env, body), env);
}

async function verifyOwnership(
  request: Request,
  env: RuntimeEnv,
  jobId: string,
  ownerId: string,
) {
  const lookupUrl = new URL("/v1/jobs/" + encodeURIComponent(jobId), request.url);
  const lookup = new Request(lookupUrl, { method: "GET", headers: request.headers });
  const response = await trustedFetch(lookup, env);
  if (!response.ok) return response;
  const payload = await response.json() as { job?: { ownerId?: unknown } };
  if (String(payload.job?.ownerId ?? "") !== ownerId) {
    return json({ error: "job-not-found" }, 404);
  }
  return null;
}

async function sha256Bytes(value: Uint8Array) {
  const normalized = Uint8Array.from(value);
  const digest = await crypto.subtle.digest("SHA-256", normalized.buffer);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function offlineCanonicalVoiceProvider(): VoiceProvider {
  return {
    id: "offline-canonical-voice",
    async synthesize(request: VoiceRequest): Promise<VoiceResult> {
      const audio = new TextEncoder().encode(
        `offline-audio:${request.chapterId}:${request.voiceId}:${request.text}`,
      );
      return {
        audio,
        mimeType: "audio/wav",
        durationMs: Math.max(100, request.text.length * 20),
        sha256: await sha256Bytes(audio),
        provenance: {
          provider: "offline-canonical-voice",
          model: "deterministic-ci-v1",
          providerVoice: request.voiceId,
          adapterVersion: "user-file-runtime-ci-v1",
        },
        retryCount: 0,
      };
    },
  };
}

function browserAudioStore(env: RuntimeEnv): AudioSegmentStore {
  if (env.ZOBDINO_GENERATION_MODE === "offline-test") {
    return {
      async put(input) {
        const extension = input.mimeType === "audio/wav" ? "wav" : "mp3";
        return `internal://offline-test/audio/${encodeURIComponent(input.jobId)}/${encodeURIComponent(input.segmentId)}.${extension}`;
      },
    };
  }

  if (!env.ZOBDINO_AUDIO_BUCKET) throw new Error("audio-store-not-configured");
  return {
    async put(input) {
      const extension = input.mimeType === "audio/wav" ? "wav" : "mp3";
      const key = `private/user-files/${encodeURIComponent(input.jobId)}/${encodeURIComponent(input.assetId)}/${encodeURIComponent(input.segmentId)}.${extension}`;
      await env.ZOBDINO_AUDIO_BUCKET!.put(key, Uint8Array.from(input.audio), {
        httpMetadata: { contentType: input.mimeType },
        customMetadata: {
          sha256: input.sha256,
          visibility: "private",
          jobId: input.jobId,
          assetId: input.assetId,
          segmentId: input.segmentId,
        },
      });
      return `private-audio://${key}`;
    },
  };
}

function configuredSummaryProvider(env: RuntimeEnv) {
  if (env.ZOBDINO_GENERATION_MODE === "offline-test") {
    return offlinePersianSummaryProvider();
  }
  if (env.ZOBDINO_GENERATION_MODE === "gemini") {
    const apiKey = env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("gemini-api-key-not-configured");
    return geminiPersianSummaryProvider(apiKey);
  }
  throw new Error("summary-provider-not-configured");
}

function configuredSummaryAudioRuntime(env: RuntimeEnv): {
  provider: VoiceProvider;
  store: AudioSegmentStore;
  mode: "offline-test" | "gemini";
} {
  if (env.ZOBDINO_GENERATION_MODE === "offline-test") {
    return {
      provider: offlineCanonicalVoiceProvider(),
      store: browserAudioStore(env),
      mode: "offline-test",
    };
  }

  if (env.ZOBDINO_GENERATION_MODE === "gemini") {
    const apiKey = env.GEMINI_API_KEY?.trim();
    if (!apiKey) throw new Error("gemini-api-key-not-configured");
    if (!env.ZOBDINO_AUDIO_BUCKET) throw new Error("audio-store-not-configured");
    return {
      provider: new GeminiVoiceProvider({ apiKey }),
      store: browserAudioStore(env),
      mode: "gemini",
    };
  }

  throw new Error("generation-provider-not-configured");
}

async function generateBrowserSummaryStage(env: RuntimeEnv, jobId: string): Promise<Response | null> {
  const store = new D1JobStore(env.ZOBDINO_DB);
  const job = await store.get(jobId);
  if (!job) return json({ error: "job-not-found" }, 404);

  if (job.stage === "summarizing") {
    const sections = await store.content(job.jobId);
    const sourceText = sections.map((section) => section.text).join("\n\n").trim();
    if (!sourceText) return json({ error: "summary-source-content-missing" }, 409);

    let provider;
    try {
      provider = configuredSummaryProvider(env);
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : "summary-provider-not-configured",
      }, 503);
    }

    const generated = await runVerifiedSummaryStage({
      job,
      sourceText,
      provider,
      onCheckpoint: async (checkpointed) => store.save(checkpointed),
    });
    await store.save(generated);
    return json({
      job: generated,
      generation: {
        mode: env.ZOBDINO_GENERATION_MODE,
        engine: "verified-persian-summary",
        externalProviderCalls: env.ZOBDINO_GENERATION_MODE === "gemini",
        nextStage: generated.stage,
      },
    }, 200);
  }

  if (job.stage === "summary-audio") {
    let runtime: ReturnType<typeof configuredSummaryAudioRuntime>;
    try {
      runtime = configuredSummaryAudioRuntime(env);
    } catch (error) {
      return json({
        error: error instanceof Error ? error.message : "generation-provider-not-configured",
      }, 503);
    }

    const generated = await runVerifiedSummaryAudioStage({
      job,
      provider: runtime.provider,
      store: runtime.store,
      maxSegmentCharacters: runtime.mode === "offline-test" ? 400 : 1800,
      onCheckpoint: async (checkpointed) => store.save(checkpointed),
    });
    await store.save(generated);
    return json({
      job: generated,
      generation: {
        mode: runtime.mode,
        engine: "verified-summary-audio",
        externalProviderCalls: runtime.mode === "gemini",
        segmentCount: generated.assets.find((asset) => asset.kind === "summary-audio")
          ?.audioSegments?.length ?? 0,
        nextStage: generated.stage,
      },
    }, 200);
  }

  return null;
}

const worker = {
  async fetch(request: Request, env: RuntimeEnv): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("origin");

    if (request.method === "GET" && url.pathname === "/health") {
      return trustedWorker.fetch(request, env);
    }
    if (request.headers.get("authorization")) {
      return trustedWorker.fetch(request, env);
    }
    if (!allowedBrowserOrigin(origin, env.ZOBDINO_ALLOWED_ORIGINS)) {
      return json({ error: "origin-not-allowed" }, 403);
    }

    const allowedOrigin = origin as string;
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(allowedOrigin) });
    }

    const sessions = new BrowserSessionStore(env.ZOBDINO_DB);
    if (request.method === "POST" && url.pathname === "/v1/browser-sessions") {
      const now = new Date();
      const issuedSince = new Date(now.getTime() - SESSION_ISSUANCE_WINDOW_MS).toISOString();
      const recentSessions = await sessions.countIssuedSince(allowedOrigin, issuedSince);
      if (recentSessions >= SESSION_ISSUANCE_LIMIT) {
        return json({
          error: "session-issuance-limit",
          retryAfterSeconds: Math.ceil(SESSION_ISSUANCE_WINDOW_MS / 1000),
        }, 429, allowedOrigin);
      }

      const token = randomSessionToken();
      const session = newBrowserSession(allowedOrigin, await sha256Hex(token), now);
      await sessions.create(session);
      return json({
        token,
        expiresAt: session.expiresAt,
        requestLimit: SESSION_REQUEST_LIMIT,
      }, 201, allowedOrigin);
    }

    const token = request.headers.get("x-zobdino-session")?.trim() ?? "";
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return json({ error: "invalid-session" }, 401, allowedOrigin);
    }

    const session = await sessions.findByTokenHash(await sha256Hex(token));
    if (!session) return json({ error: "expired-or-invalid-session" }, 401, allowedOrigin);

    const consumed = await sessions.consumeIfUsable(
      session.id,
      allowedOrigin,
      new Date().toISOString(),
      SESSION_REQUEST_LIMIT,
    );
    if (!consumed) return json({ error: "expired-or-invalid-session" }, 401, allowedOrigin);

    const ownerId = "browser:" + session.id;

    if (request.method === "POST" && url.pathname === "/v1/jobs") {
      const body = await request.json() as Record<string, unknown>;
      const response = await trustedFetch(request, env, JSON.stringify({ ...body, ownerId }));
      return withCors(response, allowedOrigin);
    }

    const contentMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)\/content$/);
    const advanceMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)\/advance$/);
    const generateMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)\/generate$/);
    const finalizeMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)\/finalize$/);
    const statusMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)$/);
    const jobId = contentMatch?.[1]
      ?? advanceMatch?.[1]
      ?? generateMatch?.[1]
      ?? finalizeMatch?.[1]
      ?? statusMatch?.[1];

    if (jobId) {
      const denied = await verifyOwnership(request, env, jobId, ownerId);
      if (denied) return withCors(denied, allowedOrigin);

      if (request.method === "POST" && generateMatch?.[1]) {
        const generated = await generateBrowserSummaryStage(env, jobId);
        if (generated) return withCors(generated, allowedOrigin);
      }

      const body = request.method === "GET" ? undefined : await request.text();
      return withCors(await trustedFetch(request, env, body), allowedOrigin);
    }

    return json({ error: "not-found" }, 404, allowedOrigin);
  },
};

export default worker;
