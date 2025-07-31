// scripts/migrate.cjs
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DATABASE_URL || './gym.db';
const MIGRATIONS_DIR = path.join(process.cwd(), 'migrations');

if (!fs.existsSync(MIGRATIONS_DIR)) {
  console.error('Migrations directory missing. Run dump-schema first.');
  process.exit(1);
}

const db = new Database(DB_PATH);

// Ensure migrations tracking table exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS migrations (
    id TEXT PRIMARY KEY,
    applied_at TEXT NOT NULL
  )
`).run();

const applied = new Set(
  db.prepare('SELECT id FROM migrations').all().map(r => r.id)
);

const migrationFiles = fs
  .readdirSync(MIGRATIONS_DIR)
  .filter(f => /^\d+_.*\.sql$/.test(f))
  .sort();

for (const file of migrationFiles) {
  if (applied.has(file)) {
    console.log(`Skipping already applied migration: ${file}`);
    continue;
  }

  const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
  console.log(`Applying migration: ${file}`);
  try {
    db.exec('BEGIN');
    db.exec(sql);
    db.prepare('INSERT INTO migrations (id, applied_at) VALUES (?, ?)').run(
      file,
      new Date().toISOString()
    );
    db.exec('COMMIT');
    console.log(`✅ Applied: ${file}`);
  } catch (e) {
    db.exec('ROLLBACK');
    console.error(`❌ Failed ${file}:`, e.message);
    process.exit(1);
  }
}
