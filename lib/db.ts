// lib/db.ts
import Database from 'better-sqlite3';
import path from 'path';

let db: Database.Database;

export function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'gym.db');
    db = new Database(dbPath);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

