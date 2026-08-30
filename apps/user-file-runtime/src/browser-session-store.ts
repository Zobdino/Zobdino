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
  constructor(private readonly db: RuntimeEnv["ZOBDINO_DB"]) {}

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

  async consume(id: string) {
    await this.db.prepare(
      "UPDATE browser_ingestion_sessions SET request_count = request_count + 1 WHERE id = ?",
    ).bind(id).run();
  }
}
