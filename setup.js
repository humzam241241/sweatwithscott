// setup.js
const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

const db = new Database(path.join(__dirname, 'gym.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );
`);

const hash = bcrypt.hashSync('admin123', 10);

try {
  db.prepare(`
    INSERT INTO users (username, password, role)
    VALUES (?, ?, ?)
  `).run('admin', hash, 'admin');

  console.log('✅ Admin user created (username: admin, password: admin123)');
} catch (e) {
  console.error('⚠️ Admin already exists or error:', e.message);
}

db.close();
