import { NextResponse } from "next/server";
import { z } from "@/lib/z";
import { getCurrentUserId } from "@/lib/auth";
import { dbOperations } from "@/lib/database";

const bodySchema = z.object({
  dayId: z.number().int().positive(),
  notes: z.string().max(500).optional(),
});

export async function POST(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
    }

    const ok = (dbOperations as any).markProgramDayCompleted?.(userId, parsed.data.dayId, parsed.data.notes);
    if (!ok) return NextResponse.json({ error: "Unable to save progress" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to save progress", message }, { status: 500 });
  }
}
