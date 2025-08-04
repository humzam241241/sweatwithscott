import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET all coaches
export async function GET() {
  try {
    const results = query(`
      SELECT slug, name, role, bio, image
      FROM coaches
      ORDER BY name ASC
    `);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}
