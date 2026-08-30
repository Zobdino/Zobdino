import {
  allowedBrowserOrigin,
  newBrowserSession,
  randomSessionToken,
  SESSION_REQUEST_LIMIT,
  sha256Hex,
} from "./browser-session.ts";
import { BrowserSessionStore } from "./browser-session-store.ts";
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
  for (const [key, value] of Object.entries(corsHeaders(origin))) {
    headers.set(key, value);
  }
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
        return json(
          {
            error: "session-issuance-limit",
            retryAfterSeconds: Math.ceil(SESSION_ISSUANCE_WINDOW_MS / 1000),
          },
          429,
          allowedOrigin,
        );
      }

      const token = randomSessionToken();
      const session = newBrowserSession(allowedOrigin, await sha256Hex(token), now);
      await sessions.create(session);
      return json(
        {
          token,
          expiresAt: session.expiresAt,
          requestLimit: SESSION_REQUEST_LIMIT,
        },
        201,
        allowedOrigin,
      );
    }

    const token = request.headers.get("x-zobdino-session")?.trim() ?? "";
    if (!/^[a-f0-9]{64}$/.test(token)) {
      return json({ error: "invalid-session" }, 401, allowedOrigin);
    }

    const session = await sessions.findByTokenHash(await sha256Hex(token));
    if (!session) {
      return json({ error: "expired-or-invalid-session" }, 401, allowedOrigin);
    }

    const consumed = await sessions.consumeIfUsable(
      session.id,
      allowedOrigin,
      new Date().toISOString(),
      SESSION_REQUEST_LIMIT,
    );
    if (!consumed) {
      return json({ error: "expired-or-invalid-session" }, 401, allowedOrigin);
    }

    const ownerId = "browser:" + session.id;

    if (request.method === "POST" && url.pathname === "/v1/jobs") {
      const body = await request.json() as Record<string, unknown>;
      const response = await trustedFetch(
        request,
        env,
        JSON.stringify({ ...body, ownerId }),
      );
      return withCors(response, allowedOrigin);
    }

    const contentMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)\/content$/);
    const statusMatch = url.pathname.match(/^\/v1\/jobs\/([^/]+)$/);
    const jobId = contentMatch?.[1] ?? statusMatch?.[1];
    if (jobId) {
      const denied = await verifyOwnership(request, env, jobId, ownerId);
      if (denied) return withCors(denied, allowedOrigin);
      const body = request.method === "GET" ? undefined : await request.text();
      return withCors(await trustedFetch(request, env, body), allowedOrigin);
    }

    return json({ error: "not-found" }, 404, allowedOrigin);
  },
};

export default worker;
