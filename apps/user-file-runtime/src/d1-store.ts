import type {
  UserFileJobManifest,
} from "../../../packages/ai-pipeline/src/user-files/contracts.ts";

import type {
  RuntimeEnv,
} from "./types.ts";

export interface StoredContentSection {
  sectionIndex: number;
  sourceRef: string;
  text: string;
}

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

  async replaceContent(
    jobId: string,
    sections: StoredContentSection[],
    contentSha256: string,
  ) {
    await this.db
      .prepare(`
        DELETE FROM user_file_content
        WHERE job_id = ?
      `)
      .bind(jobId)
      .run();

    for (const section of sections) {
      await this.db
        .prepare(`
          INSERT INTO user_file_content (
            job_id,
            section_index,
            source_ref,
            text_content,
            content_sha256
          )
          VALUES (?, ?, ?, ?, ?)
        `)
        .bind(
          jobId,
          section.sectionIndex,
          section.sourceRef,
          section.text,
          contentSha256,
        )
        .run();
    }
  }

  async contentSummary(jobId: string) {
    return this.db
      .prepare(`
        SELECT
          COUNT(*) AS section_count,
          COALESCE(SUM(LENGTH(text_content)), 0)
            AS character_count
        FROM user_file_content
        WHERE job_id = ?
      `)
      .bind(jobId)
      .first<{
        section_count: number;
        character_count: number;
      }>();
  }
}
