import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

function dayOrder(day: string) {
  return (
    {
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
      Sunday: 7,
    } as Record<string, number>
  )[day] || 8;
}

export async function GET() {
  try {
    const rows = query<any>(
      "SELECT * FROM classes ORDER BY CASE day WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3 WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6 WHEN 'Sunday' THEN 7 END, time"
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error("Error loading classes", err);
    return NextResponse.json({ error: "Failed to load classes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { day, name, time, spots = 0, coach, color } = await request.json();
    if (!day || !name || !time) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const info = run(
      "INSERT INTO classes (day, name, time, spots, coach, color) VALUES (?, ?, ?, ?, ?, ?)",
      [day, name, time, spots, coach, color]
    );
    return NextResponse.json({ id: info.lastInsertRowid });
  } catch (err) {
    console.error("Error creating class", err);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, day, name, time, spots = 0, coach, color } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    run(
      "UPDATE classes SET day = ?, name = ?, time = ?, spots = ?, coach = ?, color = ? WHERE id = ?",
      [day, name, time, spots, coach, color, id]
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating class", err);
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    const info = run("DELETE FROM classes WHERE id = ?", [id]);
    if (info.changes === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting class", err);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}

