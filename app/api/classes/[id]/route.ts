import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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

    if (!name || !description || !image || !day || !time || !spots) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-");

    await run(
      `UPDATE classes 
       SET slug = ?, name = ?, description = ?, image = ?, coach_id = ?, schedule = ?, color = ?, day = ?, time = ?, spots = ?
       WHERE id = ?`,
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
        spots,
        id,
      ]
    );

    return NextResponse.json({
      success: true,
      message: "Class updated successfully",
    });
  } catch (err) {
    console.error("Error updating class:", err);
    return NextResponse.json(
      { error: "Failed to update class" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    await run(`DELETE FROM classes WHERE id = ?`, [id]);

    return NextResponse.json({
      success: true,
      message: "Class deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting class:", err);
    return NextResponse.json(
      { error: "Failed to delete class" },
      { status: 500 }
    );
  }
}
