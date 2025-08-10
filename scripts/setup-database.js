import Database from "better-sqlite3"
import path from "path"
const dbPath = path.join(process.cwd(), "gym.db")
console.log("Database path:", dbPath)

// Open existing database or create a new one if it doesn't exist
const db = new Database(dbPath)
console.log("Opened database at:", dbPath)

// Enable foreign keys
db.pragma("foreign_keys = ON")

try {
  console.log("Setting up database...")

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        full_name TEXT,
        phone TEXT,
        membership_type TEXT DEFAULT 'basic',
        membership_status TEXT DEFAULT 'active',
        is_admin INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        instructor TEXT,
        duration INTEGER DEFAULT 60,
        max_capacity INTEGER DEFAULT 20,
        price DECIMAL(10,2) DEFAULT 0.00,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

    CREATE TABLE IF NOT EXISTS class_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        class_instance_id INTEGER NOT NULL,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'confirmed',
        payment_status TEXT DEFAULT 'pending',
        attended INTEGER DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (class_instance_id) REFERENCES class_instances(id),
        UNIQUE(user_id, class_instance_id)
    );

    CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        payment_type TEXT NOT NULL,
        payment_method TEXT,
        description TEXT,
        status TEXT DEFAULT 'completed',
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
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

    CREATE TABLE IF NOT EXISTS attendance (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        class_name TEXT NOT NULL,
        class_date DATE NOT NULL,
        attended INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `)

  console.log("Tables created successfully")

  // Insert admin user
  const adminExists = db.prepare("SELECT id FROM users WHERE username = ?").get("admin")
  if (!adminExists) {
    db.prepare(`
      INSERT INTO users (username, password, email, full_name, is_admin, membership_status) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run("admin", "admin123", "admin@cavegym.com", "Admin User", 1, "admin")
    console.log("Admin user created")
  } else {
    console.log("Admin user already exists")
  }

  // Insert sample classes
  const classesData = [
    [1, "Boxing Fundamentals", "Learn the basics of boxing technique and footwork", "Kyle McLaughlin", 60, 15, 25.0],
    [2, "Strength & Conditioning", "Build strength and endurance with functional training", "Humza Ali", 45, 12, 20.0],
    [3, "Junior Jabbers", "Boxing classes designed specifically for kids aged 8-14", "Scott Wilson", 45, 10, 15.0],
    [4, "Advanced Boxing", "High-intensity boxing for experienced fighters", "Kyle McLaughlin", 75, 12, 30.0],
    [5, "Women's Boxing", "Boxing classes in a supportive women-only environment", "Sarah Johnson", 60, 15, 25.0],
  ]

  const insertClass = db.prepare(`
    INSERT INTO classes (id, name, description, instructor, duration, max_capacity, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name=excluded.name,
      description=excluded.description,
      instructor=excluded.instructor,
      duration=excluded.duration,
      max_capacity=excluded.max_capacity,
      price=excluded.price
  `)

  classesData.forEach((classData) => {
    insertClass.run(...classData)
  })
  console.log("Sample classes inserted")

  // Insert sample users
  const usersData = [
    { username: "john_doe", password: "password123", email: "john@example.com", full_name: "John Doe", phone: "555-0101", membership_type: "premium" },
    { username: "jane_smith", password: "password123", email: "jane@example.com", full_name: "Jane Smith", phone: "555-0102", membership_type: "basic" },
    { username: "mike_wilson", password: "password123", email: "mike@example.com", full_name: "Mike Wilson", phone: "555-0103", membership_type: "premium" },
  ]

  const insertUser = db.prepare(`
    INSERT INTO users (username, password, email, full_name, phone, membership_type, is_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)

  usersData.forEach((u) => {
    const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(u.username)
    if (!exists) {
      insertUser.run(u.username, u.password, u.email, u.full_name, u.phone, u.membership_type, 0)
    }
  })
  console.log("Sample users inserted")

  // Map usernames to user IDs for later references
  const userMap = {}
  usersData.forEach((u) => {
    const row = db.prepare("SELECT id FROM users WHERE username = ?").get(u.username)
    if (row) userMap[u.username] = row.id
  })

  // Generate class instances for the next 30 days
  const classes = db.prepare("SELECT * FROM classes").all()
  const insertInstance = db.prepare(`
    INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  const scheduleMap = {
    1: { days: [1, 3, 5], time: "09:00", endTime: "10:00" }, // Boxing Fundamentals: Mon, Wed, Fri
    2: { days: [2, 4], time: "18:00", endTime: "18:45" }, // Strength & Conditioning: Tue, Thu
    3: { days: [6], time: "16:00", endTime: "16:45" }, // Junior Jabbers: Saturday
    4: { days: [1, 4], time: "19:30", endTime: "20:45" }, // Advanced Boxing: Mon, Thu
    5: { days: [2, 5], time: "10:00", endTime: "11:00" }, // Women's Boxing: Tue, Fri
  }

  for (let dayOffset = 0; dayOffset <= 30; dayOffset++) {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    const dayOfWeek = date.getDay() // 0 = Sunday, 1 = Monday, etc.
    const dateString = date.toISOString().split("T")[0]

    classes.forEach((classItem) => {
      const schedule = scheduleMap[classItem.id]
      if (schedule && schedule.days.includes(dayOfWeek)) {
        const exists = db
          .prepare(
            "SELECT id FROM class_instances WHERE class_id = ? AND date = ? AND start_time = ?",
          )
          .get(classItem.id, dateString, schedule.time)
        if (!exists) {
          const classExists = db.prepare("SELECT id FROM classes WHERE id = ?").get(classItem.id)
          if (classExists) {
            insertInstance.run(
              classItem.id,
              dateString,
              schedule.time,
              schedule.endTime,
              classItem.instructor,
              classItem.max_capacity,
            )
          }
        }
      }
    })
  }
  console.log("Class instances generated for next 30 days")

  // Insert sample bookings
  const classInstances = db
    .prepare(`
    SELECT * FROM class_instances
    WHERE date >= date('now', '-7 days') AND date <= date('now', '+7 days')
    LIMIT 5
  `)
    .all()

  const insertBooking = db.prepare(`
    INSERT INTO class_bookings (user_id, class_instance_id, status, payment_status, attended)
    VALUES (?, ?, ?, ?, ?)
  `)

  usersData.forEach((u) => {
    const userId = userMap[u.username]
    if (!userId) return
    classInstances.forEach((instance) => {
      const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId)
      const instanceExists = db.prepare("SELECT id FROM class_instances WHERE id = ?").get(instance.id)
      if (!userExists || !instanceExists) return
      const exists = db
        .prepare("SELECT id FROM class_bookings WHERE user_id = ? AND class_instance_id = ?")
        .get(userId, instance.id)
      if (!exists) {
        const attended = new Date(instance.date) < new Date() ? 1 : 0
        insertBooking.run(userId, instance.id, "confirmed", "paid", attended)
      }
    })
  })
  console.log("Sample bookings inserted")

  // Insert sample payments
  const paymentsData = [
    { username: "john_doe", amount: 150.0, type: "membership", method: "credit_card", description: "Monthly Premium Membership" },
    { username: "jane_smith", amount: 100.0, type: "membership", method: "debit_card", description: "Monthly Basic Membership" },
    { username: "mike_wilson", amount: 150.0, type: "membership", method: "credit_card", description: "Monthly Premium Membership" },
    { username: "john_doe", amount: 25.0, type: "class", method: "credit_card", description: "Boxing Fundamentals Class" },
  ]

  const insertPayment = db.prepare(`
    INSERT INTO payments (user_id, amount, payment_type, payment_method, description)
    VALUES (?, ?, ?, ?, ?)
  `)

  paymentsData.forEach((p) => {
    const userId = userMap[p.username]
    if (!userId) return
    const userExists = db.prepare("SELECT id FROM users WHERE id = ?").get(userId)
    if (!userExists) return
    const exists = db
      .prepare(
        "SELECT id FROM payments WHERE user_id = ? AND amount = ? AND payment_type = ? AND description = ?",
      )
      .get(userId, p.amount, p.type, p.description)
    if (!exists) {
      insertPayment.run(userId, p.amount, p.type, p.method, p.description)
    }
  })
  console.log("Sample payments inserted")

  console.log("Database setup completed successfully!")
} catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
  console.error("Database setup error:", error)
} finally {
  db.close()
}
