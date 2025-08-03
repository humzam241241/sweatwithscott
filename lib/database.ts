import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

export interface ClassRecord {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  coach_name?: string | null;
  duration?: number | null;
  max_capacity?: number | null;
  price?: number | null;
  day_of_week?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  active?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  image?: string | null;
}

export interface CoachRecord {
  id: number;
  slug: string;
  name: string;
  bio?: string | null;
  certifications?: string | null;
  image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Database connection with proper error handling
const dbPath = path.join(process.cwd(), "gym.db");
const db = new Database(dbPath);

// Enable foreign keys and WAL mode for better performance
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// Initialize database with schema
export function initializeDatabase() {
  try {
    // Create tables if they don't exist
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
          membership_expiry DATE,
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
          price DECIMAL(10,2) DEFAULT 25.00,
          day_of_week TEXT,
          start_time TEXT,
          end_time TEXT,
          is_active INTEGER DEFAULT 1,
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
          payment_amount DECIMAL(10,2) DEFAULT 25.00,
          attended INTEGER DEFAULT 0,
          attendance_marked_at DATETIME,
          notes TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id),
          FOREIGN KEY (class_instance_id) REFERENCES class_instances(id),
          UNIQUE(user_id, class_instance_id)
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
    `);

    // Add membership_expiry column for existing installations
    try {
      db.prepare("ALTER TABLE users ADD COLUMN membership_expiry DATE").run();
    } catch {
      // Ignore if column already exists
    }

    // Insert admin user if not exists
    const adminExists = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get("admin");
    if (!adminExists) {
      const hashedAdmin = bcrypt.hashSync("admin123", 10);
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0];
      db.prepare(
        `
        INSERT INTO users (username, password, email, full_name, is_admin, membership_status, membership_expiry)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      ).run(
        "admin",
        hashedAdmin,
        "admin@cavegym.com",
        "Admin User",
        1,
        "admin",
        expiry,
      );
    }

    // Replace class schedule with updated classes
    resetClassSchedule();

    // Insert sample users if none exist (excluding admin)
    const userCount = db
      .prepare("SELECT COUNT(*) as count FROM users WHERE is_admin = 0")
      .get() as { count: number };
    if (userCount.count === 0) {
      const sampleUsers = [
        {
          username: "john_doe",
          password: "password123",
          email: "john@example.com",
          full_name: "John Doe",
          phone: "555-0101",
          membership_type: "monthly",
        },
        {
          username: "jane_smith",
          password: "password123",
          email: "jane@example.com",
          full_name: "Jane Smith",
          phone: "555-0102",
          membership_type: "annual",
        },
        {
          username: "mike_wilson",
          password: "password123",
          email: "mike@example.com",
          full_name: "Mike Wilson",
          phone: "555-0103",
          membership_type: "drop_in",
        },
      ];

      const insertUser = db.prepare(`
        INSERT INTO users (username, password, email, full_name, phone, membership_type, membership_expiry)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      sampleUsers.forEach((user) => {
        const hashed = bcrypt.hashSync(user.password, 10);
        const expiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];
        insertUser.run(
          user.username,
          hashed,
          user.email,
          user.full_name,
          user.phone,
          user.membership_type,
          expiry,
        );
      });
    }

    // Generate class instances for the next 30 days
    generateClassInstances();

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Database initialization error:", error);
  }
}

function resetClassSchedule() {
  // Clear existing classes and instances
  db.prepare("DELETE FROM class_instances").run();
  db.prepare("DELETE FROM classes").run();

  const capacities: Record<string, number> = {
    Bootcamp: 30,
    "Boxing Tech": 30,
    "Junior Jabbers (6-12 yr)": 15,
    "Strength & Conditioning": 30,
    "Beginner Boxing": 30,
    Sparring: 20,
    "Open Gym": 9999,
  };

  const schedule = [
    { day: "Monday", time: "12:00", name: "Bootcamp" },
    { day: "Monday", time: "17:00", name: "Boxing Tech" },
    { day: "Monday", time: "18:00", name: "Bootcamp" },
    { day: "Monday", time: "19:00", name: "Boxing Tech" },
    { day: "Monday", time: "20:00", name: "Strength & Conditioning" },
    { day: "Tuesday", time: "12:00", name: "Bootcamp" },
    { day: "Tuesday", time: "17:00", name: "Bootcamp" },
    { day: "Tuesday", time: "18:00", name: "Junior Jabbers (6-12 yr)" },
    { day: "Tuesday", time: "19:00", name: "Boxing Tech" },
    { day: "Tuesday", time: "20:00", name: "Open Gym" },
    { day: "Wednesday", time: "12:00", name: "Bootcamp" },
    { day: "Wednesday", time: "17:00", name: "Boxing Tech" },
    { day: "Wednesday", time: "18:00", name: "Bootcamp" },
    { day: "Wednesday", time: "19:00", name: "Boxing Tech" },
    { day: "Wednesday", time: "20:00", name: "Open Gym" },
    { day: "Thursday", time: "12:00", name: "Bootcamp" },
    { day: "Thursday", time: "17:00", name: "Bootcamp" },
    { day: "Thursday", time: "18:00", name: "Junior Jabbers (6-12 yr)" },
    { day: "Thursday", time: "19:00", name: "Boxing Tech" },
    { day: "Thursday", time: "20:00", name: "Open Gym" },
    { day: "Friday", time: "16:00", name: "Open Gym" },
    { day: "Friday", time: "18:00", name: "Bootcamp" },
    { day: "Friday", time: "19:00", name: "Boxing Tech" },
    { day: "Friday", time: "20:00", name: "Open Gym" },
    { day: "Saturday", time: "11:00", name: "Bootcamp" },
    { day: "Saturday", time: "12:00", name: "Beginner Boxing" },
    { day: "Saturday", time: "13:00", name: "Sparring" },
  ];

  const addHour = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    const endHour = (h + 1).toString().padStart(2, "0");
    return `${endHour}:${m.toString().padStart(2, "0")}`;
  };

  const insertClass = db.prepare(`
    INSERT INTO classes (name, instructor, day_of_week, start_time, end_time, max_capacity, price)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  schedule.forEach((cls) => {
    insertClass.run(
      cls.name,
      "",
      cls.day,
      cls.time,
      addHour(cls.time),
      capacities[cls.name] || 30,
      0,
    );
  });
}

// Generate class instances based on class schedule
function generateClassInstances() {
  try {
    const classes = db
      .prepare("SELECT * FROM classes WHERE is_active = 1")
      .all();
    const today = new Date();

    // Clear future instances to regenerate
    db.prepare("DELETE FROM class_instances WHERE date > date('now')").run();

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      const dayName = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const dateString = currentDate.toISOString().split("T")[0];

      const dayClasses = classes.filter(
        (cls: any) => cls.day_of_week === dayName,
      );

      dayClasses.forEach((cls: any) => {
        try {
          db.prepare(
            `
            INSERT OR IGNORE INTO class_instances 
            (class_id, date, start_time, end_time, instructor, max_capacity, status)
            VALUES (?, ?, ?, ?, ?, ?, 'scheduled')
          `,
          ).run(
            cls.id,
            dateString,
            cls.start_time,
            cls.end_time,
            cls.instructor,
            cls.max_capacity,
          );
        } catch (error) {
          console.error(
            `Error creating instance for ${cls.name} on ${dateString}:`,
            error,
          );
        }
      });
    }

    // Add some sample bookings and payments
    addSampleBookingsAndPayments();
  } catch (error) {
    console.error("Error generating class instances:", error);
  }
}

