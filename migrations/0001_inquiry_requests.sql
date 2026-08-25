CREATE TABLE IF NOT EXISTS inquiry_requests (
  id TEXT PRIMARY KEY,
  inquiry_no TEXT NOT NULL REFERENCES inquiries(inquiry_no),
  requester_user_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  vehicle_label TEXT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  fob_unit_usd REAL NOT NULL,
  fob_total_usd REAL NOT NULL,
  contact_name TEXT NOT NULL,
  company TEXT NOT NULL DEFAULT '',
  country TEXT NOT NULL,
  email TEXT NOT NULL,
  phone_prefix TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  requirements TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_inquiry_requests_topic_created
  ON inquiry_requests(inquiry_no, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_inquiry_requests_requester_topic
  ON inquiry_requests(requester_user_id, inquiry_no);
