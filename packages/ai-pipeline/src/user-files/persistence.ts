import type {
  UserFileJobManifest,
} from "./contracts.ts";

export interface UserFileJobStore {
  create(job: UserFileJobManifest): Promise<void>;
  get(jobId: string): Promise<UserFileJobManifest | null>;
  save(job: UserFileJobManifest): Promise<void>;
}

export class MemoryUserFileJobStore
  implements UserFileJobStore
{
  private readonly jobs =
    new Map<string, UserFileJobManifest>();

  async create(job: UserFileJobManifest) {
    if (this.jobs.has(job.jobId)) {
      throw new Error(
        `Job already exists: ${job.jobId}`,
      );
    }

    this.jobs.set(
      job.jobId,
      structuredClone(job),
    );
  }

  async get(jobId: string) {
    const job = this.jobs.get(jobId);

    return job
      ? structuredClone(job)
      : null;
  }

  async save(job: UserFileJobManifest) {
    if (!this.jobs.has(job.jobId)) {
      throw new Error(
        `Unknown job: ${job.jobId}`,
      );
    }

    this.jobs.set(
      job.jobId,
      structuredClone(job),
    );
  }
}
