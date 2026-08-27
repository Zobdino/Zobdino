CREATE TABLE IF NOT EXISTS user_file_jobs (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  stage TEXT NOT NULL,
  manifest_json TEXT NOT NULL,
  source_key TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS
  idx_user_file_jobs_owner_updated
ON user_file_jobs (
  owner_id,
  updated_at DESC
);
