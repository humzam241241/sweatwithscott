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
        c.price,
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
      spots,
      price
    } = await request.json();

    // Generate slug from name
    const slug = name ? name.toLowerCase().replace(/\s+/g, "-") : null;

    // Validate required fields
    if (!slug || !name) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Insert new class
    await run(
      `INSERT INTO classes (
        slug, name, description, image, coach_id, schedule, color, day, time, spots, price
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        slug,
        name,
        description || null,
        image || null,
        coach_id || null,
        schedule || null,
        color || null,
        day || null,
        time || null,
        spots ?? null,
        price ?? null
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

// PUT: Update a class by id or slug
export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      slug,
      name,
      description,
      image,
      coach_id,
      schedule,
      color,
      day,
      time,
      spots,
      price,
    } = await request.json();

    const identifier = id ? { clause: "id = ?", value: id } : slug ? { clause: "slug = ?", value: slug } : null;
    if (!identifier) {
      return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });
    }

    const fields: Record<string, any> = {
      name,
      description,
      image,
      coach_id,
      schedule,
      color,
      day,
      time,
      spots,
      price,
    };
    const setClauses: string[] = [];
    const params: any[] = [];
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }
    if (setClauses.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }
    params.push(identifier.value);

    run(`UPDATE classes SET ${setClauses.join(", ")} WHERE ${identifier.clause}`, params);

    return NextResponse.json({ success: true, message: "Class updated" });
  } catch (err) {
    console.error("Error updating class:", err);
    return NextResponse.json({ error: "Failed to update class" }, { status: 500 });
  }
}

// DELETE: Remove a class by id or slug
export async function DELETE(request: NextRequest) {
  try {
    const { id, slug } = await request.json();
    const identifier = id ? { clause: "id = ?", value: id } : slug ? { clause: "slug = ?", value: slug } : null;
    if (!identifier) {
      return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });
    }
    run(`DELETE FROM classes WHERE ${identifier.clause}`, [identifier.value]);
    return NextResponse.json({ success: true, message: "Class deleted" });
  } catch (err) {
    console.error("Error deleting class:", err);
    return NextResponse.json({ error: "Failed to delete class" }, { status: 500 });
  }
}
