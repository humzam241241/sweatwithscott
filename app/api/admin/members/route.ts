import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { dbOperations } from "@/lib/database";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");
  if (!sessionCookie) return null;
  try {
    return JSON.parse(sessionCookie.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const users = dbOperations.getAllUsers();
    const today = new Date().toISOString().split("T")[0];
    const planPrices: Record<string, number> = {
      monthly: 150,
      annual: 1500,
      drop_in: 25,
      basic: 0,
    };
    const members = users.map((u: any) => ({
      id: u.id,
      full_name: u.full_name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      plan: u.membership_type,
      start_date: u.created_at,
      next_payment_due: u.membership_expiry,
      subscription_status: u.membership_status,
      next_payment_amount: planPrices[u.membership_type] || 0,
      overdue:
        u.membership_expiry &&
        u.membership_expiry < today &&
        u.membership_status === "active",
    }));
    return NextResponse.json(members);
  } catch (err) {
    console.error("Error fetching members:", err);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 },
    );
  }
}
