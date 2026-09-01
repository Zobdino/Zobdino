export type UserFileMode =
  | "full-audio"
  | "summary-podcast"
  | "both";

export type UserFilePrivacy =
  | "private"
  | "publication-approved";

export type UserFileVoice =
  | "sulafat"
  | "schedar";

export type UserFileStage =
  | "received"
  | "validating"
  | "extracting"
  | "normalizing"
  | "indexing"
  | "planning"
  | "full-audio"
  | "summarizing"
  | "summary-audio"
  | "quality-check"
  | "quota-paused"
  | "ready"
  | "failed";

export type UserFileFormat =
  | "pdf"
  | "epub"
  | "txt"
  | "markdown"
  | "docx";

export interface UserFileSource {
  fileName: string;
  format: UserFileFormat;
  mimeType?: string;
  sizeBytes: number;
  sha256: string;
  rightsConfirmed: boolean;
}

export interface SourceReference {
  segmentId: string;
  chapterId?: string;
  startOffset: number;
  endOffset: number;
  sourceSha256: string;
}

export interface AudioSegmentReceipt {
  id: string;
  index: number;
  startOffset: number;
  endOffset: number;
  status: "verified";
  uri: string;
  sha256: string;
  bytes: number;
  durationMs: number;
  mimeType: "audio/mpeg" | "audio/wav";
  provenance: {
    provider: string;
    model: string;
    providerVoice: string;
    adapterVersion: string;
  };
}

export interface GeneratedAsset {
  id: string;
  kind:
    | "full-audio"
    | "summary-audio"
    | "transcript"
    | "chapter-map"
    | "summary";
  status:
    | "planned"
    | "processing"
    | "verified"
    | "failed";
  uri?: string;
  sha256?: string;
  bytes?: number;
  text?: string;
  provenance?: {
    provider: string;
    model: string;
  };
  audioSegments?: AudioSegmentReceipt[];
}

export interface QuotaPause {
  provider: string;
  operation: string;
  pausedAt: string;
  retryAfterSeconds?: number;
  resetAt?: string;
  resumeStage: Exclude<
    UserFileStage,
    "quota-paused" | "ready" | "failed"
  >;
}

export interface UserFileJobManifest {
  schemaVersion: "1.0";
  jobId: string;
  ownerId: string;
  privacy: UserFilePrivacy;
  mode: UserFileMode;
  voice: UserFileVoice;
  source: UserFileSource;
  stage: UserFileStage;
  createdAt: string;
  updatedAt: string;

  checkpoints: Array<{
    stage: UserFileStage;
    completedAt: string;
    digest?: string;
  }>;

  provenance: SourceReference[];
  assets: GeneratedAsset[];

  quotaPause?: QuotaPause;
  failure?: {
    code: string;
    message: string;
    failedAt: string;
  };
}
