import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { cookies } from "next/headers";

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
  const db = getDb();
  const classes = db
    .prepare("SELECT * FROM classes ORDER BY day, time")
    .all();
  return NextResponse.json(classes);
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session || !session.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await request.json();
  const db = getDb();

  if (data.action === "delete") {
    if (!data.id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }
    db.prepare("DELETE FROM classes WHERE id = ?").run(data.id);
  } else if (data.id) {
    const { id, day, name, time, spots = 0, coach, color } = data;
    db.prepare(
      "UPDATE classes SET day = ?, name = ?, time = ?, spots = ?, coach = ?, color = ? WHERE id = ?"
    ).run(day, name, time, spots, coach, color, id);
  } else {
    const { day, name, time, spots = 0, coach, color } = data;
    db.prepare(
      "INSERT INTO classes (day, name, time, spots, coach, color) VALUES (?, ?, ?, ?, ?, ?)"
    ).run(day, name, time, spots, coach, color);
  }

  const classes = db
    .prepare("SELECT * FROM classes ORDER BY day, time")
    .all();
  return NextResponse.json(classes);
}
