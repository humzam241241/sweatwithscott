import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import db from "@/lib/database";

async function getLegacySession() {
  const store = await cookies();
  const c = store.get("session");
  if (!c) return null;
  try { return JSON.parse(c.value); } catch { return null; }
}

type WeeklySlot = { day: string; time: string; name: string; color?: string; capacity?: number };

function addHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String(h + 1).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
}

export async function POST() {
  try {
    const nextAuth = (await getServerSession(authOptions as any)) as any;
    const isAdmin = Boolean((nextAuth?.user as any)?.isAdmin);
    if (!isAdmin) {
      const legacy = await getLegacySession();
      if (!legacy || !legacy.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    // Default capacities and colors by class name
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

    // Weekly template mirroring the requested layout
    const weekly: WeeklySlot[] = [
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

    // Clear existing classes and instances
    db.prepare(`DELETE FROM class_instances`).run();
    db.prepare(`DELETE FROM classes`).run();

    const insertClass = db.prepare(
      `INSERT INTO classes (name, description, instructor, day_of_week, start_time, end_time, max_capacity, price, image, color, is_active, active)
       VALUES (?, '', '', ?, ?, ?, ?, 25, NULL, ?, 1, 1)`
    );

    for (const s of weekly) {
      const color = s.color || colors[s.name] || null;
      const capacity = s.capacity ?? capacities[s.name] ?? 30;
      insertClass.run(s.name, s.day, s.time, addHour(s.time), capacity, color);
    }

    // Generate next 30 days
    const classes = db
      .prepare(`SELECT id, day_of_week, start_time, end_time, COALESCE(instructor, '') as instructor, max_capacity FROM classes`)
      .all() as Array<{ id: number; day_of_week: string; start_time: string; end_time: string; instructor?: string; max_capacity?: number }>;
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to seed weekly schedule:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


