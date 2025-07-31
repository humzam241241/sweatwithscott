-- migrations/001_initial.sql
-- initial schema dump
PRAGMA foreign_keys=OFF;

CREATE TABLE IF NOT EXISTS migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  class_name TEXT NOT NULL,
  class_date DATE NOT NULL,
  attended INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  class_name TEXT NOT NULL,
  class_date DATE NOT NULL,
  class_time TIME NOT NULL,
  status TEXT DEFAULT 'confirmed',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS class_bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  class_instance_id INTEGER NOT NULL,
  booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'confirmed',
  payment_status TEXT DEFAULT 'pending',
  payment_amount DECIMAL(10,2) DEFAULT 25.00,
  attended INTEGER DEFAULT 0,
  attendance_marked_at DATETIME,
  notes TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (class_instance_id) REFERENCES class_instances(id),
  UNIQUE(user_id, class_instance_id)
);

CREATE TABLE IF NOT EXISTS class_instances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  class_id INTEGER NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  instructor TEXT,
  max_capacity INTEGER DEFAULT 20,
  current_bookings INTEGER DEFAULT 0,
  status TEXT DEFAULT 'scheduled',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (class_id) REFERENCES classes(id)
);

CREATE TABLE IF NOT EXISTS classes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  instructor TEXT,
  duration INTEGER DEFAULT 60,
  max_capacity INTEGER DEFAULT 20,
  price DECIMAL(10,2) DEFAULT 25.00,
  day_of_week TEXT,
  start_time TEXT,
  end_time TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  booking_id INTEGER,
  amount DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL,
  payment_method TEXT,
  description TEXT,
  status TEXT DEFAULT 'completed',
  payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (booking_id) REFERENCES class_bookings(id)
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  role TEXT
);
