import { NextResponse } from "next/server";
import { getCurrentUserId } from "@/lib/auth";
import { dbOperations } from "@/lib/database";

export async function GET(req: Request) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");
    const enrollments = (dbOperations as any).getUserProgramEnrollments?.(userId) ?? [];

    if (!slug) {
      return NextResponse.json({ enrollments });
    }

    const days = (dbOperations as any).getProgramDaysBySlugForUser?.(userId, slug) ?? [];
    const summary = (dbOperations as any).getProgramProgressSummary?.(userId, slug) ?? {
      total_days: 0,
      completed_days: 0,
    };

    return NextResponse.json({ enrollments, days, summary });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: "Failed to load programs", message }, { status: 500 });
  }
}
