// scripts/check-db.js
const Database = require('better-sqlite3');
const db = new Database('./gym.db', { readonly: true });

console.log('=== tables ===');
const tables = db
  .prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;")
  .all()
  .map(r => r.name);
console.log(tables);

console.log('=== applied migrations ===');
try {
  const migrations = db
    .prepare('SELECT id, applied_at FROM migrations ORDER BY applied_at;')
    .all();
  console.log(migrations);
} catch (e) {
  console.log('migrations table missing or error:', e.message);
}

console.log('=== sample members ===');
try {
  const members = db.prepare("SELECT * FROM members ORDER BY joined_at DESC LIMIT 5;").all();
  console.log(members);
} catch (e) {
  console.log('members table missing or error:', e.message);
}
