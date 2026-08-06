-- Migration 0004: inquiry and follow-up visibility plus per-user read state.
-- Existing content remains private unless explicitly published later.
ALTER TABLE inquiries ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0;
ALTER TABLE inquiry_notes ADD COLUMN is_public INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS inquiry_reads (
  inquiry_no TEXT NOT NULL REFERENCES inquiries(inquiry_no),
  user_id TEXT NOT NULL,
  last_read_at TEXT NOT NULL,
  PRIMARY KEY (inquiry_no, user_id)
);

CREATE INDEX IF NOT EXISTS idx_inquiry_reads_user ON inquiry_reads(user_id, inquiry_no);
