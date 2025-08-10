import { NextRequest, NextResponse } from "next/server";
import db, { dbOperations } from "@/lib/database";
import type { CoachRecord } from "@/lib/types";

export async function GET() {
  try {
    const coaches = db.prepare(`
      SELECT 
        id,
        slug,
        name,
        bio,
        certifications,
        image
      FROM coaches
      ORDER BY name ASC
    `).all();

    return NextResponse.json(coaches);
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(String(error));
  }
    console.error("❌ Error fetching coaches:", error);
    return NextResponse.json(
      { error: "Failed to fetch coaches" },
      { status: 500 }
    );
  }
}

// Create a new coach
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, name, role, bio, image, certifications, fight_record } = body as Partial<{
      slug: string;
      name: string;
      role: string;
      bio: string;
      image: string;
      certifications: string;
      fight_record: string;
    }>;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-");
    const stmt = db.prepare(
      `INSERT INTO coaches (slug, name, role, bio, image, certifications, fight_record)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    const info = stmt.run(
      finalSlug,
      name,
      role ?? "",
      bio ?? "",
      image ?? "",
      certifications ?? "",
      fight_record ?? "",
    );

    const created = db.prepare(`SELECT * FROM coaches WHERE id = ?`).get(info.lastInsertRowid);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating coach:", error);
    return NextResponse.json({ error: "Failed to create coach" }, { status: 500 });
  }
}

// Update an existing coach (identified by id)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, role, bio, image, certifications, fight_record } = body as Partial<{
      id: number;
      name: string;
      role: string;
      bio: string;
      image: string;
      certifications: string;
      fight_record: string;
    }>;

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const updates: string[] = [];
    const values: any[] = [];
    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (role !== undefined) {
      updates.push("role = ?");
      values.push(role);
    }
    if (bio !== undefined) {
      updates.push("bio = ?");
      values.push(bio);
    }
    if (image !== undefined) {
      updates.push("image = ?");
      values.push(image);
    }
    if (certifications !== undefined) {
      updates.push("certifications = ?");
      values.push(certifications);
    }
    if (fight_record !== undefined) {
      updates.push("fight_record = ?");
      values.push(fight_record);
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const sql = `UPDATE coaches SET ${updates.join(", ")} WHERE id = ?`;
    values.push(id);
    db.prepare(sql).run(...values);

    const updated = db.prepare(`SELECT * FROM coaches WHERE id = ?`).get(id);
    return NextResponse.json(updated);
  } catch (error: unknown) {
    console.error("Error updating coach:", error);
    return NextResponse.json({ error: "Failed to update coach" }, { status: 500 });
  }
}

// Delete a coach by id
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body as { id?: number };
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    db.prepare(`DELETE FROM coaches WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Error deleting coach:", error);
    return NextResponse.json({ error: "Failed to delete coach" }, { status: 500 });
  }
}
 