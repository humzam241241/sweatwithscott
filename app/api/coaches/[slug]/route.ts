import { NextRequest, NextResponse } from "next/server";
import { query, run } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const coach = query("SELECT * FROM coaches WHERE slug = ? LIMIT 1", [
      params.slug,
    ])[0];
    return NextResponse.json(coach ?? null);
  } catch (err) {
    console.error("Error fetching coach", err);
    return NextResponse.json(null);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { name, role, bio, image, certifications, fight_record } =
      await request.json();
    run(
      "UPDATE coaches SET name = ?, role = ?, bio = ?, image = ?, certifications = ?, fight_record = ? WHERE slug = ?",
      [name, role, bio, image, certifications, fight_record, params.slug]
    );
    return NextResponse.json({ message: "Coach updated" });
  } catch (err) {
    console.error("Error updating coach", err);
    return NextResponse.json({ error: "Failed to update coach" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    run("DELETE FROM coaches WHERE slug = ?", [params.slug]);
    return NextResponse.json({ message: "Coach deleted" });
  } catch (err) {
    console.error("Error deleting coach", err);
    return NextResponse.json({ error: "Failed to delete coach" }, { status: 500 });
  }
}
