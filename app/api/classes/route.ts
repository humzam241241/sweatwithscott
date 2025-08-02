import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET() {
  try {
    const classes = query(
      "SELECT c.*, co.name as coach_name, co.slug as coach_slug FROM classes c LEFT JOIN coaches co ON c.coach_id = co.id"
    );
    return NextResponse.json(Array.isArray(classes) ? classes : []);
  } catch (err) {
    console.error("Error fetching classes", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, name, description, image, coach_id, schedule } = await request.json();
    run(
      "INSERT INTO classes (slug, name, description, image, coach_id, schedule) VALUES (?, ?, ?, ?, ?, ?)",
      [
        slug,
        name,
        description,
        image,
        coach_id,
        typeof schedule === "string" ? schedule : JSON.stringify(schedule),
      ]
    );
    return NextResponse.json({ message: "Class created" }, { status: 201 });
  } catch (err) {
    console.error("Error creating class", err);
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 });
  }
}
