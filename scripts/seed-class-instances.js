const Database = require('better-sqlite3');
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'gym.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

// ensure level column exists on classes table
const columns = db.prepare(`PRAGMA table_info(classes)`).all();
const hasLevel = columns.some(c => c.name === 'level');
if (!hasLevel) {
  db.prepare(`ALTER TABLE classes ADD COLUMN level TEXT DEFAULT 'All Levels'`).run();
}

const classes = [
  { id: 1, name: 'Boxing Technique', coach: 'Kyle McLaughlin', level: 'All Levels', price: 25.0, max_capacity: 15 },
  { id: 2, name: 'Strength & Conditioning', coach: 'Humza Muhammad', level: 'Intermediate', price: 25.0, max_capacity: 12 },
  { id: 3, name: 'Boxing Bootcamp', coach: 'Scott McDonald', level: 'All Levels', price: 25.0, max_capacity: 20 },
  { id: 4, name: 'Teen Boxing', coach: 'Kyle McLaughlin', level: 'Ages 13-16', price: 20.0, max_capacity: 10 },
  { id: 5, name: "Women's Boxing", coach: 'Scott McDonald', level: 'All Levels', price: 25.0, max_capacity: 15 },
];

const insertClass = db.prepare(
  `INSERT OR IGNORE INTO classes (id, name, instructor, max_capacity, price, level)
   VALUES (?, ?, ?, ?, ?, ?)`
);
classes.forEach(cls => {
  insertClass.run(cls.id, cls.name, cls.coach, cls.max_capacity, cls.price, cls.level);
});

const startOfWeek = (() => {
  const d = new Date();
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  d.setDate(d.getDate() + diff);
  d.setHours(0,0,0,0);
  return d;
})();

const instances = [];
for (let i = 0; i < 10; i++) {
  const cls = classes[i % classes.length];
  const date = new Date(startOfWeek);
  date.setDate(startOfWeek.getDate() + i);
  const dateStr = date.toISOString().split('T')[0];
  instances.push({
    class_id: cls.id,
    date: dateStr,
    start_time: cls.id % 2 === 0 ? '18:00' : '06:00',
    end_time: cls.id % 2 === 0 ? '19:00' : '07:00',
    instructor: cls.coach,
    max_capacity: cls.max_capacity,
    current_bookings: 0,
    status: 'active',
  });
}

db.prepare('DELETE FROM class_instances').run();
const insertInstance = db.prepare(
  `INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, current_bookings, status)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
);
instances.forEach(inst => {
  insertInstance.run(
    inst.class_id,
    inst.date,
    inst.start_time,
    inst.end_time,
    inst.instructor,
    inst.max_capacity,
    inst.current_bookings,
    inst.status
  );
});

console.log(`Seeded ${instances.length} class instances`);
db.close();
