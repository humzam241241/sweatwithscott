import { NextResponse } from "next/server";
import db from "@/lib/database";

export async function GET() {
  try {
    const coaches = db.prepare(`
      SELECT 
        id,
        slug,
        name,
        bio,
        certifications,
        image,
        created_at,
        updated_at
      FROM coaches
      ORDER BY name ASC
    `).all();

    return NextResponse.json(coaches);
  } catch (error) {
    console.error("❌ Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}
