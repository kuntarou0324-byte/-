import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

let instance: Database.Database | null = null;

function resolveDbPath(): string {
  const raw = process.env.DATABASE_PATH?.trim();
  return resolve(process.cwd(), raw && raw.length > 0 ? raw : "data/app.db");
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      duration TEXT NOT NULL,
      goal TEXT NOT NULL,
      materials TEXT NOT NULL,
      steps TEXT NOT NULL,
      difficulty_adjustments TEXT NOT NULL,
      safety_notes TEXT NOT NULL,
      talking_points TEXT NOT NULL,
      day_label TEXT,
      saved_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      form TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS records (
      id TEXT PRIMARY KEY,
      activity_title TEXT NOT NULL,
      activity_category TEXT NOT NULL,
      date TEXT NOT NULL,
      participants INTEGER NOT NULL,
      reaction TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_favorites_saved_at ON favorites(saved_at DESC);
    CREATE INDEX IF NOT EXISTS idx_records_date ON records(date DESC);
    CREATE INDEX IF NOT EXISTS idx_records_created_at ON records(created_at DESC);
  `);
}

export function getDb(): Database.Database {
  if (instance) return instance;
  const path = resolveDbPath();
  mkdirSync(dirname(path), { recursive: true });
  const db = new Database(path);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  migrate(db);
  instance = db;
  return db;
}
