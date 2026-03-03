import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbOperations } from "@/lib/database";
import db from "@/lib/database";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

async function getLegacySession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

function addMonths(startISO: string, months: number): string {
  const d = new Date(startISO);
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth();
  const day = d.getUTCDate();
  const newDate = new Date(Date.UTC(year, month + months, day));
  return newDate.toISOString().split("T")[0];
}

export async function POST(request: Request) {
  try {
    // Prefer NextAuth admin check
    const nextAuth = (await getServerSession(authOptions as any)) as any;
    const isAdmin = Boolean((nextAuth?.user as any)?.isAdmin);
    if (!isAdmin) {
      const legacy = await getLegacySession();
      if (!legacy || !legacy.isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const body = await request.json();
    const userId = Number(body.userId);
    const months = Number(body.months ?? 1);
    const method = String(body.method || "cash");
    const plan = String(body.plan || "monthly");

    if (!userId || Number.isNaN(userId) || months <= 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Determine amount by plan, fallback to 0
    const planPrices: Record<string, number> = {
      monthly: 150,
      annual: 1500,
      drop_in: 25,
      basic: 0,
    };
    const amount = planPrices[plan] ?? 0;

    // Compute new expiry
    const current = dbOperations.getUserById(userId);
    const todayISO = new Date().toISOString().split("T")[0];
    const fromISO = current?.membership_expiry && current.membership_expiry > todayISO
      ? current.membership_expiry
      : todayISO;
    const newExpiry = addMonths(fromISO, months);

    // Update user membership fields
    dbOperations.updateUser(userId, {
      membership_status: "active",
      membership_expiry: newExpiry,
    });

    // Record a payment entry (best-effort)
    try {
      db.prepare(
        `INSERT INTO payments (user_id, amount, payment_type, payment_method, description, status)
         VALUES (?, ?, ?, ?, ?, 'completed')`
      ).run(userId, amount, "membership", method, `Manual payment (${plan})`);
    } catch {
      // swallow insert errors
    }

    return NextResponse.json({ success: true, newExpiry });
  } catch (error) {
    console.error("Error marking membership paid:", error);
    return NextResponse.json({ error: "Failed to mark paid" }, { status: 500 });
  }
}


