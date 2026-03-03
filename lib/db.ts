import Database from "better-sqlite3";
import path from "path";

let db: Database.Database;

// Establish single connection and ensure tables exist
export function getDb() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), "gym.db");
    db = new Database(dbPath);
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE IF NOT EXISTS coaches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        name TEXT,
        role TEXT,
        bio TEXT,
        image TEXT,
        certifications TEXT,
        fight_record TEXT
      );

      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE,
        name TEXT,
        description TEXT,
        image TEXT,
        coach_id INTEGER,
        schedule TEXT,
        color TEXT,
        day TEXT,
        time TEXT,
        spots INTEGER,
        price REAL,
        FOREIGN KEY (coach_id) REFERENCES coaches(id)
      );
    `);

    // Ensure new columns exist for older databases
    const classCols = db.prepare("PRAGMA table_info(classes)").all() as { name: string }[];
    const colNames = classCols.map((c) => c.name);
    if (!colNames.includes("price")) {
      db.exec("ALTER TABLE classes ADD COLUMN price REAL");
    }
    if (!colNames.includes("color")) {
      db.exec("ALTER TABLE classes ADD COLUMN color TEXT");
    }
    if (!colNames.includes("day")) {
      db.exec("ALTER TABLE classes ADD COLUMN day TEXT");
    }
    if (!colNames.includes("time")) {
      db.exec("ALTER TABLE classes ADD COLUMN time TEXT");
    }
    if (!colNames.includes("spots")) {
      db.exec("ALTER TABLE classes ADD COLUMN spots INTEGER");
    }

    seedIfEmpty();
  }
  return db;
}

function seedIfEmpty() {
  const coachCount = db.prepare("SELECT COUNT(*) as count FROM coaches").get() as { count: number };
  if (coachCount.count === 0) {
    const insertCoach = db.prepare(
      "INSERT INTO coaches (slug, name, role, bio, image, certifications, fight_record) VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    insertCoach.run(
      "john-doe",
      "John Doe",
      "Head Coach",
      "Former champion with 20 years of experience.",
      "/images/logo.png",
      "USA Boxing Certified",
      "20-2-0"
    );
    insertCoach.run(
      "jane-smith",
      "Jane Smith",
      "Assistant Coach",
      "Strength and conditioning specialist.",
      "/images/logo.png",
      "NSCA CPT",
      "5-1-0"
    );
  }

  const classCount = db.prepare("SELECT COUNT(*) as count FROM classes").get() as { count: number };
  if (classCount.count === 0) {
    const coaches = db.prepare("SELECT id FROM coaches LIMIT 2").all() as { id: number }[];
    const insertClass = db.prepare(
      "INSERT INTO classes (slug, name, description, image, coach_id, schedule, color, day, time, spots, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    insertClass.run(
      "beginner-boxing",
      "Beginner Boxing",
      "Learn boxing fundamentals in a supportive environment.",
      "/images/logo.png",
      coaches[0]?.id ?? null,
      JSON.stringify([{ day: "Mon", time: "6:00 PM", spots: 10 }]),
      null,
      "Mon",
      "6:00 PM",
      10,
      0
    );
    insertClass.run(
      "strength-conditioning",
      "Strength & Conditioning",
      "Build strength and improve conditioning.",
      "/images/logo.png",
      coaches[1]?.id ?? null,
      JSON.stringify([{ day: "Wed", time: "6:00 PM", spots: 10 }]),
      null,
      "Wed",
      "6:00 PM",
      10,
      0
    );
  }
}

export function query<T = any>(sql: string, params: any[] = []): T[] {
  return getDb().prepare(sql).all(...params);
}

export function run(sql: string, params: any[] = []) {
  return getDb().prepare(sql).run(...params);
}
