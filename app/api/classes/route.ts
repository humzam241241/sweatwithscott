import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

// GET: Fetch all classes
export async function GET() {
  try {
    const classes = query(`
      SELECT c.*, 
             co.name AS coach_name, 
             co.slug AS coach_slug
      FROM classes c
      LEFT JOIN coaches co ON c.coach_id = co.id
      ORDER BY c.day, c.time
    `);

    return NextResponse.json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    );
  }
}

// POST: Create a new class
export async function POST(request: NextRequest) {
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

    // Auto-generate slug from name
    const slug = name.toLowerCase().trim().replace(/\s+/g, "-");

    // Insert new class
    run(
      `
      INSERT INTO classes (
        slug, name, description, image, coach_id, schedule, color, day, time, spots
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        slug,
        name,
        description,
        image || null,
        coach_id || null,
        schedule || null,
        color || null,
        day,
        time,
        spots ?? null,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Class created successfully",
      slug,
    });
  } catch (err) {
    console.error("Error creating class:", err);
    return NextResponse.json(
      { error: "Failed to create class" },
      { status: 500 }
    );
  }
}
