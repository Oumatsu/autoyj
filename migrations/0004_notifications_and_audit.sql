-- Migration 0004: Notifications, PWA Subscriptions, and Delivery Audit Logs

CREATE TABLE IF NOT EXISTS user_push_subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_user_push_sub_user_id ON user_push_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS public_contact_submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);

CREATE TABLE IF NOT EXISTS notification_logs (
  id TEXT PRIMARY KEY,
  channel TEXT NOT NULL,
  recipient_user_id TEXT NOT NULL,
  inquiry_no TEXT,
  device_info TEXT NOT NULL DEFAULT '',
  destination TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL,
  http_status INTEGER,
  error_message TEXT,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_notification_logs_recipient ON notification_logs(recipient_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_inquiry ON notification_logs(inquiry_no, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON notification_logs(channel, created_at DESC);
