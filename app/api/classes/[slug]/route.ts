import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

// GET: Fetch a single class by slug
export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const results = query(
      `
      SELECT c.*, 
             co.name AS coach_name, 
             co.slug AS coach_slug
      FROM classes c
      LEFT JOIN coaches co ON c.coach_id = co.id
      WHERE c.slug = ?
      LIMIT 1
      `,
      [params.slug]
    );

    const cls = Array.isArray(results) && results.length > 0 ? results[0] : null;
    return NextResponse.json(cls);
  } catch (err) {
    console.error("Error fetching class by slug:", err);
    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    );
  }
}

// PUT: Update a class by slug
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const {
      name,
      description,
      image,
      coach_id,
      schedule,
      color,
      day,
      time,
      spots,
    } = await request.json();

    // Validate required fields
    if (!name || !description || !day || !time) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    run(
      `
      UPDATE classes
      SET name = ?, 
          description = ?, 
          image = ?, 
          coach_id = ?, 
          schedule = ?, 
          color = ?, 
          day = ?, 
          time = ?, 
          spots = ?
      WHERE slug = ?
      `,
      [
        name,
        description,
        image || null,
        coach_id || null,
        schedule || null,
        color || null,
        day,
        time,
        spots ?? null,
        params.slug,
      ]
    );

    return NextResponse.json({ success: true, message: "Class updated" });
  } catch (err) {
    console.error("Error updating class:", err);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

// DELETE: Remove a class by slug
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    run("DELETE FROM classes WHERE slug = ?", [params.slug]);
    return NextResponse.json({ success: true, message: "Class deleted" });
  } catch (err) {
    console.error("Error deleting class:", err);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
