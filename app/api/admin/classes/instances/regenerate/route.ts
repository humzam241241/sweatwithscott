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

// Rebuild the next 30 days of class_instances using weekly class definitions
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

    // Remove future instances to avoid duplicates
    db.prepare(`DELETE FROM class_instances WHERE date >= date('now')`).run();

    const classes = db
      .prepare(
        `SELECT id, day_of_week, start_time, end_time, max_capacity, COALESCE(instructor, coach_name, '') as instructor
         FROM classes
         WHERE (is_active = 1 OR active = 1)
           AND day_of_week IS NOT NULL AND start_time IS NOT NULL AND end_time IS NOT NULL`
      )
      .all() as Array<{
        id: number; day_of_week: string; start_time: string; end_time: string; max_capacity?: number; instructor?: string;
      }>;

    const today = new Date();
    const insert = db.prepare(
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

      for (const cls of classes) {
        if (cls.day_of_week === dayName) {
          try {
            insert.run(cls.id, dateStr, cls.start_time, cls.end_time, cls.instructor ?? '', cls.max_capacity ?? 30);
          } catch {}
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to regenerate schedule:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


