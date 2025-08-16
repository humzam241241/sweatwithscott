import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";

function ensureFutureInstancesForClass(classId: number, dayOfWeek: string, startTime: string, endTime: string, maxCapacity?: number) {
  try {
    const today = new Date();
    // Clear future instances for this class to avoid duplicates
    db.prepare(`DELETE FROM class_instances WHERE class_id = ? AND date >= date('now')`).run(classId);
    const insert = db.prepare(
      `INSERT INTO class_instances (class_id, date, start_time, end_time, instructor, max_capacity, current_bookings, status)
       VALUES (?, ?, ?, ?, (SELECT COALESCE(instructor,'') FROM classes WHERE id = ?), ?, 0, 'scheduled')`
    );
    for (let i = 0; i < 45; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
      if (dayName === dayOfWeek) {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const da = String(d.getDate()).padStart(2, '0');
        const dateStr = `${y}-${m}-${da}`;
        insert.run(classId, dateStr, startTime, endTime, classId, maxCapacity ?? 20);
      }
    }
  } catch (e) {
    // swallow errors to avoid blocking main request
  }
}

export async function GET() {
  try {
    const classes = db
      .prepare(
        `SELECT id, slug, name, description, day_of_week, start_time, end_time, max_capacity, price, image,
                COALESCE(instructor, coach_name, '') as instructor
         FROM classes
         WHERE is_active = 1 AND id IN (
           SELECT MIN(id)
           FROM classes
           WHERE is_active = 1
           GROUP BY name, day_of_week, start_time
         )
         ORDER BY name`
      )
      .all();
    return NextResponse.json(Array.isArray(classes) ? classes : []);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching classes:", error.message);
    } else {
      console.error("Error fetching classes:", String(error));
    }
    return NextResponse.json([], { status: 500 });
  }
}

// Helper to add 1 hour to a time string like "06:00" or "6:00 AM"
function addOneHour(time: string): string {
  try {
    // Normalize to HH:mm
    const date = new Date(`2000-01-01 ${time}`);
    if (Number.isNaN(date.getTime())) return time;
    date.setHours(date.getHours() + 1);
    const hh = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return time;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const day: string = body.day ?? body.day_of_week;
    const name: string = body.name;
    const time: string = body.time ?? body.start_time;
    const endTime: string | undefined = body.endTime ?? body.end_time;
    const spots: number = Number(body.spots ?? body.max_capacity ?? 0);
    const coach: string = String(body.coach ?? body.instructor ?? "");
    const color: string | null = (body.color ?? body.colour ?? null) as string | null;

    if (!day || !name || !time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

  const startTime = new Date(`2000-01-01 ${time}`);
  const start = Number.isNaN(startTime.getTime())
    ? time
    : `${String(startTime.getHours()).padStart(2, "0")}:${String(startTime.getMinutes()).padStart(2, "0")}`;
  let end: string;
  if (endTime) {
    const et = new Date(`2000-01-01 ${endTime}`);
    end = Number.isNaN(et.getTime())
      ? endTime
      : `${String(et.getHours()).padStart(2, "0")}:${String(et.getMinutes()).padStart(2, "0")}`;
  } else {
    end = addOneHour(start);
  }

    const stmt = db.prepare(
      `INSERT INTO classes (name, instructor, day_of_week, start_time, end_time, max_capacity, price, image, color)
       VALUES (?, ?, ?, ?, ?, ?, 0, NULL, ?)`
    );
    const info = stmt.run(name, coach, day, start, end, spots, color);

    // Return the newly created class
    const created = db.prepare(`SELECT * FROM classes WHERE id = ?`).get(info.lastInsertRowid);
    ensureFutureInstancesForClass(Number(info.lastInsertRowid), day, start, end, spots);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const id: number | undefined = body.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const day: string | undefined = body.day ?? body.day_of_week;
    const name: string | undefined = body.name;
    const time: string | undefined = body.time ?? body.start_time;
    const endTime: string | undefined = body.endTime ?? body.end_time;
    const spots: number | undefined =
      body.spots !== undefined ? Number(body.spots) : (body.max_capacity !== undefined ? Number(body.max_capacity) : undefined);
    const coach: string | undefined = body.coach ?? body.instructor;
    const color: string | null | undefined = body.color ?? body.colour;

    let start: string | undefined;
    let end: string | undefined;
    if (time) {
      const d = new Date(`2000-01-01 ${time}`);
      start = Number.isNaN(d.getTime())
        ? time
        : `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
      end = endTime ? endTime : addOneHour(start);
    }

    const updates: string[] = [];
    const values: any[] = [];
    if (name !== undefined) { updates.push("name = ?"); values.push(name); }
    if (coach !== undefined) { updates.push("instructor = ?"); values.push(coach); }
    if (day !== undefined) { updates.push("day_of_week = ?"); values.push(day); }
    if (start !== undefined) { updates.push("start_time = ?"); values.push(start); }
    if (end !== undefined) { updates.push("end_time = ?"); values.push(end); }
    if (spots !== undefined) { updates.push("max_capacity = ?"); values.push(spots); }
    if (color !== undefined) { updates.push("color = ?"); values.push(color); }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    const sql = `UPDATE classes SET ${updates.join(", ")} WHERE id = ?`;
    values.push(id);
    db.prepare(sql).run(...values);

    const updated = db.prepare(`SELECT * FROM classes WHERE id = ?`).get(id);
    // If schedule fields changed, regenerate instances for future
    const effectiveDay = day ?? updated.day_of_week;
    const effectiveStart = start ?? updated.start_time;
    const effectiveEnd = end ?? updated.end_time;
    const effectiveSpots = spots ?? updated.max_capacity;
    if (effectiveDay && effectiveStart && effectiveEnd) {
      ensureFutureInstancesForClass(id, effectiveDay, effectiveStart, effectiveEnd, effectiveSpots);
    }
    return NextResponse.json(updated);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const id: number | undefined = body.id;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    db.prepare(`DELETE FROM classes WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(String(error));
    }
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
