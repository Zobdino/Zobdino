CREATE TABLE IF NOT EXISTS user_file_resume_tokens (
  job_id TEXT PRIMARY KEY,
  token_sha256 TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  last_used_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_user_file_resume_tokens_hash
ON user_file_resume_tokens (token_sha256);
