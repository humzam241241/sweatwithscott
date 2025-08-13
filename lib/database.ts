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
      `).run("admin", hashedAdmin, "admin@cavegym.com", "Admin User", 1, "admin", expiry);
    }

    // Seed a sensible default schedule only if the DB is empty, so admin edits persist
    seedDefaultScheduleIfEmpty();
    seedCoaches();
    seedMembershipPackages();
    seedSettings();
    seedSampleUsers();
  ensureUpcomingInstances();

    // Replace any existing schedule with the exact requested weekly template
    replaceScheduleWithExactTemplate();

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
  // Only seed the default weekly classes once on a new database
  const alreadySeeded = db.prepare("SELECT COUNT(*) as c FROM classes").get() as { c: number };
  if ((alreadySeeded?.c ?? 0) > 0) return;

  const capacities: Record<string, number> = {
    Bootcamp: 30,
    "Boxing Tech": 30,
    "Junior Jabbers (6-12 yr)": 15,
    "Strength & Conditioning": 30,
    "Beginner Boxing": 30,
    Sparring: 20,
    "Open Gym": 9999,
  };

  // Rich weekly template to populate the public/admin schedules by default
  const schedule: Array<{ day: string; time: string; name: string; description?: string; color?: string }> = [
    // Sunday
    { day: "Sunday", time: "20:00", name: "Strength & Conditioning", description: "Evening conditioning session.", color: "#f59e0b" },
    // Monday
    { day: "Monday", time: "08:00", name: "Bootcamp", description: "Morning Bootcamp.", color: "#ef4444" },
    { day: "Monday", time: "12:00", name: "Bootcamp", description: "Midday Bootcamp.", color: "#ef4444" },
    { day: "Monday", time: "17:00", name: "Boxing Tech", description: "Technical boxing skills.", color: "#3b82f6" },
    { day: "Monday", time: "18:00", name: "Bootcamp", description: "Evening Bootcamp.", color: "#ef4444" },
    { day: "Monday", time: "19:00", name: "Boxing Tech", description: "Technical boxing skills.", color: "#3b82f6" },
    { day: "Monday", time: "20:00", name: "Open Gym", description: "Open gym time.", color: "#22d3ee" },
    // Tuesday
    { day: "Tuesday", time: "08:00", name: "Bootcamp", description: "Morning Bootcamp.", color: "#ef4444" },
    { day: "Tuesday", time: "17:00", name: "Bootcamp", description: "After-work Bootcamp.", color: "#ef4444" },
    { day: "Tuesday", time: "18:00", name: "Junior Jabbers (6-12 yr)", description: "Kids fundamentals.", color: "#22c55e" },
    { day: "Tuesday", time: "19:00", name: "Boxing Tech", description: "Technical boxing skills.", color: "#3b82f6" },
    { day: "Tuesday", time: "20:00", name: "Open Gym", description: "Open gym time.", color: "#22d3ee" },
    // Wednesday
    { day: "Wednesday", time: "08:00", name: "Bootcamp", description: "Morning Bootcamp.", color: "#ef4444" },
    { day: "Wednesday", time: "12:00", name: "Bootcamp", description: "Midday Bootcamp.", color: "#ef4444" },
    { day: "Wednesday", time: "19:00", name: "Strength & Conditioning", description: "Power and endurance.", color: "#f59e0b" },
    { day: "Wednesday", time: "20:00", name: "Open Gym", description: "Open gym time.", color: "#22d3ee" },
    // Thursday
    { day: "Thursday", time: "08:00", name: "Bootcamp", description: "Morning Bootcamp.", color: "#ef4444" },
    { day: "Thursday", time: "17:30", name: "Beginner Boxing", description: "Intro to boxing.", color: "#ef4444" },
    { day: "Thursday", time: "18:00", name: "Junior Jabbers (6-12 yr)", description: "Kids fundamentals.", color: "#22c55e" },
    { day: "Thursday", time: "19:00", name: "Boxing Tech", description: "Technical boxing skills.", color: "#3b82f6" },
    { day: "Thursday", time: "20:00", name: "Open Gym", description: "Open gym time.", color: "#22d3ee" },
    // Friday
    { day: "Friday", time: "08:00", name: "Bootcamp", description: "Morning Bootcamp.", color: "#ef4444" },
    { day: "Friday", time: "18:00", name: "Bootcamp", description: "Evening Bootcamp.", color: "#ef4444" },
    { day: "Friday", time: "19:00", name: "Boxing Tech", description: "Technical boxing skills.", color: "#3b82f6" },
    { day: "Friday", time: "20:00", name: "Open Gym", description: "Open gym time.", color: "#22d3ee" },
    // Saturday
    { day: "Saturday", time: "12:00", name: "Open Gym", description: "Open gym.", color: "#22d3ee" },
    { day: "Saturday", time: "15:00", name: "Sparring", description: "Controlled sparring rounds.", color: "#f97316" },
  ];

  const addHour = (time: string) => {
    const [h, m] = time.split(":").map(Number);
    return `${String(h + 1).padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
  };

  const insertClass = db.prepare(`
    INSERT INTO classes (name, description, instructor, day_of_week, start_time, end_time, max_capacity, price, image, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const classImages = {
    "Bootcamp": "/images/gym-training.png",
    "Boxing Tech": "/images/boxing-training.png", 
    "Junior Jabbers (6-12 yr)": "/images/junior-jabbers.png",
    "Strength & Conditioning": "/images/strength-conditioning.png",
    "Beginner Boxing": "/images/boxing-training.png",
    "Advanced Boxing": "/images/boxing-training.png",
    "Open Gym": "/images/gym-training.png",
  };

  const addedNames = new Set<string>();
  schedule.forEach((cls) => {
    if (addedNames.has(cls.name)) return;
    insertClass.run(
      cls.name,
      cls.description || "",
      "",
      cls.day,
      cls.time,
      addHour(cls.time),
      capacities[cls.name] || 30,
      25,
      classImages[cls.name as keyof typeof classImages] || "/images/boxing-training.png",
      cls.color || null
    );
    addedNames.add(cls.name);
  });

  db.prepare(`
    UPDATE classes
    SET slug = LOWER(REPLACE(REPLACE(name, '&', 'and'), ' ', '-')) || '-' || id
  `).run();

  // After inserting base classes, generate the next 30 days of instances
  generateClassInstances();
}

// If there are no upcoming class instances, attempt to backfill class weekly fields
// and generate a fresh 30-day instance set so calendars are never empty.
function ensureUpcomingInstances() {
  try {
    const upcoming = db.prepare("SELECT COUNT(*) as c FROM class_instances WHERE date BETWEEN date('now') AND date('now','+30 days')").get() as { c: number };
    if ((upcoming?.c ?? 0) > 0) return;

    // Backfill weekly fields for known classes missing schedule info
    const capacities: Record<string, number> = {
      Bootcamp: 30,
      "Boxing Tech": 30,
      "Junior Jabbers (6-12 yr)": 15,
      "Strength & Conditioning": 30,
      "Beginner Boxing": 30,
      Sparring: 20,
      "Open Gym": 9999,
    };
    const schedule: Array<{ day: string; time: string; name: string; color?: string }> = [
      { day: "Sunday", time: "20:00", name: "Strength & Conditioning", color: "#f59e0b" },
      { day: "Monday", time: "08:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Monday", time: "12:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Monday", time: "17:00", name: "Boxing Tech", color: "#3b82f6" },
      { day: "Monday", time: "18:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Monday", time: "19:00", name: "Boxing Tech", color: "#3b82f6" },
      { day: "Monday", time: "20:00", name: "Open Gym", color: "#22d3ee" },
      { day: "Tuesday", time: "08:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Tuesday", time: "17:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Tuesday", time: "18:00", name: "Junior Jabbers (6-12 yr)", color: "#22c55e" },
      { day: "Tuesday", time: "19:00", name: "Boxing Tech", color: "#3b82f6" },
      { day: "Tuesday", time: "20:00", name: "Open Gym", color: "#22d3ee" },
      { day: "Wednesday", time: "08:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Wednesday", time: "12:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Wednesday", time: "19:00", name: "Strength & Conditioning", color: "#f59e0b" },
      { day: "Wednesday", time: "20:00", name: "Open Gym", color: "#22d3ee" },
      { day: "Thursday", time: "08:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Thursday", time: "17:30", name: "Beginner Boxing", color: "#ef4444" },
      { day: "Thursday", time: "18:00", name: "Junior Jabbers (6-12 yr)", color: "#22c55e" },
      { day: "Thursday", time: "19:00", name: "Boxing Tech", color: "#3b82f6" },
      { day: "Thursday", time: "20:00", name: "Open Gym", color: "#22d3ee" },
      { day: "Friday", time: "08:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Friday", time: "18:00", name: "Bootcamp", color: "#ef4444" },
      { day: "Friday", time: "19:00", name: "Boxing Tech", color: "#3b82f6" },
      { day: "Friday", time: "20:00", name: "Open Gym", color: "#22d3ee" },
      { day: "Saturday", time: "12:00", name: "Open Gym", color: "#22d3ee" },
      { day: "Saturday", time: "15:00", name: "Sparring", color: "#f97316" },
    ];

    const addHour = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return `${String(h + 1).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const updateStmt = db.prepare(
      `UPDATE classes SET day_of_week = COALESCE(day_of_week, ?), start_time = COALESCE(start_time, ?), end_time = COALESCE(end_time, ?), max_capacity = COALESCE(max_capacity, ?), color = COALESCE(color, ?) WHERE name = ?`
    );
    for (const s of schedule) {
      const cap = capacities[s.name] || 30;
      updateStmt.run(s.day, s.time, addHour(s.time), cap, s.color ?? null, s.name);
    }

    generateClassInstances();
  } catch (err) {
    // swallow to avoid crashing startup
  }
}

