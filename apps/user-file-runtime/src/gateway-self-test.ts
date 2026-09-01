import assert from "node:assert/strict";

import { SESSION_REQUEST_LIMIT, sha256Hex } from "./browser-session.ts";
import type { RuntimeEnv } from "./types.ts";
import worker from "./worker.ts";

interface SessionRow {
  id: string;
  token_sha256: string;
  origin: string;
  created_at: string;
  expires_at: string;
  request_count: number;
  revoked_at: string | null;
}
interface JobRow { manifest_json: string; }
interface ContentRow { jobId: string; sectionIndex: number; sourceRef: string; text: string; }

class MemoryDb {
  private sessions = new Map<string, SessionRow>();
  private jobs = new Map<string, JobRow>();
  private content: ContentRow[] = [];

  prepare(sql: string) {
    const normalized = sql.replace(/\s+/g, " ").trim();
    return {
      bind: (...values: unknown[]) => ({
        run: async () => this.run(normalized, values),
        first: async <T>() => this.first(normalized, values) as T | null,
      }),
    };
  }

  async expireToken(token: string) {
    const hash = await sha256Hex(token);
    const row = this.sessions.get(hash);
    if (row) row.expires_at = "2000-01-01T00:00:00.000Z";
  }
  async exhaustToken(token: string) {
    const hash = await sha256Hex(token);
    const row = this.sessions.get(hash);
    if (row) row.request_count = SESSION_REQUEST_LIMIT;
  }

  private run(sql: string, values: unknown[]) {
    if (sql.startsWith("INSERT INTO browser_ingestion_sessions")) {
      const row: SessionRow = {
        id: String(values[0]), token_sha256: String(values[1]), origin: String(values[2]),
        created_at: String(values[3]), expires_at: String(values[4]), request_count: Number(values[5]),
        revoked_at: values[6] === null ? null : String(values[6]),
      };
      this.sessions.set(row.token_sha256, row);
      return { meta: { changes: 1 } };
    }
    if (sql.startsWith("UPDATE browser_ingestion_sessions SET request_count")) {
      const [id, origin, nowIso, requestLimit] = values;
      const row = [...this.sessions.values()].find((candidate) => candidate.id === String(id));
      const usable = Boolean(row && row.origin === String(origin) && row.revoked_at === null &&
        row.expires_at > String(nowIso) && row.request_count < Number(requestLimit));
      if (row && usable) row.request_count += 1;
      return { meta: { changes: usable ? 1 : 0 } };
    }
    if (sql.startsWith("INSERT INTO user_file_jobs")) {
      this.jobs.set(String(values[0]), { manifest_json: String(values[3]) });
      return { meta: { changes: 1 } };
    }
    if (sql.startsWith("UPDATE user_file_jobs SET")) {
      const jobId = String(values[3]);
      if (this.jobs.has(jobId)) this.jobs.set(jobId, { manifest_json: String(values[1]) });
      return { meta: { changes: this.jobs.has(jobId) ? 1 : 0 } };
    }
    if (sql.startsWith("DELETE FROM user_file_content")) {
      const jobId = String(values[0]);
      this.content = this.content.filter((item) => item.jobId !== jobId);
      return { meta: { changes: 1 } };
    }
    if (sql.startsWith("INSERT INTO user_file_content")) {
      this.content.push({
        jobId: String(values[0]),
        sectionIndex: Number(values[1]),
        sourceRef: String(values[2]),
        text: String(values[3]),
      });
      return { meta: { changes: 1 } };
    }
    throw new Error(`Unhandled D1 run query: ${sql}`);
  }

  private first(sql: string, values: unknown[]): unknown {
    if (sql.startsWith("SELECT COUNT(*) AS count FROM browser_ingestion_sessions")) {
      const origin = String(values[0]);
      const createdSince = String(values[1]);
      return { count: [...this.sessions.values()].filter(
        (row) => row.origin === origin && row.created_at >= createdSince,
      ).length };
    }
    if (sql.includes("FROM browser_ingestion_sessions WHERE token_sha256 = ?")) {
      return this.sessions.get(String(values[0])) ?? null;
    }
    if (sql.includes("SELECT manifest_json FROM user_file_jobs WHERE id = ?")) {
      return this.jobs.get(String(values[0])) ?? null;
    }
    if (sql.includes("section_index, source_ref, text_content") && sql.includes("section_index = ?")) {
      const row = this.content.find(
        (item) => item.jobId === String(values[0]) && item.sectionIndex === Number(values[1]),
      );
      return row
        ? { section_index: row.sectionIndex, source_ref: row.sourceRef, text_content: row.text }
        : null;
    }
    if (sql.includes("FROM user_file_content WHERE job_id = ?")) {
      const rows = this.content.filter((item) => item.jobId === String(values[0]));
      return {
        section_count: rows.length,
        character_count: rows.reduce((sum, item) => sum + item.text.length, 0),
      };
    }
    throw new Error(`Unhandled D1 first query: ${sql}`);
  }
}