// Add sample bookings and payments for demo
function addSampleBookingsAndPayments() {
  try {
    const users = db.prepare("SELECT * FROM users WHERE is_admin = 0").all();
    const instances = db
      .prepare("SELECT * FROM class_instances LIMIT 10")
      .all();

    if (users.length === 0 || instances.length === 0) return;

    // Clear existing sample data
    db.prepare("DELETE FROM class_bookings").run();
    db.prepare("DELETE FROM payments").run();

    const insertBooking = db.prepare(`
      INSERT INTO class_bookings (user_id, class_instance_id, status, payment_status, payment_amount, attended)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const insertPayment = db.prepare(`
      INSERT INTO payments (user_id, booking_id, amount, payment_type, payment_method, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Create sample bookings
    users.forEach((user: any, userIndex: number) => {
      instances.slice(0, 3).forEach((instance: any, instanceIndex: number) => {
        const paymentStatus = Math.random() > 0.3 ? "paid" : "pending";
        const attended = Math.random() > 0.2 ? 1 : 0;

        try {
          const result = insertBooking.run(
            user.id,
            instance.id,
            "confirmed",
            paymentStatus,
            25.0,
            attended,
          );

          // Create payment record if paid
          if (paymentStatus === "paid") {
            insertPayment.run(
              user.id,
              result.lastInsertRowid,
              25.0,
              "class_booking",
              "card",
              `Payment for ${instance.date} class`,
              "completed",
            );
          }

          // Update class instance booking count
          db.prepare(
            "UPDATE class_instances SET current_bookings = current_bookings + 1 WHERE id = ?",
          ).run(instance.id);
        } catch (error) {
          // Ignore duplicate booking errors
        }
      });
    });
  } catch (error) {
    console.error("Error adding sample bookings and payments:", error);
  }
}

// Initialize on import
initializeDatabase();

// Database operations
export const dbOperations = {
  // User operations
  getUserByUsername: (username: string) => {
    try {
      return db.prepare("SELECT * FROM users WHERE username = ?").get(username);
    } catch (error) {
      console.error("Error getting user by username:", error);
      return null;
    }
  },

  getUserById: (id: number) => {
    try {
      return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
    } catch (error) {
      console.error("Error getting user by id:", error);
      return null;
    }
  },

  createUser: (userData: any) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO users (username, password, email, full_name, phone, membership_type, membership_expiry)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      const expiry =
        userData.membershipExpiry ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      return stmt.run(
        userData.username,
        userData.password,
        userData.email,
        userData.fullName,
        userData.phone,
        userData.membershipType || "basic",
        expiry,
      );
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  updateUser: (userId: number, data: any) => {
    try {
      const fields = Object.keys(data);
      if (fields.length === 0) return;

      const setters = fields.map((f) => `${f} = ?`).join(", ");
      const stmt = db.prepare(
        `UPDATE users SET ${setters}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      );
      const params = fields.map((f) => data[f]);
      params.push(userId);
      return stmt.run(...params);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },

  getAllUsers: () => {
    try {
      return db
        .prepare(
          "SELECT * FROM users WHERE is_admin = 0 ORDER BY created_at DESC",
        )
        .all();
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  },

  // Class operations
  getAllClasses: async (): Promise<ClassRecord[]> => {
    try {
      const rows = db
        .prepare(
          `SELECT id, slug, name, description, instructor as coach_name, duration, max_capacity, price,
                  day_of_week, start_time, end_time, is_active as active, created_at, updated_at, image
           FROM classes
           ORDER BY name`,
        )
        .all();
      return rows as ClassRecord[];
    } catch (error) {
      console.error("Error getting classes:", error);
      return [];
    }
  },

  getAllCoaches: async (): Promise<CoachRecord[]> => {
    try {
      const rows = db
        .prepare(
          `SELECT id, slug, name, bio, certifications, image, created_at, updated_at FROM coaches ORDER BY name`,
        )
        .all();
      return rows as CoachRecord[];
    } catch (error) {
      console.error("Error getting coaches:", error);
      return [];
    }
  },

  getAllClassInstances: async (): Promise<any[]> => {
    try {
      const rows = db
        .prepare(
          `SELECT ci.*, c.name as class_name, c.instructor as coach_name
           FROM class_instances ci
           JOIN classes c ON ci.class_id = c.id
           ORDER BY ci.date, ci.start_time`,
        )
        .all();
      return rows as any[];
    } catch (error) {
      console.error("Error getting class instances:", error);
      return [];
    }
  },

  getClassBySlug: (slug: string): ClassRecord | null => {
    try {
      return (
        db.prepare("SELECT * FROM classes WHERE slug = ?").get(slug) as ClassRecord
      ) || null;
    } catch (error) {
      console.error("Error getting class by slug:", error);
      return null;
    }
  },

  getCoachBySlug: (slug: string): CoachRecord | null => {
    try {
      return (
        db.prepare("SELECT * FROM coaches WHERE slug = ?").get(slug) as CoachRecord
      ) || null;
    } catch (error) {
      console.error("Error getting coach by slug:", error);
      return null;
    }
  },

  // Class instance operations
  createClassInstance: (
    classId: number,
    date: string,
    startTime: string,
    endTime: string,
    instructor: string,
    maxCapacity: number,
    status: string,
  ) => {
    try {
      const stmt = db.prepare(
        `INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      );
      const result = stmt.run(
        classId,
        date,
        startTime,
        endTime,
        instructor,
        maxCapacity,
        status,
      );
      return result.lastInsertRowid as number;
    } catch (error) {
      console.error("Error creating class instance:", error);
      throw error;
    }
  },

  getCurrentClasses: () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      return db
        .prepare(
          `
        SELECT ci.*, c.name as class_name, c.description, c.price, c.instructor as class_instructor,
               COUNT(cb.id) as total_bookings,
               COUNT(CASE WHEN cb.attended = 1 THEN 1 END) as attended_count,
               COUNT(CASE WHEN cb.payment_status = 'pending' THEN 1 END) as pending_payments
        FROM class_instances ci
        JOIN classes c ON ci.class_id = c.id
        LEFT JOIN class_bookings cb ON ci.id = cb.class_instance_id AND cb.status = 'confirmed'
        WHERE ci.date = ?
        GROUP BY ci.id
        ORDER BY ci.start_time
      `,
        )
        .all(today);
    } catch (error) {
      console.error("Error getting current classes:", error);
      return [];
    }
  },

  getFutureClasses: () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      return db
        .prepare(
          `
        SELECT ci.*, c.name as class_name, c.description, c.price, c.instructor as class_instructor,
               COUNT(cb.id) as total_bookings,
               COUNT(CASE WHEN cb.payment_status = 'pending' THEN 1 END) as pending_payments
        FROM class_instances ci
        JOIN classes c ON ci.class_id = c.id
        LEFT JOIN class_bookings cb ON ci.id = cb.class_instance_id AND cb.status = 'confirmed'
        WHERE ci.date > ?
        GROUP BY ci.id
        ORDER BY ci.date, ci.start_time
        LIMIT 20
      `,
        )
        .all(today);
    } catch (error) {
      console.error("Error getting future classes:", error);
      return [];
    }
  },

  getPastClasses: () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      return db
        .prepare(
          `
        SELECT ci.*, c.name as class_name, c.description, c.price, c.instructor as class_instructor,
               COUNT(cb.id) as total_bookings,
               COUNT(CASE WHEN cb.attended = 1 THEN 1 END) as attended_count,
               COUNT(CASE WHEN cb.payment_status = 'pending' THEN 1 END) as pending_payments
        FROM class_instances ci
        JOIN classes c ON ci.class_id = c.id
        LEFT JOIN class_bookings cb ON ci.id = cb.class_instance_id AND cb.status = 'confirmed'
        WHERE ci.date < ?
        GROUP BY ci.id
        ORDER BY ci.date DESC, ci.start_time DESC
        LIMIT 20
      `,
        )
        .all(today);
    } catch (error) {
      console.error("Error getting past classes:", error);
      return [];
    }
  },

  getClassWithAttendees: (classInstanceId: number) => {
    try {
      return db
        .prepare(
          `
        SELECT cb.*, u.username, u.full_name, u.email, u.phone,
               ci.date, ci.start_time, ci.end_time, c.name as class_name, c.instructor
        FROM class_bookings cb
        JOIN users u ON cb.user_id = u.id
        JOIN class_instances ci ON cb.class_instance_id = ci.id
        JOIN classes c ON ci.class_id = c.id
        WHERE cb.class_instance_id = ? AND cb.status = 'confirmed'
        ORDER BY u.full_name
      `,
        )
        .all(classInstanceId);
    } catch (error) {
      console.error("Error getting class with attendees:", error);
      return [];
    }
  },

  getOutstandingPayments: () => {
    try {
      return db
        .prepare(
          `
        SELECT cb.*, u.username, u.full_name, u.email, u.phone,
               ci.date, ci.start_time, c.name as class_name, c.instructor
        FROM class_bookings cb
        JOIN users u ON cb.user_id = u.id
        JOIN class_instances ci ON cb.class_instance_id = ci.id
        JOIN classes c ON ci.class_id = c.id
        WHERE cb.payment_status = 'pending' AND cb.status = 'confirmed'
        ORDER BY ci.date DESC, u.full_name
      `,
        )
        .all();
    } catch (error) {
      console.error("Error getting outstanding payments:", error);
      return [];
    }
  },

  getClassRoster: (classInstanceId: number) => {
    try {
      return db
        .prepare(
          `
        SELECT cb.id, cb.user_id, u.username, u.full_name, u.email, u.phone,
               cb.status as booking_status, cb.payment_status, cb.payment_method,
               cb.payment_amount, cb.attended as attendance_status,
               cb.booking_date, cb.notes
        FROM class_bookings cb
        JOIN users u ON cb.user_id = u.id
        WHERE cb.class_instance_id = ? AND cb.status = 'confirmed'
        ORDER BY u.full_name
      `,
        )
        .all(classInstanceId);
    } catch (error) {
      console.error("Error getting class roster:", error);
      return [];
    }
  },

  getClassRostersByDate: (date: string) => {
    try {
      return db
        .prepare(
          `
        SELECT ci.id as class_instance_id, c.name as class_name,
               ci.instructor as coach, ci.date, ci.start_time, ci.end_time,
               ci.max_capacity, ci.current_bookings
        FROM class_instances ci
        JOIN classes c ON ci.class_id = c.id
        WHERE ci.date = ?
        ORDER BY ci.start_time
      `,
        )
        .all(date);
    } catch (error) {
      console.error("Error getting class rosters by date:", error);
      return [];
    }
  },

  // Booking operations
  getUserBookings: (userId: number) => {
    try {
      return db
        .prepare(
          `
        SELECT cb.*, ci.date, ci.start_time, ci.end_time, c.name as class_name, c.instructor
        FROM class_bookings cb
        JOIN class_instances ci ON cb.class_instance_id = ci.id
        JOIN classes c ON ci.class_id = c.id
        WHERE cb.user_id = ?
        ORDER BY ci.date DESC, ci.start_time DESC
      `,
        )
        .all(userId);
    } catch (error) {
      console.error("Error getting user bookings:", error);
      return [];
    }
  },

  getAllBookings: () => {
    try {
      return db
        .prepare(
          `
        SELECT cb.*, ci.date, ci.start_time, ci.end_time, c.name as class_name, c.instructor,
               u.username, u.full_name
        FROM class_bookings cb
        JOIN class_instances ci ON cb.class_instance_id = ci.id
        JOIN classes c ON ci.class_id = c.id
        JOIN users u ON cb.user_id = u.id
        ORDER BY ci.date DESC, ci.start_time DESC
      `,
        )
        .all();
    } catch (error) {
      console.error("Error getting all bookings:", error);
      return [];
    }
  },

  getClassInstanceById: (id: number) => {
    try {
      return db
        .prepare(
          `SELECT ci.*, c.name as class_name FROM class_instances ci JOIN classes c ON ci.class_id = c.id WHERE ci.id = ?`,
        )
        .get(id);
    } catch (error) {
      console.error("Error getting class instance by id:", error);
      return null;
    }
  },

  getUserBookingForClass: (userId: number, classInstanceId: number) => {
    try {
      return db
        .prepare(
          `SELECT * FROM class_bookings WHERE user_id = ? AND class_instance_id = ? LIMIT 1`,
        )
        .get(userId, classInstanceId);
    } catch (error) {
      console.error("Error checking existing booking:", error);
      return null;
    }
  },

  getUserBookingOverlap: (
    userId: number,
    date: string,
    startTime: string,
    endTime: string,
  ) => {
    try {
      return db
        .prepare(
          `SELECT cb.* FROM class_bookings cb
           JOIN class_instances ci ON cb.class_instance_id = ci.id
           WHERE cb.user_id = ? AND ci.date = ?
             AND ci.start_time < ? AND ci.end_time > ?
             AND cb.status = 'confirmed'
           LIMIT 1`,
        )
        .get(userId, date, endTime, startTime);
    } catch (error) {
      console.error("Error checking overlapping booking:", error);
      return null;
    }
  },

  waitlistClass: (userId: number, classInstanceId: number) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO class_bookings (user_id, class_instance_id, status, payment_status, payment_amount)
        VALUES (?, ?, 'waitlist', 'pending', 25.00)
      `);
      return stmt.run(userId, classInstanceId);
    } catch (error) {
      console.error("Error adding to waitlist:", error);
      throw error;
    }
  },

  promoteWaitlistedUser: (classInstanceId: number) => {
    try {
      const booking = db
        .prepare(
          `SELECT * FROM class_bookings WHERE class_instance_id = ? AND status = 'waitlist' ORDER BY booking_date LIMIT 1`,
        )
        .get(classInstanceId);

      if (booking) {
        db.prepare(
          `UPDATE class_bookings SET status = 'confirmed' WHERE id = ?`,
        ).run(booking.id);
        db.prepare(
          `UPDATE class_instances SET current_bookings = current_bookings + 1 WHERE id = ?`,
        ).run(classInstanceId);
        return booking.user_id;
      }
      return null;
    } catch (error) {
      console.error("Error promoting waitlisted user:", error);
      return null;
    }
  },

  bookClass: (userId: number, classInstanceId: number) => {
    try {
      const stmt = db.prepare(`
        INSERT INTO class_bookings (user_id, class_instance_id, status, payment_status, payment_amount)
        VALUES (?, ?, 'confirmed', 'pending', 25.00)
      `);
      const result = stmt.run(userId, classInstanceId);

      // Update class instance booking count
      db.prepare(
        "UPDATE class_instances SET current_bookings = current_bookings + 1 WHERE id = ?",
      ).run(classInstanceId);

      return result;
    } catch (error) {
      console.error("Error booking class:", error);
      throw error;
    }
  },

  cancelBooking: (userId: number, classInstanceId: number) => {
    try {
      const stmt = db.prepare(`
        DELETE FROM class_bookings 
        WHERE user_id = ? AND class_instance_id = ?
      `);
      const result = stmt.run(userId, classInstanceId);

      if (result.changes > 0) {
        // Update class instance booking count
        db.prepare(
          "UPDATE class_instances SET current_bookings = current_bookings - 1 WHERE id = ?",
        ).run(classInstanceId);
      }

      return result;
    } catch (error) {
      console.error("Error canceling booking:", error);
      throw error;
    }
  },

  // Payment operations
  markPaymentPaid: (bookingId: number, paymentMethod = "cash") => {
    try {
      const booking = db
        .prepare("SELECT * FROM class_bookings WHERE id = ?")
        .get(bookingId);
      if (!booking) throw new Error("Booking not found");

      // Update booking payment status
      db.prepare(
        "UPDATE class_bookings SET payment_status = 'paid' WHERE id = ?",
      ).run(bookingId);

      // Create payment record
      const stmt = db.prepare(`
        INSERT INTO payments (user_id, booking_id, amount, payment_type, payment_method, description, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      return stmt.run(
        booking.user_id,
        bookingId,
        booking.payment_amount,
        "class_booking",
        paymentMethod,
        "Class booking payment",
        "completed",
      );
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      throw error;
    }
  },

  getUserPayments: (userId: number) => {
    try {
      return db
        .prepare(
          `
        SELECT * FROM payments 
        WHERE user_id = ? 
        ORDER BY payment_date DESC
      `,
        )
        .all(userId);
    } catch (error) {
      console.error("Error getting user payments:", error);
      return [];
    }
  },

  getAllPayments: () => {
    try {
      return db
        .prepare(
          `
        SELECT p.*, u.username, u.full_name
        FROM payments p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.payment_date DESC
      `,
        )
        .all();
    } catch (error) {
      console.error("Error getting all payments:", error);
      return [];
    }
  },

  // Attendance operations
  markAttendance: (bookingId: number, attended: boolean, notes?: string) => {
    try {
      const stmt = db.prepare(`
        UPDATE class_bookings 
        SET attended = ?, attendance_marked_at = datetime('now'), notes = ?
        WHERE id = ?
      `);
      return stmt.run(attended ? 1 : 0, notes || null, bookingId);
    } catch (error) {
      console.error("Error marking attendance:", error);
      throw error;
    }
  },

  // Statistics
  getGymStats: () => {
    try {
      const stats = db
        .prepare(
          `
        SELECT 
          (SELECT COUNT(*) FROM users WHERE is_admin = 0) as total_members,
          (SELECT COUNT(*) FROM class_bookings WHERE status = 'confirmed') as total_bookings,
          (SELECT COUNT(*) FROM class_bookings WHERE attended = 1) as total_attended,
          (SELECT COUNT(*) FROM class_instances WHERE date >= date('now')) as upcoming_classes,
          (SELECT COUNT(*) FROM class_bookings WHERE payment_status = 'pending') as pending_payments,
          (SELECT SUM(amount) FROM payments WHERE status = 'completed') as total_revenue
      `,
        )
        .get();

      return (
        stats || {
          total_members: 0,
          total_bookings: 0,
          total_attended: 0,
          upcoming_classes: 0,
          pending_payments: 0,
          total_revenue: 0,
        }
      );
    } catch (error) {
      console.error("Error getting gym stats:", error);
      return {
        total_members: 0,
        total_bookings: 0,
        total_attended: 0,
        upcoming_classes: 0,
        pending_payments: 0,
        total_revenue: 0,
      };
    }
  },
};

export default db;
