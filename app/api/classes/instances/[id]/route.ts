import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { z } from "@/lib/z";

const patchSchema = z.object({
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  title: z.string().min(1).optional(),
  coachId: z.number().int().optional(),
  capacity: z.number().int().positive().optional(),
  color: z.string().optional(),
  status: z.string().optional(),
  coachName: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    const json = await request.json();
    const parsed = patchSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }
    const { startsAt, endsAt, title, capacity, color, status, coachName } = parsed.data;

    const updates: string[] = [];
    const values: any[] = [];

    if (startsAt) {
      const d = new Date(startsAt);
      if (Number.isNaN(d.valueOf())) return NextResponse.json({ error: "Invalid startsAt" }, { status: 400 });
      const pad = (n: number) => String(n).padStart(2, "0");
      const date = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
      const startTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      updates.push("date = ?", "start_time = ?");
      values.push(date, startTime);
    }
    if (endsAt) {
      const d = new Date(endsAt);
      if (Number.isNaN(d.valueOf())) return NextResponse.json({ error: "Invalid endsAt" }, { status: 400 });
      const pad = (n: number) => String(n).padStart(2, "0");
      const endTime = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      updates.push("end_time = ?");
      values.push(endTime);
    }
    if (capacity !== undefined) {
      updates.push("max_capacity = ?");
      values.push(capacity);
    }
    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length > 0) {
      const sql = `UPDATE class_instances SET ${updates.join(", ")} WHERE id = ?`;
      db.prepare(sql).run(...values, id);
    }

    if (title || color) {
      const inst = db.prepare(`SELECT class_id FROM class_instances WHERE id = ?`).get(id) as { class_id: number } | undefined;
      if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const classUpdates: string[] = [];
      const classValues: any[] = [];
      if (title) {
        classUpdates.push("name = ?");
        classValues.push(title);
      }
      if (color) {
        classUpdates.push("color = ?");
        classValues.push(color);
      }
      if (coachName) {
        classUpdates.push("instructor = ?");
        classValues.push(coachName);
      }
      if (classUpdates.length > 0) {
        db.prepare(`UPDATE classes SET ${classUpdates.join(", ")} WHERE id = ?`).run(...classValues, inst.class_id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    db.prepare(`DELETE FROM class_instances WHERE id = ?`).run(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


