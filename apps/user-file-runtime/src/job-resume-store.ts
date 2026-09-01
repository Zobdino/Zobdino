import type { RuntimeEnv } from "./types.ts";

export class JobResumeStore {
  private readonly db: RuntimeEnv["ZOBDINO_DB"];

  constructor(db: RuntimeEnv["ZOBDINO_DB"]) {
    this.db = db;
  }

  async bind(jobId: string, tokenSha256: string, createdAt: string) {
    await this.db
      .prepare(`
        INSERT INTO user_file_resume_tokens (
          job_id,
          token_sha256,
          created_at,
          last_used_at
        )
        VALUES (?, ?, ?, NULL)
        ON CONFLICT(job_id) DO UPDATE SET
          token_sha256 = excluded.token_sha256,
          created_at = excluded.created_at,
          last_used_at = NULL
      `)
      .bind(jobId, tokenSha256, createdAt)
      .run();
  }

  async jobIdForToken(tokenSha256: string): Promise<string | null> {
    const row = await this.db
      .prepare(`
        SELECT job_id
        FROM user_file_resume_tokens
        WHERE token_sha256 = ?
      `)
      .bind(tokenSha256)
      .first<{ job_id: string }>();

    return row?.job_id ? String(row.job_id) : null;
  }

  async touch(jobId: string, usedAt: string) {
    await this.db
      .prepare(`
        UPDATE user_file_resume_tokens
        SET last_used_at = ?
        WHERE job_id = ?
      `)
      .bind(usedAt, jobId)
      .run();
  }

  async revoke(jobId: string) {
    await this.db
      .prepare(`
        DELETE FROM user_file_resume_tokens
        WHERE job_id = ?
      `)
      .bind(jobId)
      .run();
  }
}
