-- 004_create_classes_table.sql
DROP TABLE IF EXISTS classes;
CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day TEXT NOT NULL,
  name TEXT NOT NULL,
  time TEXT NOT NULL,
  spots INTEGER DEFAULT 0,
  coach TEXT,
  color TEXT
);
