-- Normalized shoppable-video schema.
-- Prices are stored as integer rupees.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS videos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL,
  video_url TEXT NOT NULL,
  title TEXT NOT NULL,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS engagement_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  video_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'click', 'add_to_cart')),
  timestamp TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_videos_product_id ON videos(product_id);
CREATE INDEX IF NOT EXISTS idx_events_video_id ON engagement_events(video_id);
CREATE INDEX IF NOT EXISTS idx_events_video_type ON engagement_events(video_id, event_type);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON engagement_events(timestamp);
