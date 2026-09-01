import type { BrowserSessionRecord } from "./browser-session.ts";
import type { RuntimeEnv } from "./types.ts";

interface SessionRow {
  id: string;
  token_sha256: string;
  origin: string;
  created_at: string;
  expires_at: string;
  request_count: number;
  revoked_at: string | null;
}

interface D1RunResult {
  meta?: {
    changes?: number;
  };
}

interface CountRow {
  count: number;
}

function toRecord(row: SessionRow): BrowserSessionRecord {
  return {
    id: row.id,
    tokenSha256: row.token_sha256,
    origin: row.origin,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    requestCount: row.request_count,
    revokedAt: row.revoked_at,
  };
}

export class BrowserSessionStore {
  private readonly db: RuntimeEnv["ZOBDINO_DB"];

  constructor(db: RuntimeEnv["ZOBDINO_DB"]) {
    this.db = db;
  }

  async create(session: BrowserSessionRecord) {
    await this.db.prepare(
      "INSERT INTO browser_ingestion_sessions (id, token_sha256, origin, created_at, expires_at, request_count, revoked_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ).bind(
      session.id, session.tokenSha256, session.origin, session.createdAt,
      session.expiresAt, session.requestCount, session.revokedAt,
    ).run();
  }

  async findByTokenHash(tokenSha256: string) {
    const row = await this.db.prepare(
      "SELECT id, token_sha256, origin, created_at, expires_at, request_count, revoked_at FROM browser_ingestion_sessions WHERE token_sha256 = ?",
    ).bind(tokenSha256).first<SessionRow>();
    return row ? toRecord(row) : null;
  }

  async countIssuedSince(origin: string, createdSince: string) {
    const row = await this.db.prepare(
      "SELECT COUNT(*) AS count FROM browser_ingestion_sessions WHERE origin = ? AND created_at >= ?",
    ).bind(origin, createdSince).first<CountRow>();
    return Number(row?.count ?? 0);
  }

  async consumeIfUsable(
    id: string,
    origin: string,
    nowIso: string,
    requestLimit: number,
  ) {
    const result = await this.db.prepare(
      "UPDATE browser_ingestion_sessions SET request_count = request_count + 1 WHERE id = ? AND origin = ? AND revoked_at IS NULL AND expires_at > ? AND request_count < ?",
    ).bind(id, origin, nowIso, requestLimit).run() as D1RunResult;

    return Number(result.meta?.changes ?? 0) === 1;
  }
}