const origin = "https://preview.zobdino.ir";
const db = new MemoryDb();
const env: RuntimeEnv = {
  ZOBDINO_UPLOAD_TOKEN: "server-only-test-token",
  ZOBDINO_ALLOWED_ORIGINS: origin,
  ZOBDINO_GENERATION_MODE: "offline-test",
  ZOBDINO_DB: db,
};

async function call(path: string, options: {
  method?: string; token?: string; body?: unknown; origin?: string;
} = {}) {
  const headers = new Headers({ origin: options.origin ?? origin });
  if (options.token) headers.set("x-zobdino-session", options.token);
  if (options.body !== undefined) headers.set("content-type", "application/json");
  return worker.fetch(new Request(`https://runtime.test${path}`, {
    method: options.method ?? "GET", headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  }), env);
}

async function trustedCall(path: string, method = "POST") {
  return worker.fetch(new Request(`https://runtime.test${path}`, {
    method,
    headers: { authorization: `Bearer ${env.ZOBDINO_UPLOAD_TOKEN}` },
  }), env);
}

async function issueSession() {
  const response = await call("/v1/browser-sessions", { method: "POST", body: {} });
  assert.equal(response.status, 201);
  const payload = await response.json() as { token: string };
  assert.match(payload.token, /^[a-f0-9]{64}$/);
  return payload.token;
}

const invalidOrigin = await call("/v1/browser-sessions", {
  method: "POST", body: {}, origin: "https://evil.example",
});
assert.equal(invalidOrigin.status, 403);

const token = await issueSession();
const createResponse = await call("/v1/jobs", {
  method: "POST", token,
  body: {
    fileName: "gateway-test.txt", format: "txt", mimeType: "text/plain", sizeBytes: 12,
    sha256: "a".repeat(64), mode: "both", voice: "sulafat", rightsConfirmed: true,
  },
});
assert.equal(createResponse.status, 201);
const created = await createResponse.json() as { job: { jobId: string } };
const jobId = created.job.jobId;

const longText = `${"سلام زبدینو. ".repeat(80)}پایان.`;
const sections = [{ sectionIndex: 0, sourceRef: "section:1", text: longText }];
const canonical = `0:section:1\n${longText}`;
const contentSha256 = await sha256Hex(canonical);
const contentResponse = await call(`/v1/jobs/${jobId}/content`, {
  method: "POST", token, body: { sections, contentSha256 },
});
assert.equal(contentResponse.status, 200);

const advanceResponse = await call(`/v1/jobs/${jobId}/advance`, {
  method: "POST", token, body: {},
});
assert.equal(advanceResponse.status, 200);
const advanced = await advanceResponse.json() as {
  job: { stage: string; assets: unknown[]; checkpoints: unknown[] };
  orchestration: { externalProviderCalls: boolean; nextStage: string };
};
assert.equal(advanced.job.stage, "full-audio");
assert.equal(advanced.job.assets.length, 5);
assert.equal(advanced.orchestration.externalProviderCalls, false);

const browserGenerate = await call(`/v1/jobs/${jobId}/generate`, {
  method: "POST", token, body: {},
});
assert.equal(browserGenerate.status, 404);
const browserFinalize = await call(`/v1/jobs/${jobId}/finalize`, {
  method: "POST", token, body: {},
});
assert.equal(browserFinalize.status, 404);

const fullAudioGeneration = await trustedCall(`/v1/jobs/${jobId}/generate`);
assert.equal(fullAudioGeneration.status, 200);
const fullAudioPayload = await fullAudioGeneration.json() as {
  job: {
    stage: string;
    assets: Array<{ kind: string; status: string; audioSegments?: Array<{ status: string }> }>;
    checkpoints: Array<{ digest?: string }>;
  };
  generation: { externalProviderCalls: boolean; engine?: string; segmentCount?: number };
};
assert.equal(fullAudioPayload.job.stage, "summarizing");
const fullAudioAsset = fullAudioPayload.job.assets.find((asset) => asset.kind === "full-audio");
assert.equal(fullAudioAsset?.status, "verified");
assert.ok((fullAudioAsset?.audioSegments?.length ?? 0) > 1);
assert.equal(fullAudioPayload.generation.engine, "canonical-audio-segments");
assert.equal(fullAudioPayload.generation.segmentCount, fullAudioAsset?.audioSegments?.length);
assert.ok(fullAudioAsset?.audioSegments?.every((segment) => segment.status === "verified"));
assert.ok(fullAudioPayload.job.checkpoints.filter((item) => item.digest?.startsWith("tts-segment:")).length > 1);
assert.equal(fullAudioPayload.generation.externalProviderCalls, false);

