-- Update enrollments table with timestamps
ALTER TABLE enrollments ADD COLUMN created_at TEXT NOT NULL DEFAULT '2026-05-11T00:00:00Z';
ALTER TABLE enrollments ADD COLUMN updated_at TEXT NOT NULL DEFAULT '2026-05-11T00:00:00Z';