// Hard reset classes and instances to match the exact weekly schedule provided by the user
function replaceScheduleWithExactTemplate() {
  try {
    // Weekly template and helpers
    const capacities: Record<string, number> = {
      Bootcamp: 30,
      "Boxing Tech": 30,
      "Junior Jabbers (6-12 yr)": 15,
      "Strength & Conditioning": 30,
      "Beginner Boxing": 30,
      Sparring: 20,
      "Open Gym": 30,
    };
    const colors: Record<string, string> = {
      Bootcamp: "#ef4444",
      "Boxing Tech": "#3b82f6",
      "Junior Jabbers (6-12 yr)": "#22c55e",
      "Strength & Conditioning": "#f59e0b",
      "Beginner Boxing": "#ef4444",
      Sparring: "#f97316",
      "Open Gym": "#22d3ee",
    };
    const weekly: Array<{ day: string; time: string; name: string }> = [
      // Monday
      { day: "Monday", time: "08:00", name: "Bootcamp" },
      { day: "Monday", time: "12:00", name: "Bootcamp" },
      { day: "Monday", time: "17:00", name: "Boxing Tech" },
      { day: "Monday", time: "18:00", name: "Bootcamp" },
      { day: "Monday", time: "19:00", name: "Boxing Tech" },
      { day: "Monday", time: "20:00", name: "Open Gym" },
      // Tuesday
      { day: "Tuesday", time: "08:00", name: "Bootcamp" },
      { day: "Tuesday", time: "17:00", name: "Bootcamp" },
      { day: "Tuesday", time: "18:00", name: "Junior Jabbers (6-12 yr)" },
      { day: "Tuesday", time: "19:00", name: "Boxing Tech" },
      { day: "Tuesday", time: "20:00", name: "Open Gym" },
      // Wednesday
      { day: "Wednesday", time: "08:00", name: "Bootcamp" },
      { day: "Wednesday", time: "12:00", name: "Bootcamp" },
      { day: "Wednesday", time: "19:00", name: "Strength & Conditioning" },
      { day: "Wednesday", time: "20:00", name: "Open Gym" },
      // Thursday
      { day: "Thursday", time: "08:00", name: "Bootcamp" },
      { day: "Thursday", time: "17:30", name: "Beginner Boxing" },
      { day: "Thursday", time: "18:00", name: "Junior Jabbers (6-12 yr)" },
      { day: "Thursday", time: "19:00", name: "Boxing Tech" },
      { day: "Thursday", time: "20:00", name: "Open Gym" },
      // Friday
      { day: "Friday", time: "08:00", name: "Bootcamp" },
      { day: "Friday", time: "18:00", name: "Bootcamp" },
      { day: "Friday", time: "19:00", name: "Boxing Tech" },
      { day: "Friday", time: "20:00", name: "Open Gym" },
      // Saturday
      { day: "Saturday", time: "12:00", name: "Open Gym" },
      { day: "Saturday", time: "15:00", name: "Sparring" },
      // Sunday
      { day: "Sunday", time: "20:00", name: "Strength & Conditioning" },
    ];

    const addHour = (time: string) => {
      const [h, m] = time.split(":").map(Number);
      return `${String(h + 1).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
    };

    // Clear and reseed classes
    db.prepare(`DELETE FROM class_instances`).run();
    db.prepare(`DELETE FROM classes`).run();

    const insertClass = db.prepare(
      `INSERT INTO classes (name, description, instructor, day_of_week, start_time, end_time, max_capacity, price, image, color, is_active, active)
       VALUES (?, '', '', ?, ?, ?, ?, 25, NULL, ?, 1, 1)`
    );
    weekly.forEach((slot) => {
      const color = colors[slot.name] || null;
      const cap = capacities[slot.name] ?? 30;
      insertClass.run(slot.name, slot.day, slot.time, addHour(slot.time), cap, color);
    });

    // Generate next 30 days of instances
    const classes = db.prepare(`SELECT id, day_of_week, start_time, end_time, COALESCE(instructor,'') as instructor, COALESCE(max_capacity,30) as max_capacity FROM classes`).all() as Array<{ id: number; day_of_week: string; start_time: string; end_time: string; instructor?: string; max_capacity?: number }>;
    const today = new Date();
    const insertInstance = db.prepare(
      `INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, status)
       VALUES (?, ?, ?, ?, ?, ?, 'scheduled')`
    );
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const da = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${da}`;
      for (const c of classes) {
        if (c.day_of_week === dayName) {
          try { insertInstance.run(c.id, dateStr, c.start_time, c.end_time, c.instructor ?? '', c.max_capacity ?? 30); } catch {}
        }
      }
    }
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
    "humza-muhammad", 
    "Humza Muhammad", 
    "Head coach with over 8 years of boxing experience. Specializes in technical training and competitive preparation.", 
    "Certified Boxing Coach, Level 2 Personal Trainer", 
    "/images/coach-humza.png"
  );
  insertCoach.run(
    "kyle-mclaughlin", 
    "Kyle McLaughlin", 
    "Former amateur boxer turned coach. Focuses on fundamentals and building confidence in new fighters.", 
    "USA Boxing Certified Coach", 
    "/images/kyle-mclaughlin.png"
  );
  insertCoach.run(
    "scott-trainer", 
    "Scott Wilson", 
    "Strength and conditioning specialist with a background in professional athletics.", 
    "NSCA Certified Strength Coach, Boxing Conditioning Specialist", 
    "/images/coach-scott.png"
  );
}

function seedMembershipPackages() {
  if (db.prepare("SELECT COUNT(*) as c FROM membership_packages").get().c > 0) return;
  const insertPkg = db.prepare(`
    INSERT INTO membership_packages (name, description, price, features)
    VALUES (?, ?, ?, ?)
  `);
  insertPkg.run("Drop-In", "Perfect for occasional visits", 25, JSON.stringify(["Access to any class", "No commitment"]));
  insertPkg.run("Monthly Unlimited", "Best for regular training", 150, JSON.stringify(["Unlimited classes", "Priority booking"]));
}

function seedSettings() {
  if (db.prepare("SELECT COUNT(*) as c FROM site_settings").get().c > 0) return;
  const insertSetting = db.prepare(`INSERT INTO site_settings (key, value) VALUES (?, ?)`);
  insertSetting.run("hero_title", "The Cave Boxing Gym");
  insertSetting.run("hero_subtitle", "Train like a champion.");
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
