import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDb } from "@/lib/db";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const db = getDb();
    const rows = db
      .prepare("SELECT * FROM classes ORDER BY day, time")
      .all();
    const grouped: Record<string, any[]> = {};
    rows.forEach((row) => {
      if (!grouped[row.day]) grouped[row.day] = [];
      grouped[row.day].push(row);
    });
    return NextResponse.json(grouped);
  } catch (err) {
    console.error("Error loading schedule", err);
    return NextResponse.json({ error: "Failed to load schedule" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, day, name, time, spots = 0, coach, color } = await request.json();
    const db = getDb();

    if (id) {
      db.prepare(
        "UPDATE classes SET day = ?, name = ?, time = ?, spots = ?, coach = ?, color = ? WHERE id = ?"
      ).run(day, name, time, spots, coach, color, id);
      const row = db.prepare("SELECT * FROM classes WHERE id = ?").get(id);
      return NextResponse.json(row);
    } else {
      const info = db
        .prepare(
          "INSERT INTO classes (day, name, time, spots, coach, color) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .run(day, name, time, spots, coach, color);
      const row = db
        .prepare("SELECT * FROM classes WHERE id = ?")
        .get(info.lastInsertRowid as number);
      return NextResponse.json(row, { status: 201 });
    }
  } catch (err) {
    console.error("Error saving class", err);
    return NextResponse.json({ error: "Failed to save class" }, { status: 500 });
  }
}

