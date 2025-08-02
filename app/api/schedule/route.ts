import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET() {
  try {
    const rows = query<any>("SELECT * FROM classes ORDER BY day, time");
    const grouped: Record<string, any[]> = {};
    for (const row of rows) {
      if (!grouped[row.day]) grouped[row.day] = [];
      grouped[row.day].push(row);
    }
    return NextResponse.json(grouped);
  } catch (err) {
    console.error("Error loading schedule", err);
    return NextResponse.json(
      { error: "Failed to load schedule" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { day, name, time, spots = 0, coach, color, id } = await request.json();
    if (id) {
      run(
        "UPDATE classes SET day = ?, name = ?, time = ?, spots = ?, coach = ?, color = ? WHERE id = ?",
        [day, name, time, spots, coach, color, id],
      );
    } else {
      run(
        "INSERT INTO classes (day, name, time, spots, coach, color) VALUES (?, ?, ?, ?, ?, ?)",
        [day, name, time, spots, coach, color],
      );
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error saving class", err);
    return NextResponse.json(
      { error: "Failed to save class" },
      { status: 500 },
    );
  }
}
