CREATE TABLE IF NOT EXISTS user_file_content (
  job_id TEXT NOT NULL,
  section_index INTEGER NOT NULL,
  source_ref TEXT NOT NULL,
  text_content TEXT NOT NULL,
  content_sha256 TEXT NOT NULL,
  PRIMARY KEY (
    job_id,
    section_index
  ),
  FOREIGN KEY (job_id)
    REFERENCES user_file_jobs(id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS
  idx_user_file_content_job
ON user_file_content (
  job_id,
  section_index
);
