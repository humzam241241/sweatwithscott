import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbOperations } from "@/lib/database";

async function getSession() {
  const store = await cookies();
  const c = store.get("session");
  if (!c) return null;
  try { return JSON.parse(c.value); } catch { return null; }
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { identifier, class_instance_id, markPaid } = await req.json();
    if (!identifier && !class_instance_id) {
      return NextResponse.json({ error: "identifier or class_instance_id required" }, { status: 400 });
    }

    // Resolve user by username or email
    let user: any | undefined;
    if (identifier) {
      user = dbOperations.getUserByEmail?.(identifier) || dbOperations.getUserByUsername?.(identifier);
    }
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine class instance: provided, or nearest ongoing within +/- 30 min
    let targetId: number | undefined = class_instance_id ? Number(class_instance_id) : undefined;
    if (!targetId || !Number.isFinite(targetId)) {
      const today = dbOperations.getCurrentClasses?.() as any[] | undefined;
      if (today && today.length > 0) {
        const now = new Date();
        const nowMin = now.getHours() * 60 + now.getMinutes();
        const candidate = today.find((ci: any) => {
          const start = timeToMinutes(String(ci.start_time));
          const end = timeToMinutes(String(ci.end_time));
          return nowMin >= start - 30 && nowMin <= end + 15; // 30m early, 15m late
        });
        if (candidate) targetId = Number(candidate.id);
      }
    }
    if (!targetId) {
      return NextResponse.json({ error: "No matching class in current window" }, { status: 404 });
    }

    // Ensure booking exists
    const existing = dbOperations.getUserBookingForClass(user.id, targetId);
    let bookingId: number;
    if (!existing) {
      bookingId = dbOperations.bookClass(user.id, targetId);
    } else {
      bookingId = Number((existing as any).id ?? (existing as any).booking_id ?? existing);
    }

    // Optionally mark payment paid (e.g., cash)
    if (markPaid) {
      try { dbOperations.markPaymentPaid(bookingId, "cash"); } catch {}
    }

    // Mark attendance
    dbOperations.markAttendance(bookingId, true);

    return NextResponse.json({ success: true, userId: user.id, bookingId, classInstanceId: targetId });
  } catch (error) {
    console.error("checkin error", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}


