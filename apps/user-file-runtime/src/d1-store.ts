import type {
  UserFileJobManifest,
} from "../../../packages/ai-pipeline/src/user-files/contracts.ts";

import type {
  RuntimeEnv,
} from "./types.ts";

export class D1JobStore {
  constructor(
    private readonly db: RuntimeEnv["ZOBDINO_DB"],
  ) {}

  async create(job: UserFileJobManifest) {
    await this.db
      .prepare(`
        INSERT INTO user_file_jobs (
          id,
          owner_id,
          stage,
          manifest_json,
          created_at,
          updated_at
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `)
      .bind(
        job.jobId,
        job.ownerId,
        job.stage,
        JSON.stringify(job),
        job.createdAt,
        job.updatedAt,
      )
      .run();
  }

  async get(
    jobId: string,
  ): Promise<UserFileJobManifest | null> {
    const row = await this.db
      .prepare(`
        SELECT manifest_json
        FROM user_file_jobs
        WHERE id = ?
      `)
      .bind(jobId)
      .first<{ manifest_json: string }>();

    if (!row) {
      return null;
    }

    return JSON.parse(
      row.manifest_json,
    ) as UserFileJobManifest;
  }

  async save(job: UserFileJobManifest) {
    await this.db
      .prepare(`
        UPDATE user_file_jobs
        SET
          stage = ?,
          manifest_json = ?,
          updated_at = ?
        WHERE id = ?
      `)
      .bind(
        job.stage,
        JSON.stringify(job),
        job.updatedAt,
        job.jobId,
      )
      .run();
  }

  async setSourceKey(
    jobId: string,
    sourceKey: string,
  ) {
    await this.db
      .prepare(`
        UPDATE user_file_jobs
        SET source_key = ?
        WHERE id = ?
      `)
      .bind(
        sourceKey,
        jobId,
      )
      .run();
  }
}
