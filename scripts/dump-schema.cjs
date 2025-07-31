// scripts/dump-schema.cjs
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DATABASE_URL || './gym.db';
const OUT_SCHEMA = 'schema.sql';
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');
const INITIAL_MIGRATION = path.join(MIGRATIONS_DIR, '001_initial.sql');

if (!fs.existsSync(DB_PATH)) {
  console.error(`Database file not found at ${DB_PATH}`);
  process.exit(1);
}

const db = new Database(DB_PATH, { readonly: true });
const rows = db
  .prepare(
    "SELECT sql FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' AND sql IS NOT NULL ORDER BY type,name"
  )
  .all();

let fullSchema = rows.map(r => r.sql + ';').join('\n\n');
fs.writeFileSync(OUT_SCHEMA, fullSchema);

if (!fs.existsSync(MIGRATIONS_DIR)) fs.mkdirSync(MIGRATIONS_DIR);

const migrationHeader = `-- migrations/001_initial.sql
-- initial schema dump
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION();
`;
const migrationsTable = `
CREATE TABLE IF NOT EXISTS migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);
`;
const migrationFooter = `
COMMIT;
`;

const initialContent =
  migrationHeader + migrationsTable + '\n\n' + fullSchema + migrationFooter;
fs.writeFileSync(INITIAL_MIGRATION, initialContent);

console.log(`Wrote ${OUT_SCHEMA} and ${INITIAL_MIGRATION}`);