const summaryGeneration = await trustedCall(`/v1/jobs/${jobId}/generate`);
assert.equal(summaryGeneration.status, 200);
const summaryPayload = await summaryGeneration.json() as {
  job: { stage: string; assets: Array<{ kind: string; status: string }> };
};
assert.equal(summaryPayload.job.stage, "summary-audio");
assert.equal(
  summaryPayload.job.assets.find((asset) => asset.kind === "summary")?.status,
  "verified",
);

const prematureFinalize = await trustedCall(`/v1/jobs/${jobId}/finalize`);
assert.equal(prematureFinalize.status, 409);

const summaryAudioGeneration = await trustedCall(`/v1/jobs/${jobId}/generate`);
assert.equal(summaryAudioGeneration.status, 200);
const summaryAudioPayload = await summaryAudioGeneration.json() as {
  job: { stage: string; assets: Array<{ kind: string; status: string }> };
};
assert.equal(summaryAudioPayload.job.stage, "quality-check");
assert.equal(
  summaryAudioPayload.job.assets.find((asset) => asset.kind === "summary-audio")?.status,
  "verified",
);

const finalizeResponse = await trustedCall(`/v1/jobs/${jobId}/finalize`);
assert.equal(finalizeResponse.status, 200);
const finalizedPayload = await finalizeResponse.json() as {
  job: { stage: string; privacy: string; assets: Array<{ kind: string; status: string }> };
  finalization: { library: string; publicationApproved: boolean; ready: boolean };
};
assert.equal(finalizedPayload.job.stage, "ready");
assert.equal(finalizedPayload.job.privacy, "private");
assert.equal(finalizedPayload.finalization.library, "private");
assert.equal(finalizedPayload.finalization.publicationApproved, false);
assert.equal(finalizedPayload.finalization.ready, true);

const repeatedFinalize = await trustedCall(`/v1/jobs/${jobId}/finalize`);
assert.equal(repeatedFinalize.status, 200);
assert.equal((await repeatedFinalize.json() as { job: { stage: string } }).job.stage, "ready");

const statusResponse = await call(`/v1/jobs/${jobId}`, { token });
assert.equal(statusResponse.status, 200);
const statusPayload = await statusResponse.json() as {
  job: { ownerId: string; stage: string; assets: unknown[] };
  content: { section_count: number };
};
assert.match(statusPayload.job.ownerId, /^browser:/);
assert.equal(statusPayload.job.stage, "ready");
assert.equal(statusPayload.job.assets.length, 5);
assert.equal(statusPayload.content.section_count, 1);

const wrongToken = await issueSession();
const wrongSessionResponse = await call(`/v1/jobs/${jobId}/advance`, {
  method: "POST", token: wrongToken, body: {},
});
assert.equal(wrongSessionResponse.status, 404);

const mismatchCreate = await call("/v1/jobs", {
  method: "POST", token,
  body: {
    fileName: "mismatch.md", format: "markdown", sizeBytes: 10,
    sha256: "b".repeat(64), mode: "summary-podcast", voice: "schedar", rightsConfirmed: true,
  },
});
assert.equal(mismatchCreate.status, 201);
const mismatchJob = await mismatchCreate.json() as { job: { jobId: string } };
const mismatchResponse = await call(`/v1/jobs/${mismatchJob.job.jobId}/content`, {
  method: "POST", token, body: { sections, contentSha256: "c".repeat(64) },
});
assert.equal(mismatchResponse.status, 400);
assert.equal((await mismatchResponse.json() as { error: string }).error, "content-sha256-mismatch");

const expiredToken = await issueSession();
await db.expireToken(expiredToken);
const expiredResponse = await call("/v1/jobs/not-a-job", { token: expiredToken });
assert.equal(expiredResponse.status, 401);

const exhaustedToken = await issueSession();
await db.exhaustToken(exhaustedToken);
const exhaustedResponse = await call("/v1/jobs/not-a-job", { token: exhaustedToken });
assert.equal(exhaustedResponse.status, 401);

console.log("Browser gateway contract: PASS");
