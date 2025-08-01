// lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'gym.db');
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
    // Ensure classes table exists
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

