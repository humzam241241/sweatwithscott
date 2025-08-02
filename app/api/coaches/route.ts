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

// PUT: Update a coach by id or slug
export async function PUT(request: NextRequest) {
  try {
    const {
      id,
      slug,
      name,
      role,
      bio,
      image,
      certifications,
      fight_record,
    } = await request.json();

    const identifier = id ? { clause: "id = ?", value: id } : slug ? { clause: "slug = ?", value: slug } : null;
    if (!identifier) {
      return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });
    }

    const fields: Record<string, any> = {
      name,
      role,
      bio,
      image,
      certifications,
      fight_record,
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

    run(`UPDATE coaches SET ${setClauses.join(", ")} WHERE ${identifier.clause}`, params);
    return NextResponse.json({ message: "Coach updated" });
  } catch (err) {
    console.error("Error updating coach", err);
    return NextResponse.json({ error: "Failed to update coach" }, { status: 500 });
  }
}

// DELETE: Remove a coach by id or slug
export async function DELETE(request: NextRequest) {
  try {
    const { id, slug } = await request.json();
    const identifier = id ? { clause: "id = ?", value: id } : slug ? { clause: "slug = ?", value: slug } : null;
    if (!identifier) {
      return NextResponse.json({ error: "Missing id or slug" }, { status: 400 });
    }
    run(`DELETE FROM coaches WHERE ${identifier.clause}`, [identifier.value]);
    return NextResponse.json({ message: "Coach deleted" });
  } catch (err) {
    console.error("Error deleting coach", err);
    return NextResponse.json({ error: "Failed to delete coach" }, { status: 500 });
  }
}
