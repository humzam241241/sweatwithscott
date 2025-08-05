import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

// ==== INTERFACES ====
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

export interface MediaRecord {
  id: number;
  type?: string | null;
  url: string;
  title?: string | null;
  created_at?: string | null;
}

export interface MembershipPackageRecord {
  id: number;
  name: string;
  description?: string | null;
  price?: number | null;
  features?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// ==== DATABASE CONNECTION ====
const dbPath = path.join(process.cwd(), "gym.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

// ==== INITIALIZE DATABASE ====
export function initializeDatabase() {
  try {
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        slug TEXT,
        coach_name TEXT,
        active INTEGER DEFAULT 1,
        image TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
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

      CREATE TABLE IF NOT EXISTS coaches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        name TEXT NOT NULL,
        bio TEXT,
        certifications TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS membership_packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        price REAL,
        features TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS site_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        value TEXT
      );
    `);

    // Ensure admin exists
    const adminExists = db.prepare("SELECT id FROM users WHERE username = ?").get("admin");
    if (!adminExists) {
      const hashedAdmin = bcrypt.hashSync("admin123", 10);
      const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      db.prepare(`
        INSERT INTO users (username, password, email, full_name, is_admin, membership_status, membership_expiry)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run("admin", hashedAdmin, "admin@cavegym.com", "Admin User", 1, "admin", expiry);
    }

    // Reset & seed
    resetClassSchedule();
    // Seed coaches if empty
    const coachCount = db.prepare("SELECT COUNT(*) as count FROM coaches").get() as { count: number };
    if (coachCount.count === 0) {
      const insertCoach = db.prepare(
        `INSERT INTO coaches (slug, name, bio, certifications, image) VALUES (?, ?, ?, ?, ?)`,
      );
      insertCoach.run(
        "coach-kyle",
        "Coach Kyle",
        "Professional boxer and certified trainer with 10+ years of experience.",
        "Certified Level 1 Boxing Coach",
        "/images/logo.png",
      );
      insertCoach.run(
        "coach-sarah",
        "Coach Sarah",
        "Strength and conditioning specialist focused on improving performance.",
        "Certified Personal Trainer",
        "/images/logo.png",
      );
    }

    // Seed membership packages if empty
    const pkgCount = db
      .prepare("SELECT COUNT(*) as count FROM membership_packages")
      .get() as { count: number };
    if (pkgCount.count === 0) {
      const insertPkg = db.prepare(
        `INSERT INTO membership_packages (name, description, price, features) VALUES (?, ?, ?, ?)`,
      );
      insertPkg.run(
        "Drop-In",
        "Perfect for trying us out or occasional visits",
        25,
        JSON.stringify(["Access to any class", "No commitment required", "Pay as you go", "Valid for 30 days from purchase"]),
      );
      insertPkg.run(
        "Monthly Unlimited",
        "Best value for regular training",
        150,
        JSON.stringify([
          "Unlimited classes",
          "All class types included",
          "Priority booking",
          "Guest pass (1 per month)",
          "Locker rental discount",
          "Nutrition consultation",
        ]),
      );
    }

    // Seed site settings if empty
    const settingsCount = db.prepare("SELECT COUNT(*) as count FROM site_settings").get() as { count: number };
    if (settingsCount.count === 0) {
      const insertSetting = db.prepare(
        `INSERT INTO site_settings (key, value) VALUES (?, ?)`,
      );
      insertSetting.run("hero_title", "The Cave Boxing Gym");
      insertSetting.run("hero_subtitle", "Train like a champion.");
      insertSetting.run("hero_bg", "/images/frontpic.png");
      insertSetting.run("contact_address", "123 Fight St, Hamilton, ON");
      insertSetting.run("contact_phone", "(289) 892-5430");
      insertSetting.run("contact_email", "info@caveboxing.com");
    }

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
    const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get().count;
    if (classCount === 0) {
      console.log("Seeding initial data...");
      generateClassInstances();
    }

    console.log(`📂 Using DB file: ${dbPath}`);
    console.log(`📊 Seeded ${db.prepare("SELECT COUNT(*) AS c FROM classes").get().c} unique classes`);
    console.log("Database initialized successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ DB Init Error:", error.message);
    } else {
      console.error("❌ DB Init Error:", String(error));
    }
  }
}

// ==== RESET CLASS SCHEDULE ====
function resetClassSchedule() {
  const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get().count;
  if (classCount === 0) {
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

    db.prepare(`
      UPDATE classes
      SET slug = LOWER(
        REPLACE(REPLACE(REPLACE(REPLACE(name, '&', 'and'), '(', ''), ')', ''), ' ', '-')
      ) || '-' || id
    `).run();

    db.prepare(`
      DELETE FROM classes
      WHERE id NOT IN (
        SELECT MIN(id)
        FROM classes
        GROUP BY LOWER(name)
      )
    `).run();
  }
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
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error(
              `Error creating instance for ${cls.name} on ${dateString}:`,
              error.message,
            );
          } else {
            console.error(
              `Error creating instance for ${cls.name} on ${dateString}:`,
              String(error),
            );
          }
        }
      });
    }

    // Add some sample bookings and payments
    addSampleBookingsAndPayments();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error generating class instances:", error.message);
    } else {
      console.error("Error generating class instances:", String(error));
    }
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
        } catch (error: unknown) {
          // Ignore duplicate booking errors
        }
      });
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error adding sample bookings and payments:", error.message);
    } else {
      console.error("Error adding sample bookings and payments:", String(error));
    }
  }
}

// Initialize on import
const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get().count;
if (classCount === 0) {
  console.log("Seeding initial data...");
  generateClassInstances();
}

// Database operations
export const dbOperations = {
  // Cleaned getAllClasses
  getAllClasses: (): ClassRecord[] => {
    try {
      return db.prepare(`
        SELECT * FROM classes
        WHERE is_active = 1
        GROUP BY LOWER(name)
        ORDER BY name
      `).all() as ClassRecord[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error getting classes:", error.message);
      } else {
        console.error("Error getting classes:", String(error));
      }
      return [];
    }
  },

  // Cleaned getAllCoaches
  getAllCoaches: (): CoachRecord[] => {
    try {
      return db
        .prepare(`
          SELECT id, slug, name, bio, certifications, image, created_at, updated_at
          FROM coaches
          GROUP BY LOWER(name)
          ORDER BY name
        `)
        .all() as CoachRecord[];
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error getting coaches:", error.message);
      } else {
        console.error("Error getting coaches:", String(error));
      }
      return [];
    }
  },

  // You can keep other dbOperations like bookings, payments, etc.
};

export default db;
