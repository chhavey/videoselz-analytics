import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = path.resolve(
  process.env.DATABASE_PATH || path.join(__dirname, '../../data/videoselz.db')
);

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

// WAL lets readers (analytics) proceed while a writer (event ingest) is in flight.
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');
db.pragma('busy_timeout = 3000');
