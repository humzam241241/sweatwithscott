import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db"; // keep your existing DB utils

// GET: Fetch all classes
export async function GET() {
  try {
    const classes = await query(`
      SELECT 
        c.id,
        c.slug,
        c.name,
        c.description,
        c.image,
        c.coach_id,
        c.schedule,
        c.color,
        c.day,
        c.time,
        c.spots,
        co.name AS coach_name,
        co.slug AS coach_slug
      FROM classes c
      LEFT JOIN coaches co ON c.coach_id = co.id
      ORDER BY c.name ASC
    `);

    return NextResponse.json(classes);
  } catch (err) {
    console.error("Error fetching classes:", err);
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 });
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
      spots
    } = await request.json();

    // Generate slug from name
    const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : null;

    // Validate required fields
    if (!slug || !name || !description || !image || !day || !time || !spots) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert new class
    await run(
      `INSERT INTO classes (
        slug, name, description, image, coach_id, schedule, color, day, time, spots
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        name,
        description,
        image,
        coach_id || null,
        schedule || null,
        color || null,
        day,
        time,
        spots
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Class created successfully",
    });
  } catch (err) {
    console.error("Error creating class:", err);
    return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
  }
}
