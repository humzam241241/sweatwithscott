import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET() {
  try {
    const coaches = query("SELECT * FROM coaches");
    return NextResponse.json(Array.isArray(coaches) ? coaches : []);
  } catch (err) {
    console.error("Error fetching coaches", err);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, name, role, bio, image, certifications, fight_record } =
      await request.json();
    run(
      "INSERT INTO coaches (slug, name, role, bio, image, certifications, fight_record) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [slug, name, role, bio, image, certifications, fight_record]
    );
    return NextResponse.json({ message: "Coach created" }, { status: 201 });
  } catch (err) {
    console.error("Error creating coach", err);
    return NextResponse.json({ error: "Failed to create coach" }, { status: 500 });
  }
}
