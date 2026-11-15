-- Skema D1 untuk TryOutku
-- Jalankan: bunx wrangler d1 execute tryoutku-db --remote --file=./schema.sql

CREATE TABLE IF NOT EXISTS attempts (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  player TEXT,
  kind TEXT NOT NULL,
  ref_id TEXT NOT NULL,
  ref_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  duration_sec INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  correct INTEGER NOT NULL,
  score INTEGER NOT NULL,
  per_subtest TEXT NOT NULL,
  answers TEXT NOT NULL,
  question_ids TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attempts_device ON attempts (device_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_rank ON attempts (ref_id, score DESC, duration_sec ASC);
