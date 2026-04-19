import type { ExecutionRecord, FormState, SavedActivity } from "../types";
import { getDb } from "./db";

type FavoriteRow = {
  id: string;
  title: string;
  category: string;
  duration: string;
  goal: string;
  materials: string;
  steps: string;
  difficulty_adjustments: string;
  safety_notes: string;
  talking_points: string;
  day_label: string | null;
  saved_at: string;
};

type PresetRow = {
  id: string;
  name: string;
  form: string;
  created_at: string;
};

type RecordRow = {
  id: string;
  activity_title: string;
  activity_category: string;
  date: string;
  participants: number;
  reaction: string;
  note: string;
  created_at: string;
};

export type PresetRecord = {
  id: string;
  name: string;
  form: FormState;
  createdAt: string;
};

function rowToFavorite(row: FavoriteRow): SavedActivity {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    duration: row.duration,
    goal: row.goal,
    materials: JSON.parse(row.materials),
    steps: JSON.parse(row.steps),
    difficulty_adjustments: JSON.parse(row.difficulty_adjustments),
    safety_notes: JSON.parse(row.safety_notes),
    talking_points: JSON.parse(row.talking_points),
    day_label: row.day_label ?? undefined,
    savedAt: row.saved_at,
  };
}

function rowToPreset(row: PresetRow): PresetRecord {
  return {
    id: row.id,
    name: row.name,
    form: JSON.parse(row.form),
    createdAt: row.created_at,
  };
}

function rowToRecord(row: RecordRow): ExecutionRecord {
  return {
    id: row.id,
    activityTitle: row.activity_title,
    activityCategory: row.activity_category,
    date: row.date,
    participants: row.participants,
    reaction: row.reaction as ExecutionRecord["reaction"],
    note: row.note,
    createdAt: row.created_at,
  };
}

export const favoritesRepo = {
  list(): SavedActivity[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM favorites ORDER BY saved_at DESC")
      .all() as FavoriteRow[];
    return rows.map(rowToFavorite);
  },
  insert(fav: SavedActivity): void {
    const db = getDb();
    db.prepare(
      `INSERT OR IGNORE INTO favorites
        (id, title, category, duration, goal, materials, steps, difficulty_adjustments, safety_notes, talking_points, day_label, saved_at)
       VALUES (@id, @title, @category, @duration, @goal, @materials, @steps, @difficulty, @safety, @talking, @day_label, @saved_at)`,
    ).run({
      id: fav.id,
      title: fav.title,
      category: fav.category,
      duration: fav.duration,
      goal: fav.goal,
      materials: JSON.stringify(fav.materials),
      steps: JSON.stringify(fav.steps),
      difficulty: JSON.stringify(fav.difficulty_adjustments),
      safety: JSON.stringify(fav.safety_notes),
      talking: JSON.stringify(fav.talking_points),
      day_label: fav.day_label ?? null,
      saved_at: fav.savedAt,
    });
  },
  existsByTitle(title: string): boolean {
    const db = getDb();
    const row = db
      .prepare("SELECT 1 FROM favorites WHERE title = ? LIMIT 1")
      .get(title);
    return !!row;
  },
  delete(id: string): void {
    const db = getDb();
    db.prepare("DELETE FROM favorites WHERE id = ?").run(id);
  },
};

export const presetsRepo = {
  list(): PresetRecord[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM presets ORDER BY created_at DESC")
      .all() as PresetRow[];
    return rows.map(rowToPreset);
  },
  insert(preset: PresetRecord): void {
    const db = getDb();
    db.prepare(
      `INSERT OR IGNORE INTO presets (id, name, form, created_at)
       VALUES (?, ?, ?, ?)`,
    ).run(preset.id, preset.name, JSON.stringify(preset.form), preset.createdAt);
  },
  delete(id: string): void {
    const db = getDb();
    db.prepare("DELETE FROM presets WHERE id = ?").run(id);
  },
};

export const recordsRepo = {
  list(): ExecutionRecord[] {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM records ORDER BY date DESC, created_at DESC")
      .all() as RecordRow[];
    return rows.map(rowToRecord);
  },
  insert(rec: ExecutionRecord): void {
    const db = getDb();
    db.prepare(
      `INSERT OR IGNORE INTO records
        (id, activity_title, activity_category, date, participants, reaction, note, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      rec.id,
      rec.activityTitle,
      rec.activityCategory,
      rec.date,
      rec.participants,
      rec.reaction,
      rec.note,
      rec.createdAt,
    );
  },
  delete(id: string): void {
    const db = getDb();
    db.prepare("DELETE FROM records WHERE id = ?").run(id);
  },
};
