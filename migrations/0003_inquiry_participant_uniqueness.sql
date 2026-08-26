CREATE UNIQUE INDEX IF NOT EXISTS idx_inquiry_participants_unique
  ON inquiry_participants(inquiry_no, user_id);
