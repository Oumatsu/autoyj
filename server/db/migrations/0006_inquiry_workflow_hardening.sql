ALTER TABLE inquiries ADD COLUMN vehicle_snapshot_json TEXT NOT NULL DEFAULT '';
ALTER TABLE inquiry_status_history ADD COLUMN reason TEXT NOT NULL DEFAULT '';
