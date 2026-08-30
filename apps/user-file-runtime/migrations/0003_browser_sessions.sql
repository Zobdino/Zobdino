CREATE TABLE IF NOT EXISTS browser_ingestion_sessions (
  id TEXT PRIMARY KEY,
  token_sha256 TEXT NOT NULL UNIQUE,
  origin TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  revoked_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_browser_sessions_expiry
ON browser_ingestion_sessions (expires_at);

CREATE INDEX IF NOT EXISTS idx_browser_sessions_origin
ON browser_ingestion_sessions (origin, created_at DESC);
