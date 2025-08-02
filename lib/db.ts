// lib/db.ts
import Database from "better-sqlite3";
import path from "path";

let db: Database.Database;

// Create a single SQLite connection and ensure the classes table exists.
export function getDb() {
  if (!db) {
    const dbPath =
      process.env.DATABASE_URL || path.join(process.cwd(), "gym.db");
    db = new Database(dbPath);
    db.pragma("foreign_keys = ON");
    // Ensure classes table exists for schedule features
    db.exec(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        day TEXT NOT NULL,
        name TEXT NOT NULL,
        time TEXT NOT NULL,
        spots INTEGER DEFAULT 0,
        coach TEXT,
        color TEXT
      )
    `);
  }
  return db;
}

// Convenience helpers for queries to keep API routes tidy
export function query<T = any>(sql: string, params: any[] = []): T[] {
  return getDb().prepare(sql).all(...params);
}

export function run(sql: string, params: any[] = []) {
  return getDb().prepare(sql).run(...params);
}


