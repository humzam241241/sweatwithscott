import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

export interface ClassRecord {
  id: number;
  slug: string;
  name: string;
  description?: string | null;
  coach_name?: string | null;
  instructor?: string | null;
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

export interface UserRecord {
  id: number;
  username: string;
  password: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  membership_type?: string | null;
  membership_status?: string | null;
  membership_expiry?: string | null;
  is_admin?: number | null;
}

const dbPath = path.join(process.cwd(), "gym.db");
const db = new Database(dbPath);
db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

function ensureColumns(tableName: string, columns: Array<{ name: string; type: string; defaultSql?: string }>) {
  try {
    const existing = (db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>).map(
      (c) => c.name,
    );
    for (const col of columns) {
      if (!existing.includes(col.name)) {
        const alter = `ALTER TABLE ${tableName} ADD COLUMN ${col.name} ${col.type}${col.defaultSql ? ` ${col.defaultSql}` : ""}`;
        db.exec(alter);
      }
    }
  } catch (error) {
    // If table doesn't exist yet, caller will create it below
  }
}

export function initializeDatabase() {
  try {
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
        waiver_signed_at DATETIME,
        waiver_version TEXT,
        email_opt_in INTEGER DEFAULT 1,
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
        coach_id INTEGER,
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

      -- Stripe integration tables
      CREATE TABLE IF NOT EXISTS stripe_customers (
        user_id INTEGER UNIQUE NOT NULL,
        stripe_customer_id TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER UNIQUE NOT NULL,
        stripe_subscription_id TEXT UNIQUE,
        plan_code TEXT,
        status TEXT,
        current_period_end DATETIME,
        delinquent_since DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS stripe_events (
        id TEXT PRIMARY KEY,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Inventory tables
      CREATE TABLE IF NOT EXISTS inventory_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sku TEXT UNIQUE,
        name TEXT NOT NULL,
        category TEXT,
        price REAL DEFAULT 0,
        quantity INTEGER DEFAULT 0,
        min_threshold INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS inventory_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        item_id INTEGER NOT NULL,
        delta INTEGER NOT NULL,
        reason TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (item_id) REFERENCES inventory_items(id)
      );

      -- Media table for uploads
      CREATE TABLE IF NOT EXISTS media (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        url TEXT NOT NULL,
        title TEXT,
        type TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      -- Online coaching products
      CREATE TABLE IF NOT EXISTS programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        program_type TEXT NOT NULL, -- one_time | subscription
        price_code TEXT UNIQUE NOT NULL,
        summary TEXT,
        active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS program_weeks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_id INTEGER NOT NULL,
        week_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(program_id, week_number),
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS program_days (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        week_id INTEGER NOT NULL,
        day_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        workout_description TEXT,
        youtube_url TEXT,
        is_rest_day INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(week_id, day_number),
        FOREIGN KEY (week_id) REFERENCES program_weeks(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_program_enrollments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        program_id INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, program_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (program_id) REFERENCES programs(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS user_program_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        day_id INTEGER NOT NULL,
        completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notes TEXT,
        UNIQUE(user_id, day_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (day_id) REFERENCES program_days(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS instagram_leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        full_name TEXT,
        instagram_handle TEXT,
        email TEXT,
        interest TEXT,
        source TEXT DEFAULT 'instagram',
        status TEXT DEFAULT 'new',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS dm_followup_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        lead_id INTEGER,
        platform TEXT DEFAULT 'instagram',
        recipient_handle TEXT,
        message_template TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        sent_at DATETIME,
        FOREIGN KEY (lead_id) REFERENCES instagram_leads(id) ON DELETE SET NULL
      );
    `);

    // Ensure columns exist for older DBs created by legacy code
    ensureColumns("classes", [
      { name: "day_of_week", type: "TEXT" },
      { name: "start_time", type: "TEXT" },
      { name: "end_time", type: "TEXT" },
      { name: "is_active", type: "INTEGER", defaultSql: "DEFAULT 1" },
      { name: "slug", type: "TEXT" },
      { name: "coach_id", type: "INTEGER" },
      { name: "coach_name", type: "TEXT" },
      { name: "active", type: "INTEGER", defaultSql: "DEFAULT 1" },
      { name: "image", type: "TEXT" },
      { name: "color", type: "TEXT" },
      { name: "updated_at", type: "DATETIME", defaultSql: "DEFAULT CURRENT_TIMESTAMP" },
    ]);
    ensureColumns("users", [
      { name: "waiver_signed_at", type: "DATETIME" },
      { name: "waiver_version", type: "TEXT" },
      { name: "email_opt_in", type: "INTEGER", defaultSql: "DEFAULT 1" },
      { name: "bio", type: "TEXT" },
      { name: "goal", type: "TEXT" },
      { name: "image", type: "TEXT" },
    ]);

    // Ensure auxiliary tables used by admin features exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS class_bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        class_instance_id INTEGER NOT NULL,
        booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'confirmed',
        payment_status TEXT DEFAULT 'pending',
        payment_method TEXT,
        payment_amount REAL,
        attended INTEGER DEFAULT 0,
        notes TEXT,
        cancelled_date DATETIME,
        cancellation_reason TEXT,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (class_instance_id) REFERENCES class_instances(id)
      );

      CREATE TABLE IF NOT EXISTS payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        booking_id INTEGER,
        amount REAL,
        payment_type TEXT,
        payment_method TEXT,
        description TEXT,
        status TEXT DEFAULT 'completed',
        payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `);

    const adminExists = db.prepare("SELECT id FROM users WHERE username = ?").get("admin");
    if (!adminExists) {
      const hashedAdmin = bcrypt.hashSync("admin123", 10);
      const expiry = new Date(Date.now() + 365 * 864e5).toISOString().split("T")[0];
      db.prepare(`
        INSERT INTO users (username, password, email, full_name, is_admin, membership_status, membership_expiry)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run("admin", hashedAdmin, "admin@sweatwithscott.com", "Admin User", 1, "admin", expiry);
    }

    seedDefaultScheduleIfEmpty();
    seedCoaches();
    seedMembershipPackages();
    seedSettings();
    seedPrograms();
    seedSampleUsers();
    replaceScheduleWithExactTemplate();
    enforceMinimalCatalog();
    ensureUpcomingInstances();

    console.log(`📂 Using DB file: ${dbPath}`);
    console.log("Database initialized successfully");
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    if (error instanceof Error) {
      console.error("❌ DB Init Error:", error.message);
    } else {
      console.error("❌ DB Init Error:", String(error));
    }
  }
}

function seedDefaultScheduleIfEmpty() {
  const alreadySeeded = db.prepare("SELECT COUNT(*) as c FROM classes").get() as { c: number };
  if ((alreadySeeded?.c ?? 0) > 0) return;
  db.prepare(`
    INSERT INTO classes (name, description, instructor, day_of_week, start_time, end_time, max_capacity, price, image, color, slug, is_active, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
  `).run(
    "Boxing Fundamentals",
    "Signature boxing fundamentals session.",
    "Coach Scott",
    "Monday",
    "18:00",
    "19:00",
    25,
    25,
    "/images/boxing-training.png",
    "#ef4444",
    "boxing-fundamentals-1",
  );
  generateClassInstances();
}

// If there are no upcoming class instances, attempt to backfill class weekly fields
// and generate a fresh 30-day instance set so calendars are never empty.
function ensureUpcomingInstances() {
  try {
    const upcoming = db.prepare("SELECT COUNT(*) as c FROM class_instances WHERE date BETWEEN date('now') AND date('now','+30 days')").get() as { c: number };
    if ((upcoming?.c ?? 0) > 0) return;
    generateClassInstances();
  } catch (err) {
    // swallow to avoid crashing startup
  }
}

// Hard reset classes and instances to match the exact weekly schedule provided by the user
function replaceScheduleWithExactTemplate() {
  try {
    db.prepare("DELETE FROM class_bookings").run();
    db.prepare(`DELETE FROM class_instances`).run();
    db.prepare(`DELETE FROM classes`).run();
    const classInfo = db.prepare(`
      INSERT INTO classes (name, description, instructor, day_of_week, start_time, end_time, max_capacity, price, image, color, slug, is_active, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
    `).run(
      "Boxing Fundamentals",
      "Signature boxing fundamentals session.",
      "Coach Scott",
      "Monday",
      "18:00",
      "19:00",
      25,
      25,
      "/images/boxing-training.png",
      "#ef4444",
      "boxing-fundamentals-1",
    );
    const classId = Number(classInfo.lastInsertRowid);
    db.prepare(`
      INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, status)
      VALUES (?, date('now','+1 day'), ?, ?, ?, ?, 'scheduled')
    `).run(classId, "18:00", "19:00", "Coach Scott", 25);
  } catch (error) {
    // swallow; non-critical
  }
}

function seedCoaches() {
  if (db.prepare("SELECT COUNT(*) as c FROM coaches").get().c > 0) return;
  const insertCoach = db.prepare(`
    INSERT INTO coaches (slug, name, bio, certifications, image)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertCoach.run(
    "scott-trainer", 
    "Scott Wilson", 
    "Lead coach for Sweat with Scott online and in-person training.", 
    "Certified Boxing Coach", 
    "/images/coach-scott.png"
  );
}

function seedMembershipPackages() {
  if (db.prepare("SELECT COUNT(*) as c FROM membership_packages").get().c > 0) return;
  const insertPkg = db.prepare(`
    INSERT INTO membership_packages (name, description, price, features)
    VALUES (?, ?, ?, ?)
  `);
  insertPkg.run("8-Week Boxing Reset", "Structured 8-week online transformation", 197, JSON.stringify(["3 guided workouts weekly", "Video coaching library", "Progress checkpoints"]));
}

function seedSettings() {
  if (db.prepare("SELECT COUNT(*) as c FROM site_settings").get().c > 0) return;
  const insertSetting = db.prepare(`INSERT INTO site_settings (key, value) VALUES (?, ?)`);
  insertSetting.run("hero_title", "Sweat with Scott");
  insertSetting.run("hero_subtitle", "8-week boxing reset and daily online coaching.");
  insertSetting.run("hero_bg", "/images/frontpic.png");
}

function seedSampleUsers() {
  if (db.prepare("SELECT COUNT(*) as c FROM users WHERE is_admin = 0").get().c > 0) return;
  const insertUser = db.prepare(`
    INSERT INTO users (username, password, email, full_name, phone, membership_type, membership_expiry)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  [["john_doe", "John Doe"], ["jane_smith", "Jane Smith"]].forEach(([username, fullname]) => {
    const hashed = bcrypt.hashSync("password123", 10);
    const expiry = new Date(Date.now() + 30 * 864e5).toISOString().split("T")[0];
    insertUser.run(username, hashed, `${username}@example.com`, fullname, "555-0100", "monthly", expiry);
  });
}

function seedPrograms() {
  try {
    const count = db.prepare("SELECT COUNT(*) as c FROM programs").get() as { c: number };
    if ((count?.c ?? 0) > 0) return;

    const insertProgram = db.prepare(`
      INSERT INTO programs (slug, title, program_type, price_code, summary)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertProgram.run("8-week-boxing-reset", "8-Week Boxing Reset", "one_time", "EIGHT_WEEK_RESET", "A guided 8-week boxing transformation.");
    const programs = db.prepare("SELECT id FROM programs").all() as Array<{ id: number }>;
    const insertWeek = db.prepare(`INSERT OR IGNORE INTO program_weeks (program_id, week_number, title) VALUES (?, ?, ?)`);
    const insertDay = db.prepare(`
      INSERT OR IGNORE INTO program_days (week_id, day_number, title, workout_description, youtube_url, is_rest_day)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const program of programs) {
      insertWeek.run(program.id, 1, "Week 1");
      const week = db.prepare("SELECT id FROM program_weeks WHERE program_id = ? AND week_number = 1").get(program.id) as { id: number } | undefined;
      if (week?.id) {
        insertDay.run(week.id, 1, "Technique Day", "Footwork, guard, and jab mechanics.", "https://www.youtube.com/embed/dQw4w9WgXcQ", 0);
      }
    }
  } catch (error) {
    console.error("seedPrograms error:", error);
  }
}

function enforceMinimalCatalog() {
  try {
    // Keep one class and one upcoming instance
    const keepClass = db.prepare("SELECT id FROM classes ORDER BY id ASC LIMIT 1").get() as { id: number } | undefined;
    if (keepClass?.id) {
      db.prepare(`
        DELETE FROM class_bookings
        WHERE class_instance_id IN (SELECT id FROM class_instances WHERE class_id != ?)
      `).run(keepClass.id);
      db.prepare("DELETE FROM class_instances WHERE class_id != ?").run(keepClass.id);
      db.prepare("DELETE FROM classes WHERE id != ?").run(keepClass.id);
      db.prepare(`
        UPDATE classes
        SET name = ?, description = ?, instructor = ?, coach_name = ?, day_of_week = ?, start_time = ?, end_time = ?, slug = ?, image = ?, max_capacity = ?, price = ?, is_active = 1, active = 1
        WHERE id = ?
      `).run(
        "Boxing Fundamentals",
        "Signature boxing fundamentals session.",
        "Coach Scott",
        "Scott Wilson",
        "Monday",
        "18:00",
        "19:00",
        "boxing-fundamentals-1",
        "/images/boxing-training.png",
        25,
        25,
        keepClass.id,
      );
      db.prepare("DELETE FROM class_instances WHERE class_id = ?").run(keepClass.id);
      db.prepare(`
        INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, status)
        VALUES (?, date('now','+1 day'), ?, ?, ?, ?, 'scheduled')
      `).run(keepClass.id, "18:00", "19:00", "Coach Scott", 25);
    }

    // Keep one coach
    const keepCoach = db.prepare("SELECT id FROM coaches ORDER BY id ASC LIMIT 1").get() as { id: number } | undefined;
    if (keepCoach?.id) {
      db.prepare("DELETE FROM coaches WHERE id != ?").run(keepCoach.id);
      db.prepare(`
        UPDATE coaches
        SET slug = ?, name = ?, bio = ?, certifications = ?, image = ?
        WHERE id = ?
      `).run(
        "scott-trainer",
        "Scott Wilson",
        "Lead coach for Sweat with Scott online and in-person training.",
        "Certified Boxing Coach",
        "/images/coach-scott.png",
        keepCoach.id,
      );
    }

    // Keep one membership package
    const keepPackage = db.prepare("SELECT id FROM membership_packages ORDER BY id ASC LIMIT 1").get() as { id: number } | undefined;
    if (keepPackage?.id) {
      db.prepare("DELETE FROM membership_packages WHERE id != ?").run(keepPackage.id);
      db.prepare(`
        UPDATE membership_packages
        SET name = ?, description = ?, price = ?, features = ?
        WHERE id = ?
      `).run(
        "8-Week Boxing Reset",
        "Structured 8-week online transformation",
        197,
        JSON.stringify(["3 guided workouts weekly", "Video coaching library", "Progress checkpoints"]),
        keepPackage.id,
      );
    }

    // Keep one program with one week/day
    const keepProgram = db.prepare("SELECT id FROM programs ORDER BY id ASC LIMIT 1").get() as { id: number } | undefined;
    if (keepProgram?.id) {
      db.prepare("DELETE FROM programs WHERE id != ?").run(keepProgram.id);
      db.prepare(`
        UPDATE programs
        SET slug = ?, title = ?, program_type = ?, price_code = ?, summary = ?, active = 1
        WHERE id = ?
      `).run(
        "8-week-boxing-reset",
        "8-Week Boxing Reset",
        "one_time",
        "EIGHT_WEEK_RESET",
        "A guided 8-week boxing transformation.",
        keepProgram.id,
      );
      const keepWeek = db.prepare("SELECT id FROM program_weeks WHERE program_id = ? ORDER BY week_number ASC LIMIT 1").get(keepProgram.id) as { id: number } | undefined;
      if (keepWeek?.id) {
        db.prepare("DELETE FROM program_weeks WHERE program_id = ? AND id != ?").run(keepProgram.id, keepWeek.id);
        db.prepare("UPDATE program_weeks SET week_number = 1, title = ? WHERE id = ?").run("Week 1", keepWeek.id);
        const keepDay = db.prepare("SELECT id FROM program_days WHERE week_id = ? ORDER BY day_number ASC LIMIT 1").get(keepWeek.id) as { id: number } | undefined;
        if (keepDay?.id) {
          db.prepare("DELETE FROM program_days WHERE week_id = ? AND id != ?").run(keepWeek.id, keepDay.id);
          db.prepare(`
            UPDATE program_days
            SET day_number = 1, title = ?, workout_description = ?, youtube_url = ?, is_rest_day = 0
            WHERE id = ?
          `).run("Technique Day", "Footwork, guard, and jab mechanics.", "https://www.youtube.com/embed/dQw4w9WgXcQ", keepDay.id);
        }
      }
    }
  } catch (error) {
    console.error("enforceMinimalCatalog error:", error);
  }
}

  function generateClassInstances() {
  try {
    const classes = db.prepare("SELECT * FROM classes WHERE is_active = 1 OR active = 1").all() as ClassRecord[];
    const today = new Date();
    db.prepare("DELETE FROM class_instances WHERE date > date('now')").run();

    for (let i = 0; i < 30; i++) {
      const currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      const dayName = currentDate.toLocaleDateString("en-US", { weekday: "long" });
      const dateString = currentDate.toISOString().split("T")[0];
      const dayClasses = classes.filter((cls) => cls.day_of_week === dayName);

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
            cls.max_capacity ?? 30,
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
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
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
initializeDatabase();

// Database operations
export const dbOperations = {
  // Users
  getUserByUsername: (username: string): UserRecord | undefined => {
    try {
      return db.prepare("SELECT * FROM users WHERE username = ? LIMIT 1").get(username) as UserRecord | undefined;
    } catch (error) {
      console.error("getUserByUsername error:", error);
      return undefined;
    }
  },
  getUserById: (id: number): UserRecord | undefined => {
    try {
      return db.prepare("SELECT * FROM users WHERE id = ? LIMIT 1").get(id) as UserRecord | undefined;
    } catch (error) {
      console.error("getUserById error:", error);
      return undefined;
    }
  },
  getUserByEmail: (email: string): UserRecord | undefined => {
    try {
      return db.prepare("SELECT * FROM users WHERE email = ? LIMIT 1").get(email) as UserRecord | undefined;
    } catch (error) {
      console.error("getUserByEmail error:", error);
      return undefined;
    }
  },
  createUser: (data: { username: string; password: string; email?: string; fullName?: string }): { lastInsertRowid: number } => {
    const stmt = db.prepare(
      "INSERT INTO users (username, password, email, full_name, is_admin, membership_status) VALUES (?, ?, ?, ?, 0, 'active')"
    );
    const info = stmt.run(data.username, data.password, data.email ?? null, data.fullName ?? null);
    return { lastInsertRowid: Number(info.lastInsertRowid) };
  },
  updateUser: (userId: number, data: Record<string, unknown>): void => {
    const allowed = new Set([
      "username",
      "password",
      "email",
      "full_name",
      "phone",
      "membership_type",
      "membership_status",
      "membership_expiry",
      "waiver_signed_at",
      "waiver_version",
      "email_opt_in",
      "bio",
      "goal",
      "image",
    ]);
    const entries = Object.entries(data).filter(([k]) => allowed.has(k));
    if (entries.length === 0) return;
    const sets = entries.map(([k]) => `${k} = ?`).join(", ");
    const values = entries.map(([, v]) => v);
    db.prepare(`UPDATE users SET ${sets} WHERE id = ?`).run(...values, userId);
  },

  getAllClasses: (): ClassRecord[] => {
    try {
      return db.prepare("SELECT * FROM classes WHERE is_active = 1 ORDER BY name").all() as ClassRecord[];
    } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
      if (error instanceof Error) {
        console.error("Error getting classes:", error.message);
      } else {
        console.error("Error getting classes:", String(error));
      }
      return [];
    }
  },
  getAllCoaches: (): CoachRecord[] => {
    try {
      return db.prepare("SELECT * FROM coaches ORDER BY name").all() as CoachRecord[];
    } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
      if (error instanceof Error) {
        console.error("Error getting coaches:", error.message);
      } else {
        console.error("Error getting coaches:", String(error));
      }
      return [];
    }
  },
  getAllClassInstances: () => {
    try {
      return db.prepare("SELECT * FROM class_instances").all();
    } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
      if (error instanceof Error) {
        console.error("Error getting class instances:", error.message);
      } else {
        console.error("Error getting class instances:", String(error));
      }
      return [];
    }
  },

  // Bookings
  getUserBookings: (userId: number) => {
    try {
      return db
        .prepare(
          `SELECT cb.id, cb.class_instance_id, cb.status as booking_status, cb.payment_status, cb.payment_method,
                  cb.booking_date, ci.date, ci.start_time, ci.end_time, c.name as class_name
           FROM class_bookings cb
           JOIN class_instances ci ON ci.id = cb.class_instance_id
           JOIN classes c ON c.id = ci.class_id
           WHERE cb.user_id = ?
           ORDER BY ci.date DESC, ci.start_time DESC`
        )
        .all(userId);
    } catch (error) {
      console.error("getUserBookings error:", error);
      return [];
    }
  },
  getUserBookingForClass: (userId: number, classInstanceId: number) => {
    try {
      return db
        .prepare(
          `SELECT * FROM class_bookings WHERE user_id = ? AND class_instance_id = ? LIMIT 1`
        )
        .get(userId, classInstanceId);
    } catch (error) {
      console.error("getUserBookingForClass error:", error);
      return undefined;
    }
  },
  getUserBookingOverlap: (
    userId: number,
    date: string,
    startTime: string,
    endTime: string
  ) => {
    try {
      return db
        .prepare(
          `SELECT cb.* FROM class_bookings cb
           JOIN class_instances ci ON ci.id = cb.class_instance_id
           WHERE cb.user_id = ? AND ci.date = ? AND cb.status = 'confirmed'
             AND NOT (ci.end_time <= ? OR ci.start_time >= ?)
           LIMIT 1`
        )
        .get(userId, date, startTime, endTime);
    } catch (error) {
      console.error("getUserBookingOverlap error:", error);
      return undefined;
    }
  },
  getClassInstanceById: (id: number) => {
    try {
      return db.prepare("SELECT * FROM class_instances WHERE id = ?").get(id);
    } catch (error) {
      console.error("getClassInstanceById error:", error);
      return undefined;
    }
  },
  bookClass: (userId: number, classInstanceId: number): number => {
    const insert = db.prepare(
      `INSERT INTO class_bookings (user_id, class_instance_id, status, payment_status)
       VALUES (?, ?, 'confirmed', 'pending')`
    );
    const info = insert.run(userId, classInstanceId);
    db.prepare(
      `UPDATE class_instances SET current_bookings = current_bookings + 1 WHERE id = ?`
    ).run(classInstanceId);
    return Number(info.lastInsertRowid);
  },
  waitlistClass: (userId: number, classInstanceId: number) => {
    const insert = db.prepare(
      `INSERT INTO class_bookings (user_id, class_instance_id, status, payment_status)
       VALUES (?, ?, 'waitlist', 'pending')`
    );
    const info = insert.run(userId, classInstanceId);
    return { lastInsertRowid: Number(info.lastInsertRowid) };
  },
  cancelBooking: (userId: number, classInstanceId: number, reason?: string) => {
    const existing = db
      .prepare(
        `SELECT status FROM class_bookings WHERE user_id = ? AND class_instance_id = ? LIMIT 1`
      )
      .get(userId, classInstanceId) as { status?: string } | undefined;
    if (!existing) return false;
    db.prepare(
      `UPDATE class_bookings SET status = 'cancelled', cancelled_date = CURRENT_TIMESTAMP, cancellation_reason = ?
       WHERE user_id = ? AND class_instance_id = ?`
    ).run(reason ?? null, userId, classInstanceId);
    if (existing.status === 'confirmed') {
      db.prepare(
        `UPDATE class_instances SET current_bookings = MAX(current_bookings - 1, 0) WHERE id = ?`
      ).run(classInstanceId);
    }
    return true;
  },
  promoteWaitlistedUser: (classInstanceId: number) => {
    const waitlisted = db
      .prepare(
        `SELECT id, user_id FROM class_bookings WHERE class_instance_id = ? AND status = 'waitlist' ORDER BY booking_date ASC LIMIT 1`
      )
      .get(classInstanceId) as { id: number; user_id: number } | undefined;
    if (!waitlisted) return undefined;
    db.prepare(`UPDATE class_bookings SET status = 'confirmed' WHERE id = ?`).run(waitlisted.id);
    db.prepare(
      `UPDATE class_instances SET current_bookings = current_bookings + 1 WHERE id = ?`
    ).run(classInstanceId);
    return waitlisted.user_id;
  },

  // Admin and reporting helpers
  getAllUsers: (): UserRecord[] => {
    try {
      return db.prepare("SELECT * FROM users ORDER BY id DESC").all() as UserRecord[];
    } catch (error) {
      console.error("getAllUsers error:", error);
      return [];
    }
  },
  getGymStats: () => {
    try {
      const users = db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number };
      const classes = db.prepare("SELECT COUNT(*) as c FROM classes").get() as { c: number };
      const upcoming = db
        .prepare("SELECT COUNT(*) as c FROM class_instances WHERE date >= date('now')")
        .get() as { c: number };
      const bookings = db.prepare("SELECT COUNT(*) as c FROM class_bookings").get() as { c: number };
      return {
        totalMembers: users.c,
        totalClasses: classes.c,
        upcomingClasses: upcoming.c,
        totalBookings: bookings.c,
      };
    } catch (error) {
      console.error("getGymStats error:", error);
      return { totalMembers: 0, totalClasses: 0, upcomingClasses: 0, totalBookings: 0 };
    }
  },
  getAllBookings: () => {
    try {
      return db
        .prepare(
          `SELECT cb.*, u.username, u.email, ci.date, ci.start_time, ci.end_time
           FROM class_bookings cb
           JOIN users u ON u.id = cb.user_id
           JOIN class_instances ci ON ci.id = cb.class_instance_id`
        )
        .all();
    } catch (error) {
      console.error("getAllBookings error:", error);
      return [];
    }
  },
  getLegacyBookings: () => {
    try {
      // Optional: fallback to legacy 'bookings' table if exists
      return db.prepare("SELECT name, class_name, class_date as date FROM bookings").all();
    } catch {
      return [];
    }
  },
  getClassRoster: (classInstanceId: number) => {
    try {
      return db
        .prepare(
          `SELECT cb.id, cb.user_id, cb.status as booking_status, cb.payment_status, cb.payment_method,
                  cb.booking_date, cb.attended, cb.notes,
                  u.username, u.email, u.phone
           FROM class_bookings cb
           JOIN users u ON u.id = cb.user_id
           WHERE cb.class_instance_id = ?
           ORDER BY cb.booking_date ASC`
        )
        .all(classInstanceId);
    } catch (error) {
      console.error("getClassRoster error:", error);
      return [];
    }
  },
  getClassWithAttendees: (classInstanceId: number) => {
    try {
      return db
        .prepare(
          `SELECT cb.id, cb.user_id, u.username, u.email, cb.status, cb.payment_status
           FROM class_bookings cb
           JOIN users u ON u.id = cb.user_id
           WHERE cb.class_instance_id = ?
           ORDER BY cb.booking_date ASC`
        )
        .all(classInstanceId);
    } catch (error) {
      console.error("getClassWithAttendees error:", error);
      return [];
    }
  },
  getClassRostersByDate: (date: string) => {
    try {
      return db
        .prepare(
          `SELECT ci.id as class_instance_id, c.name as class_name, ci.date, ci.start_time, ci.end_time,
                  ci.max_capacity, ci.current_bookings,
                  COALESCE(c.instructor, '') as coach
           FROM class_instances ci
           JOIN classes c ON c.id = ci.class_id
           WHERE ci.date = ?
           ORDER BY ci.start_time ASC`
        )
        .all(date);
    } catch (error) {
      console.error("getClassRostersByDate error:", error);
      return [];
    }
  },
  getOutstandingPayments: () => {
    try {
      return db
        .prepare(
          `SELECT cb.*, u.username, u.email FROM class_bookings cb
           JOIN users u ON u.id = cb.user_id
           WHERE cb.payment_status = 'pending' AND cb.status = 'confirmed'`
        )
        .all();
    } catch (error) {
      console.error("getOutstandingPayments error:", error);
      return [];
    }
  },

  // Inventory operations
  getInventory: () => {
    try {
      return db.prepare(`SELECT * FROM inventory_items ORDER BY category, name`).all();
    } catch (error) {
      console.error("getInventory error:", error);
      return [];
    }
  },
  getInventoryLowStock: () => {
    try {
      return db.prepare(`SELECT * FROM inventory_items WHERE quantity <= min_threshold ORDER BY name`).all();
    } catch (error) {
      return [];
    }
  },
  upsertInventoryItem: (data: { id?: number; sku?: string; name: string; category?: string; price?: number; quantity?: number; min_threshold?: number }) => {
    if (data.id) {
      db.prepare(`UPDATE inventory_items SET sku = COALESCE(?, sku), name = COALESCE(?, name), category = COALESCE(?, category), price = COALESCE(?, price), quantity = COALESCE(?, quantity), min_threshold = COALESCE(?, min_threshold), updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(
        data.sku ?? null,
        data.name ?? null,
        data.category ?? null,
        data.price ?? null,
        data.quantity ?? null,
        data.min_threshold ?? null,
        data.id,
      );
      return { id: data.id };
    }
    const info = db.prepare(`INSERT INTO inventory_items (sku, name, category, price, quantity, min_threshold) VALUES (?, ?, ?, ?, ?, ?)`).run(
      data.sku ?? null,
      data.name,
      data.category ?? null,
      data.price ?? 0,
      data.quantity ?? 0,
      data.min_threshold ?? 0,
    );
    return { id: Number(info.lastInsertRowid) };
  },
  addInventoryMovement: (itemId: number, delta: number, reason?: string) => {
    db.prepare(`INSERT INTO inventory_movements (item_id, delta, reason) VALUES (?, ?, ?)`)
      .run(itemId, delta, reason ?? null);
    db.prepare(`UPDATE inventory_items SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(delta, itemId);
  },

  // Stripe: customers
  getStripeCustomerByUserId: (userId: number): { stripe_customer_id: string } | undefined => {
    try {
      return db
        .prepare(`SELECT stripe_customer_id FROM stripe_customers WHERE user_id = ? LIMIT 1`)
        .get(userId) as { stripe_customer_id: string } | undefined;
    } catch (error) {
      console.error("getStripeCustomerByUserId error:", error);
      return undefined;
    }
  },
  insertStripeCustomer: (userId: number, stripeCustomerId: string) => {
    db.prepare(`INSERT OR REPLACE INTO stripe_customers (user_id, stripe_customer_id) VALUES (?, ?)`)
      .run(userId, stripeCustomerId);
  },

  // Stripe: subscriptions
  getSubscriptionByUserId: (userId: number) => {
    try {
      return db
        .prepare(`SELECT * FROM subscriptions WHERE user_id = ? LIMIT 1`)
        .get(userId);
    } catch (error) {
      console.error("getSubscriptionByUserId error:", error);
      return undefined;
    }
  },
  getSubscriptionByStripeId: (stripeSubscriptionId: string) => {
    try {
      return db
        .prepare(`SELECT * FROM subscriptions WHERE stripe_subscription_id = ? LIMIT 1`)
        .get(stripeSubscriptionId);
    } catch (error) {
      console.error("getSubscriptionByStripeId error:", error);
      return undefined;
    }
  },
  upsertSubscription: (data: {
    userId: number;
    stripeSubscriptionId: string;
    planCode?: string | null;
    status?: string | null;
    currentPeriodEnd?: string | null;
  }) => {
    const existing = dbOperations.getSubscriptionByUserId(data.userId);
    if (!existing) {
      db.prepare(
        `INSERT INTO subscriptions (user_id, stripe_subscription_id, plan_code, status, current_period_end)
         VALUES (?, ?, ?, ?, ?)`
      ).run(
        data.userId,
        data.stripeSubscriptionId,
        data.planCode ?? null,
        data.status ?? null,
        data.currentPeriodEnd ?? null,
      );
    } else {
      db.prepare(
        `UPDATE subscriptions SET stripe_subscription_id = ?, plan_code = COALESCE(?, plan_code),
         status = COALESCE(?, status), current_period_end = COALESCE(?, current_period_end), updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ?`
      ).run(
        data.stripeSubscriptionId,
        data.planCode ?? null,
        data.status ?? null,
        data.currentPeriodEnd ?? null,
        data.userId,
      );
    }
  },
  setSubscriptionStatus: (stripeSubscriptionId: string, status: string, currentPeriodEnd?: string | null) => {
    db.prepare(
      `UPDATE subscriptions SET status = ?, current_period_end = COALESCE(?, current_period_end), updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = ?`
    ).run(status, currentPeriodEnd ?? null, stripeSubscriptionId);
  },
  setDelinquent: (stripeSubscriptionId: string, delinquentSinceISO?: string) => {
    db.prepare(
      `UPDATE subscriptions SET status = 'past_due', delinquent_since = COALESCE(?, delinquent_since), updated_at = CURRENT_TIMESTAMP
       WHERE stripe_subscription_id = ?`
    ).run(delinquentSinceISO ?? new Date().toISOString(), stripeSubscriptionId);
  },
  clearDelinquent: (stripeSubscriptionId: string) => {
    db.prepare(
      `UPDATE subscriptions SET delinquent_since = NULL, updated_at = CURRENT_TIMESTAMP WHERE stripe_subscription_id = ?`
    ).run(stripeSubscriptionId);
  },

  // Stripe: idempotency
  hasProcessedStripeEvent: (eventId: string): boolean => {
    try {
      const row = db.prepare(`SELECT 1 FROM stripe_events WHERE id = ? LIMIT 1`).get(eventId) as { 1?: number } | undefined;
      return !!row;
    } catch {
      return false;
    }
  },
  markProcessedStripeEvent: (eventId: string) => {
    try {
      db.prepare(`INSERT OR IGNORE INTO stripe_events (id) VALUES (?)`).run(eventId);
    } catch (error) {
      // ignore
    }
  },
  getCurrentClasses: () => {
    try {
      return db
        .prepare(
          `SELECT ci.*, c.name as class_name FROM class_instances ci
           JOIN classes c ON c.id = ci.class_id
           WHERE ci.date = date('now') ORDER BY ci.start_time`
        )
        .all();
    } catch (error) {
      console.error("getCurrentClasses error:", error);
      return [];
    }
  },
  getFutureClasses: () => {
    try {
      return db
        .prepare(
          `SELECT ci.*, c.name as class_name FROM class_instances ci
           JOIN classes c ON c.id = ci.class_id
           WHERE ci.date > date('now') ORDER BY ci.date, ci.start_time LIMIT 100`
        )
        .all();
    } catch (error) {
      console.error("getFutureClasses error:", error);
      return [];
    }
  },
  getPastClasses: () => {
    try {
      return db
        .prepare(
          `SELECT ci.*, c.name as class_name FROM class_instances ci
           JOIN classes c ON c.id = ci.class_id
           WHERE ci.date < date('now') ORDER BY ci.date DESC, ci.start_time DESC LIMIT 100`
        )
        .all();
    } catch (error) {
      console.error("getPastClasses error:", error);
      return [];
    }
  },
  createClassInstance: (
    classId: number,
    date: string,
    startTime: string,
    endTime: string,
    maxCapacity: number
  ) => {
    const info = db
      .prepare(
        `INSERT INTO class_instances (class_id, date, start_time, end_time, max_capacity)
         VALUES (?, ?, ?, ?, ?)`
      )
      .run(classId, date, startTime, endTime, maxCapacity);
    return { lastInsertRowid: Number(info.lastInsertRowid) };
  },
  markPaymentPaid: (bookingId: number, method: string) => {
    db.prepare(
      `UPDATE class_bookings SET payment_status = 'paid', payment_method = ? WHERE id = ?`
    ).run(method, bookingId);
    return { success: true };
  },
  markAttendance: (bookingId: number, attended: boolean, notes?: string) => {
    db.prepare(
      `UPDATE class_bookings SET attended = ?, attendance_marked_at = CURRENT_TIMESTAMP, notes = ? WHERE id = ?`
    ).run(attended ? 1 : 0, notes ?? null, bookingId);
    return { success: true };
  },

  // Content
  getMembershipPackages: () => {
    try {
      return db.prepare("SELECT * FROM membership_packages ORDER BY price").all();
    } catch (error) {
      console.error("getMembershipPackages error:", error);
      return [];
    }
  },
  getPrograms: () => {
    try {
      return db.prepare(`SELECT * FROM programs WHERE active = 1 ORDER BY id ASC`).all();
    } catch (error) {
      console.error("getPrograms error:", error);
      return [];
    }
  },
  getProgramByPriceCode: (priceCode: string) => {
    try {
      return db.prepare(`SELECT * FROM programs WHERE price_code = ? LIMIT 1`).get(priceCode);
    } catch (error) {
      console.error("getProgramByPriceCode error:", error);
      return undefined;
    }
  },
  enrollUserInProgram: (userId: number, programId: number, status = "active") => {
    try {
      db.prepare(`
        INSERT INTO user_program_enrollments (user_id, program_id, status)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, program_id) DO UPDATE SET status = excluded.status
      `).run(userId, programId, status);
      return true;
    } catch (error) {
      console.error("enrollUserInProgram error:", error);
      return false;
    }
  },
  getUserProgramEnrollments: (userId: number) => {
    try {
      return db.prepare(`
        SELECT upe.id, upe.status, upe.enrolled_at, p.id as program_id, p.slug, p.title, p.program_type, p.price_code, p.summary
        FROM user_program_enrollments upe
        JOIN programs p ON p.id = upe.program_id
        WHERE upe.user_id = ?
        ORDER BY upe.enrolled_at DESC
      `).all(userId);
    } catch (error) {
      console.error("getUserProgramEnrollments error:", error);
      return [];
    }
  },
  getProgramDaysBySlugForUser: (userId: number, slug: string) => {
    try {
      return db.prepare(`
        SELECT
          pd.id,
          pw.week_number,
          pd.day_number,
          pd.title,
          pd.workout_description,
          pd.youtube_url,
          pd.is_rest_day,
          CASE WHEN upp.id IS NULL THEN 0 ELSE 1 END as completed
        FROM programs p
        JOIN user_program_enrollments upe ON upe.program_id = p.id AND upe.user_id = ? AND upe.status = 'active'
        JOIN program_weeks pw ON pw.program_id = p.id
        JOIN program_days pd ON pd.week_id = pw.id
        LEFT JOIN user_program_progress upp ON upp.day_id = pd.id AND upp.user_id = ?
        WHERE p.slug = ?
        ORDER BY pw.week_number ASC, pd.day_number ASC
      `).all(userId, userId, slug);
    } catch (error) {
      console.error("getProgramDaysBySlugForUser error:", error);
      return [];
    }
  },
  markProgramDayCompleted: (userId: number, dayId: number, notes?: string) => {
    try {
      db.prepare(`
        INSERT INTO user_program_progress (user_id, day_id, notes)
        VALUES (?, ?, ?)
        ON CONFLICT(user_id, day_id) DO UPDATE SET completed_at = CURRENT_TIMESTAMP, notes = COALESCE(excluded.notes, user_program_progress.notes)
      `).run(userId, dayId, notes ?? null);
      return true;
    } catch (error) {
      console.error("markProgramDayCompleted error:", error);
      return false;
    }
  },
  getProgramProgressSummary: (userId: number, slug: string) => {
    try {
      return db.prepare(`
        SELECT
          COUNT(pd.id) as total_days,
          SUM(CASE WHEN upp.id IS NULL THEN 0 ELSE 1 END) as completed_days
        FROM programs p
        JOIN user_program_enrollments upe ON upe.program_id = p.id AND upe.user_id = ? AND upe.status = 'active'
        JOIN program_weeks pw ON pw.program_id = p.id
        JOIN program_days pd ON pd.week_id = pw.id
        LEFT JOIN user_program_progress upp ON upp.day_id = pd.id AND upp.user_id = ?
        WHERE p.slug = ?
      `).get(userId, userId, slug) as { total_days: number; completed_days: number } | undefined;
    } catch (error) {
      console.error("getProgramProgressSummary error:", error);
      return { total_days: 0, completed_days: 0 };
    }
  },
  insertInstagramLead: (data: { fullName?: string; instagramHandle?: string; email?: string; interest?: string; source?: string }) => {
    const info = db.prepare(`
      INSERT INTO instagram_leads (full_name, instagram_handle, email, interest, source)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.fullName ?? null, data.instagramHandle ?? null, data.email ?? null, data.interest ?? null, data.source ?? "instagram");
    return { id: Number(info.lastInsertRowid) };
  },
  createDmFollowupTask: (data: { leadId?: number; recipientHandle?: string; messageTemplate?: string; platform?: string; status?: string }) => {
    const info = db.prepare(`
      INSERT INTO dm_followup_queue (lead_id, platform, recipient_handle, message_template, status)
      VALUES (?, ?, ?, ?, ?)
    `).run(data.leadId ?? null, data.platform ?? "instagram", data.recipientHandle ?? null, data.messageTemplate ?? null, data.status ?? "pending");
    return { id: Number(info.lastInsertRowid) };
  },
  getDmFollowupQueue: () => {
    try {
      return db.prepare(`
        SELECT q.*, l.full_name, l.instagram_handle, l.email, l.interest
        FROM dm_followup_queue q
        LEFT JOIN instagram_leads l ON l.id = q.lead_id
        ORDER BY q.created_at DESC
      `).all();
    } catch {
      return [];
    }
  },
  updateDmFollowupStatus: (id: number, status: string) => {
    db.prepare(`
      UPDATE dm_followup_queue
      SET status = ?, sent_at = CASE WHEN ? = 'sent' THEN CURRENT_TIMESTAMP ELSE sent_at END
      WHERE id = ?
    `).run(status, status, id);
  },
  // Media operations
  getMedia: () => {
    try {
      return db.prepare(`SELECT id, url, title, type, created_at FROM media ORDER BY created_at DESC`).all();
    } catch {
      return [] as Array<{ id: number; url: string; title?: string; type?: string; category?: string }>;
    }
  },
  getMediaById: (id: number) => {
    try { return db.prepare(`SELECT id, url, title, type FROM media WHERE id = ?`).get(id); } catch { return undefined; }
  },
  insertMedia: (data: { url: string; title?: string; type?: string }) => {
    const info = db.prepare(`INSERT INTO media (url, title, type) VALUES (?, ?, ?)`)
      .run(data.url, data.title ?? null, data.type ?? null);
    return { id: Number(info.lastInsertRowid) };
  },
  deleteMedia: (id: number) => {
    try { db.prepare(`DELETE FROM media WHERE id = ?`).run(id); } catch {}
  },
};

export default db;
