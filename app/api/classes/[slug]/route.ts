import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const cls = query(
      "SELECT c.*, co.name as coach_name, co.slug as coach_slug FROM classes c LEFT JOIN coaches co ON c.coach_id = co.id WHERE c.slug = ? LIMIT 1",
      [params.slug]
    )[0];
    if (!cls) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }
    return NextResponse.json(cls);
  } catch (err) {
    console.error("Error fetching class", err);
    return NextResponse.json({ error: "Failed to fetch class" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { name, description, image, coach_id, schedule } = await request.json();
    run(
      "UPDATE classes SET name = ?, description = ?, image = ?, coach_id = ?, schedule = ? WHERE slug = ?",
      [
        name,
        description,
        image,
        coach_id,
        typeof schedule === "string" ? schedule : JSON.stringify(schedule),
        params.slug,
      ]
    );
    return NextResponse.json({ message: "Class updated" });
  } catch (err) {
    console.error("Error updating class", err);
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    run("DELETE FROM classes WHERE slug = ?", [params.slug]);
    return NextResponse.json({ message: "Class deleted" });
  } catch (err) {
    console.error("Error deleting class", err);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
