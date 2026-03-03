CREATE TABLE attendance (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          class_name TEXT NOT NULL,
          class_date DATE NOT NULL,
          attended INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

CREATE TABLE bookings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          class_name TEXT NOT NULL,
          class_date DATE NOT NULL,
          class_time TIME NOT NULL,
          status TEXT DEFAULT 'confirmed',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
      );

CREATE TABLE class_bookings (
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

CREATE TABLE class_instances (
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

CREATE TABLE classes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          day TEXT NOT NULL,
          name TEXT NOT NULL,
          time TEXT NOT NULL,
          spots INTEGER DEFAULT 0,
          coach TEXT,
          color TEXT
      );

CREATE TABLE payments (
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

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

CREATE TABLE media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    type TEXT NOT NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
