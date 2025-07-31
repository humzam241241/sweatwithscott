const Database = require('better-sqlite3');
const path = require('path');
const { startOfWeek, addDays, format } = require('date-fns');

const dbPath = path.join(process.cwd(), 'gym.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

function formatDate(date) {
  return format(date, 'yyyy-MM-dd');
}

// Ensure class exists
const className = 'Beginner Boxing';
let cls = db.prepare('SELECT id FROM classes WHERE name = ?').get(className);
if (!cls) {
  const info = db.prepare(
    `INSERT INTO classes (name, description, instructor, duration, max_capacity, price)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(className, 'Introductory boxing class', 'John Doe', 60, 10, 0);
  cls = { id: info.lastInsertRowid };
}

const instanceStmt = db.prepare(`
  INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, current_bookings)
  VALUES (?, ?, ?, ?, ?, ?, ?)`);

// Insert a few instances this week
const daysToInsert = [0, 2, 4]; // Monday, Wednesday, Friday
for (const offset of daysToInsert) {
  const date = formatDate(addDays(weekStart, offset));
  instanceStmt.run(cls.id, date, '10:00', '11:00', 'John Doe', 10, 3);
}

console.log('Seeded beginner boxing classes for the current week.');

db.close();
